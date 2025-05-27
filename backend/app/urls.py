from django.urls import path
from .views import search_form_view, search_result_view

urlpatterns = [
    path('search/', search_form_view, name='search_discount'), # 임시 게임 검색 view 함수 연결
    path('search/result', search_result_view, name='search_result'), # 게임 검색 결과 화면 데이터 전달 view 함수 연결
]           