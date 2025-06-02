# save_resources.py
import os
import json
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import MultiLabelBinarizer, RobustScaler

# ─── 상수 및 파일 경로 정의 ───────────────────────────────────────────────
TODAY = datetime(2025, 4, 27)
MAX_YEARS = 5
WINDOW_DAYS = 145
STRIDE_DAYS = 7

GAME_CSV = "all_notFree_proc.csv"
PUB_CSV = "publisher_strategy_features.csv"
OUT_DIR = "."  # 원하는 저장 폴더로 변경 가능

# 저장 파일 이름
MLB_PATH = os.path.join(OUT_DIR, "mlb.pkl")
SCALER_PATH = os.path.join(OUT_DIR, "scaler.pkl")
PUB_SCORE_JSON = os.path.join(OUT_DIR, "publisher_score_map.json")
GROUP_THRESH_JSON = os.path.join(OUT_DIR, "group_thresholds.json")
CONFIG_JSON = os.path.join(OUT_DIR, "config.json")


# ─── 1) 태그 One-Hot 인코더 저장 ────────────────────────────────────────────
df = pd.read_csv(GAME_CSV, low_memory=False)
df["tags_list"] = df["game_info"].fillna("").astype(str).str.split("|")
mlb = MultiLabelBinarizer(sparse_output=True)
mlb.fit(df["tags_list"])
with open(MLB_PATH, "wb") as f:
    pickle.dump(mlb, f)


# ─── 2) 숫자형 피처 스케일러 저장 ───────────────────────────────────────────
NUM_COLS = [
    "metacritic_score", "achievement_count", "screenshot_count",
    "required_age", "price_krw", "recent_review_count", "total_review_count"
]
nums = df[NUM_COLS].apply(pd.to_numeric, errors="coerce").fillna(0).astype(float)
nums_log = np.log1p(nums.values)
scaler = RobustScaler().fit(nums_log)
with open(SCALER_PATH, "wb") as f:
    pickle.dump(scaler, f)


# ─── 3) 퍼블리셔 전략 점수 사전 저장 ─────────────────────────────────────────
def inv_scale(col):
    return 1 - (col - col.min()) / (col.max() - col.min())

pub_df = pd.read_csv(PUB_CSV, low_memory=False)
pub_df["publisher_strategy_score"] = (
    inv_scale(pub_df["discounts_per_year_std"]) +
    inv_scale(pub_df["avg_discount_interval_std"])
) / 2
publisher_score_map = {
    str(pub): float(score)
    for pub, score in zip(
        pub_df["publisher"].astype(str),
        pub_df["publisher_strategy_score"].astype(float)
    )
}
with open(PUB_SCORE_JSON, "w", encoding="utf-8") as f:
    json.dump(publisher_score_map, f, ensure_ascii=False, indent=2)


# ─── 4) 그룹 기준값(중앙값) 계산 후 저장 ───────────────────────────────────────
def to_dt(x):
    try:
        return pd.to_datetime(x).to_pydatetime()
    except:
        return None

def load_events_csv(periods, percents):
    if not periods or periods in ("[]", "nan"):
        return []
    import ast, re
    try:
        blocks = ast.literal_eval(periods)
    except:
        blocks = json.loads(re.sub(r'""', '"', periods))
    rates = [float(p)/100 for p in (percents or "").split("|") if p]
    rates += [rates[-1] if rates else 0.0] * (len(blocks) - len(rates))
    ev = []
    for (s, e), r in zip(blocks, rates):
        try:
            ev.append((datetime.fromisoformat(s), datetime.fromisoformat(e), r))
        except:
            pass
    return sorted(ev, key=lambda x: x[0])

df["release_date"] = df["release_date"].apply(to_dt)
ev_lists = [
    load_events_csv(p, str(q) if pd.notna(q) else "")
    for p, q in zip(df["discount_periods"], df["discount_percents"])
]

freqs, stds = [], []
for rd, ev in zip(df["release_date"], ev_lists):
    if rd is None or len(ev) < 2:
        freqs.append(np.nan)
        stds.append(np.nan)
    else:
        days_alive = (TODAY - rd).days
        freqs.append(len(ev) / (days_alive / 365) if days_alive > 0 else np.nan)
        starts = [s for s, _, _ in ev]
        stds.append(
            float(
                np.std(
                    np.diff(starts).astype("timedelta64[D]").astype(int),
                    ddof=1
                )
            )
        )
df["discounts_per_year"] = freqs
df["interval_std"] = stds

med_f = float(df["discounts_per_year"].median(skipna=True))
med_s = float(df["interval_std"].median(skipna=True))
thresholds = {"med_f": med_f, "med_s": med_s}
with open(GROUP_THRESH_JSON, "w", encoding="utf-8") as f:
    json.dump(thresholds, f, ensure_ascii=False, indent=2)


# ─── 5) 설정 파일 저장 ─────────────────────────────────────────────────────
config = {
    "today": TODAY.isoformat(),
    "max_years": MAX_YEARS,
    "window_days": WINDOW_DAYS,
    "stride_days": STRIDE_DAYS
}
with open(CONFIG_JSON, "w", encoding="utf-8") as f:
    json.dump(config, f, ensure_ascii=False, indent=2)


print("저장 완료:")
print(f"  - 태그 인코더: {MLB_PATH}")
print(f"  - 스케일러: {SCALER_PATH}")
print(f"  - 퍼블리셔 점수 맵: {PUB_SCORE_JSON}")
print(f"  - 그룹 기준값: {GROUP_THRESH_JSON}")
print(f"  - 설정 파일: {CONFIG_JSON}")
