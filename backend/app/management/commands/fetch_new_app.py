import requests
from django.core.management.base import BaseCommand
from app.models import AppInfo

class Command(BaseCommand):
    help = "신작 게임 appID 추출"

    def handle(self, *args, **kwargs):
        steam_app_ids = self.get_new_steam_app_ids()
        # 기존 AppInfo의 appID와 비교하여 
        existing_app_ids = AppInfo.objects.values_list('appID', flat=True)
        newAppID = [app_id for app_id in steam_app_ids if app_id not in existing_app_ids]

        self.stdout.write(self.style.SUCCESS(f"신규 앱 ID 수: {len(newAppID)}"))
        for app_id in newAppID:
            self.stdout.write(f"- 신규 앱 ID: {app_id}")

    def get_new_steam_app_ids(self):
        url = "https://store.steampowered.com/api/featuredcategories"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            # new_releases 데이터 가져옴
            new_releases = data.get('new_releases', {}).get('items', [])
            newAppID = [item['id'] for item in new_releases] # appID만 추출해서 app_ids에 저장
            
            return newAppID
        
        except requests.RequestException as e:
            self.stderr.write(f"Steam API 요청 실패: {e}")
            return []