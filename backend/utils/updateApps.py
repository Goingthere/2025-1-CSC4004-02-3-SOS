import requests
from datetime import datetime
from dateutil.parser import parse
from app.models import AppInfo, AppGenreInfo, AppCategoryInfo, AppTagInfo, AppPriorDiscountInfo, AppPublishersInfo, AppDevelopersInfo
from utils.load_itad_api_key import loadApiKey

def updateAppData(appid):
    app = getSteamInfo(appid)
    if app:
        getTagInfo(app)
    
# Steam 상세 정보 및 DB 저장
def getSteamInfo(appid):
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}&l=koreana"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        appData = data.get(str(appid), {}).get("data")

        if not appData:
            print(f"앱 {appid} 데이터 없음")
            return None

        priceInfo = appData.get("price_overview", {})
        initialPrice = priceInfo.get("initial", 0) // 100
        finalPrice = priceInfo.get("final", 0) // 100
        discountPercent = priceInfo.get("discount_percent", 0)
        currentlyDiscounted = discountPercent > 0 or finalPrice < initialPrice
        appName = appData.get("name")
        releaseDate = parse(appData.get("release_date", {}).get("date", ""), fuzzy=True).date()

        # AppInfo 테이블에 데이터 저장
        app, _ = AppInfo.objects.update_or_create(
            appID=appid,
            defaults={
                "appName": appName,
                "appImage": appData.get("header_image"),
                "releaseDate": releaseDate,
                "isFree": appData.get("is_free", False),
                "type": appData.get("type"),
                "metacriticScore": int(appData.get("metacritic", {}).get("score") or 0),
                "recommendationCount": int(appData.get("recommendations", {}).get("total") or 0),
                "achievementCount": int(appData.get("achievements", {}).get("total") or 0),
                "screenshotCount": int(len(appData.get("screenshots", [])) or 0),
                "requiredAge": int(appData.get("required_age") or 0),
                "init_price": initialPrice,
                "final_price": finalPrice,
                "currentlyDiscounted": currentlyDiscounted,
            }
        )

        # 기존 장르/카테고리 삭제 후 재삽입
        AppGenreInfo.objects.filter(appID=app).delete()
        for genre in appData.get("genres", []):
            AppGenreInfo.objects.create(appID=app, genre=genre.get("description"))

        AppCategoryInfo.objects.filter(appID=app).delete()
        for category in appData.get("categories", []):
            AppCategoryInfo.objects.create(appID=app, category=category.get("description"))
            
        # 개발사/배급사 정보 삭제 후 재삽입
        AppDevelopersInfo.objects.filter(appID=app).delete()
        for dev in appData.get("developers", []):
            AppDevelopersInfo.objects.create(appID=app, developer=dev)

        AppPublishersInfo.objects.filter(appID=app).delete()
        for pub in appData.get("publishers", []):
            AppPublishersInfo.objects.create(appID=app, publisher=pub)

        print(f"App {appid} steam data 저장 완료")
        
        # 할인 이력 데이터 수집 함수 호출
        getItadDiscountHistory(app)
        
        return app

    except Exception as e:
        print(f"App {appid} 저장 실패: {e}")
        return None

def getItadDiscountHistory(appObj):
    apiKey = loadApiKey()
    appID = appObj.appID

    # Step 1: lookup → UUID 획득
    lookupResp = requests.get("https://api.isthereanydeal.com/games/lookup/v1", params={
        "key": apiKey,
        "appid": appID
    }).json()

    if not lookupResp.get("found"):
        print(f"[ITAD] AppID={appID} → plain 변환 실패")
        return

    uuid = lookupResp["game"]["id"]

    # Step 2: 할인 이력 조회
    historyResp = requests.get("https://api.isthereanydeal.com/games/history/v2", params={
        "key": apiKey,
        "id": uuid,
        "country": "US",
        "shops": "61",
        "since": "2010-01-01T00:00:00Z"
    }).json()

    # 타입에 따라 구조 확인 및 events 추출
    if isinstance(historyResp, dict):
        print(f"[DEBUG] historyResp keys: {list(historyResp.keys())}")
        sample = historyResp.get("list", [])
        print(f"[DEBUG] historyResp['list'] sample: {sample[:2]}")
        events = sorted(sample, key=lambda e: e["timestamp"])
    elif isinstance(historyResp, list):
        print(f"[DEBUG] historyResp sample: {historyResp[:2]}")
        events = sorted(historyResp, key=lambda e: e["timestamp"])
    else:
        print(f"[DEBUG] historyResp type: {type(historyResp)}")
        events = []

    print(f"[DEBUG] events count: {len(events)}")
    if not events:
        print(f"{appID} : 할인 이력 없음")
        return

    # Step 3: 기존 기록 삭제
    AppPriorDiscountInfo.objects.filter(appID=appObj).delete()

    periods = []
    percents = []
    prevCut = 0
    curr = None

    for e in events:
        cut = e.get("deal", {}).get("cut", 0)
        try:
            cut = int(float(cut))  # 문자열 "20.0"도 처리 가능
        except (ValueError, TypeError):
            cut = 0

        ts = e["timestamp"]

        if prevCut == 0 and cut > 0:
            curr = {"start": ts, "pct": cut}
        elif prevCut > 0 and cut == 0 and curr:
            curr["end"] = ts
            periods.append((curr["start"], curr["end"]))
            percents.append(curr["pct"])
            curr = None

        prevCut = cut

    # Step 4: 현재 할인 중인 상태 확인
    if curr and "end" not in curr:
        overviewResp = requests.post(
            "https://api.isthereanydeal.com/games/overview/v2",
            params={"key": apiKey, "country": "KR"},
            json=[uuid]
        )
        currentCut = overviewResp.json().get("prices", [{}])[0].get("current", {}).get("cut", 0)
        try:
            currentCut = int(float(currentCut))
        except (ValueError, TypeError):
            currentCut = 0
        if currentCut > 0:
            periods.append((curr["start"], None))
            percents.append(curr["pct"])

    # Step 5: 저장
    for (start, end), pct in zip(periods, percents):
        print(f"[DEBUG] AppID={appObj.appID}")
        print(f"        start={start} ({type(start)}), end={end} ({type(end)}), pct={pct} ({type(pct)})")

        try:
            ds = datetime.fromisoformat(start)
            de = datetime.fromisoformat(end) if end else None

            AppPriorDiscountInfo.objects.create(
                appID=appObj,
                discountStart=ds,
                discountEnd=de,
                discountPercents=pct
            )
        except Exception as e:
            print(f"[ERROR] 저장 실패 for AppID={appObj.appID} → {e}")

    print(f"[ITAD] AppID={appID} 할인 이력 {len(periods)}개 저장 완료")

# 태그 정보 저장
def getTagInfo(appObj):
    appid = appObj.appID
    url = f"https://steamspy.com/api.php?request=appdetails&appid={appid}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        appData = response.json()

        if not appData:
            print(f"앱 {appid} 데이터 없음")
            return
        
        AppTagInfo.objects.filter(appID=appObj).delete()
        for tagName in appData.get("tags", {}):
            AppTagInfo.objects.create(appID=appObj, tag=tagName)
            
        print(f"App {appid} tag data 저장 완료")
        
    except Exception as e:
        print(f"App {appid} 저장 실패: {e}")