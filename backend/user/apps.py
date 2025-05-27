import os
from apscheduler.schedulers.background import BackgroundScheduler
from django.apps import AppConfig
from django.conf import settings
from django.core.mail import send_mail

scheduler = None  # 전역으로 선언하여 중복 실행 방지

# models를 지연 로딩하기 위한 import 위치 조정
def check_discounts():
    from .models import Wishlist, SimpleGameDiscount  # 지연 import

    wishlists = Wishlist.objects.filter(wish_percent__isnull=False, alert_sent=False)

    for item in wishlists:
        try:
            game = SimpleGameDiscount.objects.get(appID=item.appID)
            if game.discount >= item.wish_percent:
                send_mail(
                    subject='[SOS] 희망 할인율 도달!',
                    message=f'{game.name}이 희망한 할인율 {item.wish_percent}% 이상으로 할인 중입니다! 현재 할인율은 {game.discount}%입니다.',
                    from_email='no-reply@example.com',
                    recipient_list=[item.user.email],
                    fail_silently=False,
                )
                item.alert_sent = True
                item.save()
        except SimpleGameDiscount.DoesNotExist:
            continue

class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'

    def ready(self):
        global scheduler
        if settings.DEBUG and os.environ.get('RUN_MAIN') == 'true' and not scheduler: # 중복 방지
            scheduler = BackgroundScheduler()
            scheduler.add_job(check_discounts, 'interval', minutes=1)
            scheduler.start()