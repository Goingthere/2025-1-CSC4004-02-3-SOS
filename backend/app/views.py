import subprocess
import json
import os
from django.conf import settings
from django.shortcuts import render
from .models import AppInfo, AppPriorDiscountInfo, AppGenreInfo, AppCategoryInfo, AppTagInfo, AppPredictedDiscountInfo, AppDevelopersInfo, AppPublishersInfo
from utils.updateApps import updateAppData

def search_form_view(request):
    return render(request, 'search_form.html')  

def search_result_view(request):
    query = request.GET.get('q')
    app = AppInfo.objects.filter(appName__icontains=query).first()
    updateAppData(app.appID) if app else None  # 앱 정보 업데이트
    priorDiscounts = []
    predictedDiscounts = []
    developers = []
    publishers = []

    if app:
        priorDiscounts = AppPriorDiscountInfo.objects.filter(appID=app).order_by('-discountStart')
        predictedDiscounts = AppPredictedDiscountInfo.objects.filter(appID=app).order_by('predictedDiscountStart')
        
        # 과거 할인 이력 구성
        jsonPriorDiscounts = [
            {
                'start': d.discountStart.strftime('%Y-%m-%d'),
                'end': d.discountEnd.strftime('%Y-%m-%d'),
                'percent': d.discountPercents
            }
            for d in priorDiscounts
            if d.discountStart and d.discountEnd and d.discountPercents is not None
        ]
    
        # 장르, 카테고리, 태그 데이터 하나로 합치기
        genreList = [g.genre for g in AppGenreInfo.objects.filter(appID=app)]
        categoryList = [c.category for c in AppCategoryInfo.objects.filter(appID=app)]
        tagList = [t.tag for t in AppTagInfo.objects.filter(appID=app)]
        allLabels = [] # 값 넣기 전 빈 상태로 초기화
        allLabels = genreList + categoryList + tagList  # 리스트 all_labels로 병합
    
        # 개발사 / 배급사 리스트로 가져오기
        developers = [d.developer for d in AppDevelopersInfo.objects.filter(appID=app)]
        publishers = [p.publisher for p in AppPublishersInfo.objects.filter(appID=app)]
        
        
        # 무료거나 현재 할인 중이면 예측 할인 처리 생략 
        if app.isFree or app.currentlyDiscounted:
            predictedDiscounts = []
        
        else:
            # JSON 데이터 구성
            jsonPayload = {
                "appid": app.appID,
                "name": app.appName,
                "past_discounts": jsonPriorDiscounts,
                "currently_discounted": app.currentlyDiscounted,
                "release_date": app.releaseDate if isinstance(app.releaseDate, str)
                                else app.releaseDate.strftime('%Y-%m-%d') if app.releaseDate else None,
                "developers": developers,
                "publishers": publishers,
                "genre_category_tags": allLabels,
                "type": app.type,
                "metacritic_score": app.metacriticScore,
                "recommendation_count": app.recommendationCount,
                "achievement_count": app.achievementCount,
                "screenshot_count": app.screenshotCount,
                "required_age": app.requiredAge,
                "price_krw": app.init_price
            }

            # JSON 데이터 생성 완료 후
            tempPath = os.path.join(settings.BASE_DIR, 'ml_model', 'temp.py')
            jsonPath = os.path.join(settings.BASE_DIR, 'ml_model', 'input.json')

            # JSON 저장
            with open(jsonPath, 'w', encoding='utf-8') as f:
                json.dump(jsonPayload, f, ensure_ascii=False)

            # subprocess 실행
            subprocess.run(['python', tempPath, jsonPath], check=True)

            # 파일 삭제
            os.remove(jsonPath)
            
        return render(request, 'search_result.html', {
            'app': app,
            'prior_discounts': priorDiscounts,
            'predicted_discounts': predictedDiscounts,
            'developers': developers,
            'publishers': publishers,
        })