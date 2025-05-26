# 데이터베이스 테이블 구조 정의
# 어떤 정보를 저장할지 클래스 형태로 작성성

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, user_name, email, password=None, **extra_fields):
        if not email:
            raise ValueError('이메일은 필수입니다')
        email = self.normalize_email(email)
        user = self.model(user_name=user_name, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_name, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(user_name, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=128)
    nickname = models.CharField(max_length=20)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    email = models.CharField(max_length=50, unique=True)

    USERNAME_FIELD = 'user_name'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()

class Wishlist(models.Model):
    wishlist_ID = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # user_ID2 → 외래키
    appID = models.PositiveIntegerField()                     # 게임 ID
    added_at = models.DateTimeField(auto_now_add=True)        # 찜한 시각
    wish_percent = models.IntegerField(null=True)             # 희망 할인율
    alert_sent = models.BooleanField(default=False)           # 알림 전송 여부

class SimpleGameDiscount(models.Model):
    gameID = models.AutoField(primary_key=True)
    appID = models.PositiveIntegerField(unique=True, null=False)
    name = models.CharField(max_length=100)  # 예: "게임1"
    discount = models.IntegerField()         # 예: 25 (%)
