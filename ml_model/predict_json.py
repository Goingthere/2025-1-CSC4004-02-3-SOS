import os
import sys
import json
import pickle
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import MultiLabelBinarizer, RobustScaler
import lightgbm as lgb
from scipy import sparse as sp

# ─── CONFIG ────────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(__file__) or "."
RES_DIR       = os.path.join(BASE_DIR, "resources")             # mlb.pkl, scaler.pkl, publisher_strategy_features.json, group_thresholds.json 폴더
MODEL_DIR     = os.path.join(BASE_DIR, "models")                # 학습된 모델(.txt) 폴더
INPUT_JSON    = os.path.join(BASE_DIR, "input.json")            # 입력 JSON
OUTPUT_JSON   = os.path.join(BASE_DIR, "output.json")           # 출력 JSON

TODAY         = datetime(2025, 4, 27)
MAX_YEARS     = 3
WINDOW_DAYS   = 60
STRIDE_DAYS   = 7

MLB_PATH      = os.path.join(RES_DIR, "mlb.pkl")
SCALER_PATH   = os.path.join(RES_DIR, "scaler.pkl")
PUB_MAP_PATH  = os.path.join(RES_DIR, "publisher_strategy_features.json")
THRESH_PATH   = os.path.join(RES_DIR, "group_thresholds.json")

SELECTED_TAGS = [
    "다운로드 가능한 콘텐츠",
    "인디",
    "가족 공유",
    "Steam 트레이딩 카드",
    "싱글 플레이어"
]
NUM_COLS      = [
    "metacritic_score",
    "achievement_count",
    "screenshot_count",
    "required_age",
    "price_krw",
    "recent_review_count",
    "total_review_count"
]
Q_LIST        = [0.1, 0.5, 0.9]

# ─── RESOURCE LOAD ────────────────────────────────────────────────────────
with open(MLB_PATH, "rb") as f:
    mlb: MultiLabelBinarizer = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler: RobustScaler = pickle.load(f)

try:
    with open(PUB_MAP_PATH, "r", encoding="utf-8") as f:
        pub_map = json.load(f)
except FileNotFoundError:
    pub_map = {}

with open(THRESH_PATH, "r", encoding="utf-8") as f:
    t           = json.load(f)
    med_f, med_s = t["med_f"], t["med_s"]

keep_idx = [i for i, tg in enumerate(mlb.classes_) if tg in SELECTED_TAGS]

# ─── HELPERS ─────────────────────────────────────────────────────────────
def to_dt(x):
    try:
        return datetime.fromisoformat(x)
    except:
        return None

def load_events(lst):
    ev = []
    for blk in lst:
        try:
            s = datetime.fromisoformat(blk["start"])
            e = datetime.fromisoformat(blk["end"])
            r = float(blk.get("percent", 0)) / 100.0
            ev.append((s, e, r))
        except:
            pass
    return sorted(ev, key=lambda x: x[0])

def summarize(win):
    flag = win[:, 0].astype(bool)
    rate = win[:, 1]
    if flag.any():
        last   = int(np.where(flag)[0].max())
        recent = (np.arange(WINDOW_DAYS) >= last - 7) & flag
        return np.array([
            WINDOW_DAYS - 1 - last,
            int(flag.sum()),
            float(rate[flag].mean()),
            float(rate[flag].max()),
            float(rate[recent].mean() if recent.any() else rate[flag].mean())
        ], dtype=np.float32)
    return np.zeros(5, dtype=np.float32)

def make_summary(rel_dt, events):
    if rel_dt is None:
        return np.zeros(5, dtype=np.float32)
    start = max(rel_dt, TODAY - timedelta(days=MAX_YEARS * 365))
    span  = (TODAY - start).days + 1
    tl    = np.zeros((WINDOW_DAYS, 2), dtype=np.float32)
    off   = max(WINDOW_DAYS - span, 0)
    for s, e, r in events:
        if e < rel_dt or s > TODAY:
            continue
        a = max(s, start)
        b = min(e, TODAY)
        for d in range((a - start).days, (b - start).days + 1):
            idx = off + d
            if 0 <= idx < WINDOW_DAYS:
                tl[idx, 0] = 1
                tl[idx, 1] = r
    return summarize(tl)

# ─── PREDICT ONE ─────────────────────────────────────────────────────────
def predict_one(js):
    rel_dt = to_dt(js.get("release_date"))
    events = load_events(js.get("past_discounts", []))
    events = [ev for ev in events if ev[0] >= rel_dt]

    # 그룹 판단
    if rel_dt and len(events) >= 2:
        days_alive = (TODAY - rel_dt).days
        freq = len(events) / (days_alive / 365) if days_alive > 0 else np.nan
        starts = np.diff([s for s, _, _ in events]).astype("timedelta64[D]").astype(int)
        iv   = float(np.std(starts, ddof=1)) if len(starts) > 0 else np.nan
    else:
        freq = iv = np.nan

    grp = int((not np.isnan(freq)) and (not np.isnan(iv)) and (freq < med_f) and (iv > med_s))

    # publisher score
    pub_score = float(pub_map.get(js.get("publishers", [None])[0], 0.0))

    # numeric features
    num_vals   = np.log1p(np.array([float(js.get(c, 0) or 0) for c in NUM_COLS], dtype=np.float32)).reshape(1, -1)
    num_feats  = scaler.transform(num_vals)

    # tag 5차원
    tag_full = mlb.transform([js.get("genre_category_tags", [])])
    tag_vec  = tag_full[:, keep_idx]  # (1,5)

    # summary 5차원
    summ = make_summary(rel_dt, events).reshape(1, -1)  # (1,5)

    # static 14차원
    static = np.hstack([
        [[pub_score]],
        [[grp]],
        num_feats,
        summ
    ])

    # 최종 입력
    X = sp.hstack([tag_vec, sp.csr_matrix(static)], format="csr")

    # ── days-to-discount 예측 (퀀타일 3개)
    days_pred = {}
    for a in Q_LIST:
        fpath = os.path.join(MODEL_DIR, f"group{grp}_days_q{a:.1f}_model.txt")
        if os.path.exists(fpath):
            days_pred[f"{a:.1f}"] = float(lgb.Booster(model_file=fpath).predict(X)[0])
        else:
            days_pred[f"{a:.1f}"] = None

    # ── next_discount_rate 예측 → saleRate
    rate_path = os.path.join(MODEL_DIR, f"group{grp}_rate_model.txt")
    if os.path.exists(rate_path):
        saleRate = round(float(lgb.Booster(model_file=rate_path).predict(X)[0]), 1)
    else:
        saleRate = None

    # 가치 판단: 할인적고 표준편차 높으면0, 아니면 1
    isWorthy = 0 if grp == 1 else 1

    # 최종 반환
    result = {
        "appid": js.get("appid"),
        "isWorthy": isWorthy,
        "predictions": days_pred,
        "saleRate": saleRate
    }
    return result

# ─── MAIN ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    in_path = sys.argv[1] if len(sys.argv) >= 2 else INPUT_JSON
    if not os.path.exists(in_path):
        print("❌ input JSON not found:", in_path)
        sys.exit(1)

    with open(in_path, "r", encoding="utf-8") as f:
        js = json.load(f)

    out = predict_one(js)
    print(json.dumps(out, ensure_ascii=False, indent=2))

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("→ output.json 저장 완료:", OUTPUT_JSON)
