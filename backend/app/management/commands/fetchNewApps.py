import requests
from datetime import datetime
from django.core.management.base import BaseCommand
from app.models import AppInfo, AppGenreInfo, AppCategoryInfo, AppTagInfo, AppPriorDiscountInfo, AppPublishersInfo, AppDevelopersInfo
from utils.load_itad_api_key import loadApiKey

class Command(BaseCommand):
    help = "신작 게임 appID 추출"

    def handle(self, *args, **kwargs):
        steam_app_ids = self.getNewAppIDs()
        # 기존 AppInfo의 appID와 비교하여 기존에 없던 appID만 분류
        existing_app_ids = AppInfo.objects.values_list('appID', flat=True)
        newAppID = [app_id for app_id in steam_app_ids if app_id not in existing_app_ids]

        self.stdout.write(self.style.SUCCESS(f"신규 앱 ID 수: {len(newAppID)}"))
        for appID in newAppID:
            self.stdout.write(f"- 신규 앱 ID: {appID}")
            self.getSteamInfo(appID)
            self.getTagInfo(appID)

    def getNewAppIDs(self):
        url = "https://store.steampowered.com/api/featuredcategories"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            # new_releases 데이터 가져옴
            newReleases = data.get('new_releases', {}).get('items', [])
            newAppID = [item['id'] for item in newReleases] # appID만 추출
            
            return newAppID
        
        except requests.RequestException as e:
            self.stderr.write(f"Steam API 요청 실패: {e}")
            return []
        
    def getSteamInfo(self, appID):
        url = f"https://store.steampowered.com/api/appdetails?appids={appID}&l=koreana"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            appData = data.get(str(appID), {}).get("data")

            if not appData:
                self.stderr.write(f"앱 {appID} 데이터 없음")
                return

            priceInfo = appData.get("price_overview", {})
            initialPrice = priceInfo.get("initial", 0) // 100
            finalPrice = priceInfo.get("final", 0) // 100
            discountPercent = priceInfo.get("discount_percent", 0)
            currentlyDiscounted = discountPercent > 0
            appName = appData.get("name")
            releaseDate = appData.get("release_date", {}).get("date", "")
            app, _ = AppInfo.objects.update_or_create(
                appID=appID,
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
            AppGenreInfo.objects.filter(appID=app).delete()
            for genre in appData.get("genres", []):
                AppGenreInfo.objects.create(appID=app, genre=genre.get("description"))
            AppCategoryInfo.objects.filter(appID=app).delete()
            for category in appData.get("categories", []):
                AppCategoryInfo.objects.create(appID=app, category=category.get("description"))
            AppDevelopersInfo.objects.filter(appID=app).delete()
            for dev in appData.get("developers", []):
                AppDevelopersInfo.objects.create(appID=app, developer=dev)
            AppPublishersInfo.objects.filter(appID=app).delete()
            for pub in appData.get("publishers", []):
                AppPublishersInfo.objects.create(appID=app, publisher=pub)
            self.stdout.write(self.style.SUCCESS(f"App {appID} steam data 저장 완료"))
            self.getItadDiscountHistory(appID)
            self.getTagInfo(appID)
        except Exception as e:
            self.stderr.write(f"App {appID} 저장 실패: {e}")

    def getItadDiscountHistory(self, appID):
        apiKey = loadApiKey()
        try:
            appObj = AppInfo.objects.get(appID=appID)
        except AppInfo.DoesNotExist:
            self.stderr.write(f"AppID={appID} not found")
            return
        lookupResp = requests.get("https://api.isthereanydeal.com/games/lookup/v1", params={
            "key": apiKey,
            "appid": appID
        }).json()
        if not lookupResp.get("found"):
            self.stderr.write(f"[ITAD] AppID={appID} → plain 변환 실패")
            return
        uuid = lookupResp["game"]["id"]
        historyResp = requests.get("https://api.isthereanydeal.com/games/history/v2", params={
            "key": apiKey,
            "id": uuid,
            "country": "US",
            "shops": "61",
            "since": "2010-01-01T00:00:00Z"
        }).json()
        events = sorted(historyResp, key=lambda e: e["timestamp"])
        if not events:
            self.stdout.write(f"{appID} : 할인 이력 없음")
            return
        AppPriorDiscountInfo.objects.filter(appID=appObj).delete()
        periods = []
        percents = []
        prevCut = 0
        curr = None
        for e in events:
            cut = e.get("deal", {}).get("cut", 0)
            try:
                cut = int(float(cut))
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
        self.stdout.write(self.style.SUCCESS(
            f"[ITAD] AppID={appID} 할인 이력 {len(periods)}개 저장 완료"
        ))

    def getTagInfo(self, appID):
        url = f"https://steamspy.com/api.php?request=appdetails&appid={appID}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            appData = response.json()
            if not appData:
                self.stderr.write(f"앱 {appID} 데이터 없음")
                return
            AppTagInfo.objects.filter(appID=appID).delete()
            for tagName in appData.get("tags", {}):
                AppTagInfo.objects.create(appID=appID, tag=tagName)
            self.stdout.write(self.style.SUCCESS(f"App {appID} tag data 저장 완료"))
        except Exception as e:
            self.stderr.write(f"App {appID} 저장 실패: {e}")