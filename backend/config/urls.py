"""
URL configuration for sos project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from user import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # HTML 페이지 라우팅
    path('', views.home, name='home'),
    path('signup/', views.signup_form, name='signup_form'),
    path('main/', views.mainpage, name='mainpage'),
    path('mypage/', views.mypage, name='mypage'),
    path('login_result/', views.login_result, name='login_result'),
    path('edit_profile/', views.edit_profile_page, name='edit_profile_page'),
    path('find_id/', views.find_id_page, name='find_id_page'),
    path('find_password/', views.find_password_page, name='find_password_page'),
    path('change_password/', views.change_password_page, name='change_password_page'),
    path('wishlist/', views.wishlist_page, name='wishlist_page'),
    path('test_alert/', views.test_alert_trigger),

    # JWT API 라우팅
    path('api/login/', views.LoginView.as_view(), name='api_login'),         # access + refresh 발급
    path('api/protected/', views.ProtectedView.as_view(), name='api_protected'),  # 로그인 인증 확인용 API
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # refresh → access 재발급
    path('api/signup/', views.RegisterView.as_view(), name='api_signup'),
    path('api/mypage/', views.MypageView.as_view(), name='api_mypage'),  # 마이페이지 확인용
    path('api/delete_user/', views.DeleteUserView.as_view(), name='delete_user'),  # 회원 탈퇴용
    path('api/edit_profile/', views.EditProfileView.as_view(), name='edit_profile_api'),  # 회원 정보 수정용
    path('api/find_id/', views.FindIDView.as_view(), name='find_id_api'),  # 아이디 찾기용
    path('api/find_password/', views.FindPasswordView.as_view(), name='find_password_api'),  # 비밀번호 찾기용
    path('api/change_password/', views.ChangePasswordView.as_view(), name='change_password_api'),  # 비밀번호 변경용
    path('api/check_username/', views.CheckUsernameView.as_view(), name='check_username'),  # 유저 아이디 존재 확인용
    path('api/wishlist/', views.WishlistView.as_view(), name='wishlist_api'),  # 위시리스트 보여주기용
    path('api/add_wishlist/', views.AddWishlistView.as_view(), name='add_wishlist_api'),  # 위시리스트 추가용
    path('api/remove_wishlist/', views.RemoveWishlistView.as_view(), name='remove_wishlist'),  # 위시리스트 삭제
    path('api/update_wish_percent/', views.UpdateWishPercentView.as_view(), name='update_wish_percent'),  # 위시리스트 수정
    path('api/simple_discounts/', views.SimpleDiscountListView.as_view(), name='simple_discount_list'),  # 메인페이지 게임 출력
    
]




