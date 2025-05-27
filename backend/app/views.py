import subprocess
import json
import os
from django.conf import settings
from django.shortcuts import render
from .models import AppInfo, AppPriorDiscountInfo, AppGenreInfo, AppCategoryInfo, AppTagInfo, AppPredictedDiscountInfo, AppDevelopersInfo, AppPublishersInfo

def search_form_view(request):
    return render(request, 'search_form.html')  

def search_result_view(request):
    query = request.GET.get('q')
    app = AppInfo.objects.filter(appName__icontains=query).first()
    prior_discounts = []
    predicted_discounts = []

    if app:
        prior_discounts = AppPriorDiscountInfo.objects.filter(appID=app).order_by('-discountStart')
        predicted_discounts = AppPredictedDiscountInfo.objects.filter(appID=app).order_by('predictedDiscountStart')
        
        # 무료거나 현재 할인 중이면 예측 할인 처리 생략
        if app.isFree or app.currentlyDiscounted:
            predicted_discounts = []
        
        else:
            # 과거 할인 이력 구성
            discount_history = prior_discounts
            past_discounts = [
                {
                    'start': d.discountStart.strftime('%Y-%m-%d'),
                    'end': d.discountEnd.strftime('%Y-%m-%d'),
                    'percent': d.discountPercents
                }
                for d in discount_history
                if d.discountStart and d.discountEnd and d.discountPercents is not None
            ]
        
            # 장르, 카테고리, 태그 데이터 하나로 합치기
            genre_list = [g.genre for g in AppGenreInfo.objects.filter(appID=app)]
            category_list = [c.category for c in AppCategoryInfo.objects.filter(appID=app)]
            tag_list = [t.tag for t in AppTagInfo.objects.filter(appID=app)]
            all_labels = [] # 값 넣기 전 빈 상태로 초기화
            all_labels = genre_list + category_list + tag_list  # 리스트 all_labels로 병합
        
            # 개발사 / 배급사 리스트로 가져오기
            developers = [d.developer for d in AppDevelopersInfo.objects.filter(appID=app)]
            publishers = [p.publisher for p in AppPublishersInfo.objects.filter(appID=app)]

            # JSON 데이터 구성
            json_payload = {
                "appid": app.appID,
                "name": app.appName,
                "past_discounts": past_discounts,
                "currently_discounted": currently_discounted,
                "release_date": app.releaseDate if isinstance(app.releaseDate, str)
                                else app.releaseDate.strftime('%Y-%m-%d') if app.releaseDate else None,
                "developers": developers,
                "publishers": publishers,
                "genre_category_tags": all_labels,
                "type": app.type,
                "metacritic_score": app.metacriticScore,
                "recommendation_count": app.recommendationCount,
                "achievement_count": app.achievementCount,
                "screenshot_count": app.screenshotCount,
                "required_age": app.requiredAge,
                "price_krw": app.price
            }

            # JSON 데이터 생성 완료 후
            temp_py_path = os.path.join(settings.BASE_DIR, 'ml_model', 'temp.py')
            json_path = os.path.join(settings.BASE_DIR, 'ml_model', 'input.json')

            # JSON 저장
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(json_payload, f, ensure_ascii=False)

            # subprocess 실행
            subprocess.run(['python', temp_py_path, json_path], check=True)

            # 파일 삭제
            os.remove(json_path)
            
        return render(request, 'search_result.html', {
            'app': app,
            'prior_discounts': prior_discounts,
            'predicted_discounts': predicted_discounts,
        })