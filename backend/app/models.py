from django.db import models

# AppInfo 테이블(앱 기본 정보)
class AppInfo(models.Model):
    appID = models.IntegerField(primary_key=True) # 앱 ID
    appName = models.CharField(max_length=100, blank=True, null=True) # 앱 이름
    appImage = models.URLField(blank=True, null=True) # 앱 썸네일 이미지
    releaseDate = models.CharField(max_length=100, blank=True, null=True)  # 출시일
    isFree = models.BooleanField(default=False, blank=True)  # 무료 여부
    type = models.CharField(max_length=20, blank=True, null=True)  # 타입(game / dlc / music 등)
    metacriticScore = models.IntegerField(default=0, blank=True)  # 메타크리틱 점수
    recommendationCount = models.IntegerField(default=0, blank=True)  # 추천 수
    achievementCount = models.IntegerField(default=0, blank=True)  # 업적 수
    screenshotCount = models.IntegerField(default=0, blank=True)  # 스크린샷 수
    requiredAge = models.IntegerField(default=0, blank=True, null=True)  # 최소 권장 나이
    init_price = models.IntegerField(default=0, blank=True, null=True)  # 할인 전 가격
    final_price = models.IntegerField(default=0, blank=True, null=True)  # 할인 후 가격(안 하면 전 가격과 같아야 함)
    currentlyDiscounted = models.BooleanField(default=False, blank=True)  # 현재 할인 중 여부
    
    class Meta:
        db_table = 'app_Info' # 테이블 이름 설정

    def __str__(self):
        return f"{self.appName} ({self.appID})"

# AppGenreInfo 테이블(앱 장르)
class AppGenreInfo(models.Model):
    genre = models.CharField(max_length=100)
    appID = models.ForeignKey(AppInfo, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_genre_info'
        unique_together = ('genre', 'appID')  # 하나의 앱에 같은 장르는 한 번만

    def __str__(self):
        return f"{self.appID.appName} - 장르: {self.genre}"

# AppCategoryInfo 테이블(앱 카테고리)
class AppCategoryInfo(models.Model):
    category = models.CharField(max_length=100)
    appID = models.ForeignKey(AppInfo, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_category_info'
        unique_together = ('category', 'appID')

    def __str__(self):
        return f"{self.appID.appName} - 카테고리: {self.category}"
    
# AppTagInfo 테이블(앱 태그)
class AppTagInfo(models.Model):
    tag = models.CharField(max_length=100)
    appID = models.ForeignKey(AppInfo, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_tag_info'
        unique_together = ('tag', 'appID')

    def __str__(self):
        return f"{self.appID.appName} - 태그: {self.tag}"

# AppDevelopers 테이블(앱 개발사)
class AppDevelopersInfo(models.Model):
    developer = models.CharField(max_length=100)
    appID = models.ForeignKey(AppInfo, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_developers_info'
        unique_together = ('developer', 'appID')

    def __str__(self):
        return f"{self.appID.appName} - developers: {self.developer}"

# AppPublishers 테이블(앱 배급사)
class AppPublishersInfo(models.Model):
    publisher = models.CharField(max_length=100)
    appID = models.ForeignKey(AppInfo, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_publishers_info'
        unique_together = ('publisher', 'appID')

    def __str__(self):
        return f"{self.appID.appName} - publishers: {self.publisher}"
    
# AppPriorDiscountInfo 테이블(앱 과거 할인 정보 이력 테이블)
class AppPriorDiscountInfo(models.Model):
    discountID = models.AutoField(primary_key=True)  # AUTO_INCREMENT
    appID = models.ForeignKey(AppInfo, on_delete=models.CASCADE)  # 앱 ID

    discountStart = models.DateTimeField(blank=True, null=True)  # 할인 시작일자
    discountEnd = models.DateTimeField(blank=True, null=True)    # 할인 종료일자
    discountPercents = models.IntegerField(default=0, blank=True)  # 할인율

    class Meta:
        db_table = 'app_prior_discount_info' # 테이블 이름 설정
        unique_together = ('discountID', 'appID')  # 복합키처럼 동작하게 함

    def __str__(self):
        return f"할인 ID {self.discountID} - 앱 {self.appID.appName}"

# AppPredictedDiscountInfo 테이블(앱 할인 예측 정보 테이블)
class AppPredictedDiscountInfo(models.Model):
    discountResultID = models.AutoField(primary_key=True)  # 자동 증가 PK
    appID = models.ForeignKey(AppInfo, on_delete=models.CASCADE)  # 앱 ID

    predictedDiscountStart = models.DateTimeField(blank=True, null=True)  # 예측 할인 시작일
    predictedDiscountPercents = models.IntegerField(blank=True, null=True)  # 예측 할인율

    class Meta:
        db_table = 'app_predicted_discount_info'

    def __str__(self):
        return f"{self.appID.appName}, 예측 할인 시작일: {self.predictedDiscountStart}, 예측 할인율: {self.predictedDiscountPercents}%"