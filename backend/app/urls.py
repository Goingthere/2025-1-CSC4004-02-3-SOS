from django.urls import path
from .views import search_form_view, search_result_view

urlpatterns = [
    path('search/', search_form_view, name='search_discount'),
    path('search/result', search_result_view, name='search_result'),
]           