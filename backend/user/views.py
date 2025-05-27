# 사용자의 요청에 대해 어떤 동작을 할지 결정
# 실제 기능 구현

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from .models import User, Wishlist, SimpleGameDiscount

# JWT 로그인 API (fetch POST로 요청)
class LoginView(APIView):
    def post(self, request):
        try:
            user_name = request.data.get('user_name')
            password = request.data.get('password')

            if not user_name or not password:
                return Response({'detail': '아이디와 비밀번호는 필수입니다.'}, status=400)

            try:
                user = User.objects.get(user_name=user_name)
            except User.DoesNotExist:
                return Response({'detail': '로그인에 실패하였습니다.'}, status=404)

            if not check_password(password, user.password):
                return Response({'detail': '로그인에 실패하였습니다.'}, status=401)

            # 로그인 시간 저장
            user.last_login_at = timezone.now()
            user.save()
            
            refresh = RefreshToken.for_user(user) # JWT 토큰 발급
            return Response({
                'access': str(refresh.access_token), # access 토큰 (짧은 만료시간)
                'refresh': str(refresh), # refresh 토큰 (재발급용)
                'user_name': user.user_name
            })
        except Exception as e:
            print("LoginView 오류:", e)
            return Response({'detail': '서버 오류'}, status=500)

# 보호된 API 테스트용 뷰
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'message': f'안녕하세요 {request.user.user_name}님!'}, status=200)

class RegisterView(APIView):
    def post(self, request):
        data = request.data
        try:
            User.objects.create(
                user_name=data['user_name'],
                password=make_password(data['password']),
                nickname=data['nickname'],
                email=data['email']
            )
            return Response({'message': '회원가입 성공'}, status=201)
        except:
            return Response({'detail': '회원가입 실패'}, status=400)

class MypageView(APIView):
    permission_classes = [IsAuthenticated] # JWT 토큰 없으면 접근 불가

    def get(self, request):
        user = request.user
        return Response({
            'user_name': user.user_name,
            'nickname': user.nickname,
            'email': user.email,
            'joined_at': user.joined_at,
            'last_login_at': user.last_login_at
        })
    
class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get("password")

        if not password or not check_password(password, user.password):
            return Response({"detail": "비밀번호가 일치하지 않습니다."}, status=401)

        user.delete()
        return Response({"message": "회원 탈퇴 완료"}, status=204)

class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        nickname = request.data.get('nickname')
        email = request.data.get('email')

        if not nickname or not email:
            return Response({'detail': '모든 항목을 입력해주세요.'}, status=400)

        user.nickname = nickname
        user.email = email
        user.save()
        return Response({'message': '수정 완료'}, status=200)

class FindIDView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            return Response({'user_name': user.user_name}, status=200)
        except User.DoesNotExist:
            return Response({'detail': '해당 이메일로 등록된 아이디가 없습니다.'}, status=404)
        
class FindPasswordView(APIView):
    def post(self, request):
        user_name = request.data.get('user_name')
        email = request.data.get('email')

        try:
            user = User.objects.get(user_name=user_name, email=email)
        except User.DoesNotExist:
            return Response({'detail': '일치하는 사용자 정보가 없습니다.'}, status=404)

        # 랜덤 비밀번호 생성
        temp_password = get_random_string(length=8)
        user.password = make_password(temp_password)
        user.save()

        # 이메일 발송
        send_mail(
            subject='[SOS] 임시 비밀번호 안내',
            message=f'임시 비밀번호는 "{temp_password}" 입니다.\n로그인 후 반드시 비밀번호를 변경하세요.',
            from_email='no-reply@example.com',
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': '임시 비밀번호가 발송되었습니다.'}, status=200)
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current = request.data.get('current_password')
        new = request.data.get('new_password')

        if not check_password(current, user.password):
            return Response({'detail': '현재 비밀번호가 틀렸습니다.'}, status=401)

        user.password = make_password(new)
        user.save()
        return Response({'message': '비밀번호가 변경되었습니다.'}, status=200)
    
class CheckUsernameView(APIView):
    def post(self, request):
        user_name = request.data.get('user_name')
        if not user_name:
            return Response({'detail': '아이디를 입력해주세요.'}, status=400)

        if User.objects.filter(user_name=user_name).exists():
            return Response({'detail': '이미 존재하는 아이디입니다.'}, status=409)
        return Response({'message': '사용 가능한 아이디입니다.'}, status=200)
    
class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist = Wishlist.objects.filter(user=request.user)
        data = [
            {
                'appID': item.appID,
                'added_at': item.added_at.isoformat(),  # JS에서 처리할 수 있게 ISO 포맷
                'wish_percent': item.wish_percent
            }
            for item in wishlist
        ]
        return Response(data, status=200)

class AddWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        app_id = request.data.get('appID')

        # 이미 찜했는지 확인
        if Wishlist.objects.filter(user=user, appID=app_id).exists():
            return Response({'detail': '이미 위시리스트에 존재합니다.'}, status=400)

        Wishlist.objects.create(user=user, appID=app_id)
        return Response({'message': '위시리스트에 추가됨'}, status=201)
    
class RemoveWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        app_id = request.data.get('appID')

        try:
            item = Wishlist.objects.get(user=user, appID=app_id)
            item.delete()
            return Response({'message': '위시리스트에서 제거됨'}, status=200)
        except Wishlist.DoesNotExist:
            return Response({'detail': '존재하지 않음'}, status=404)

class UpdateWishPercentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        app_id = request.data.get('appID')
        percent = request.data.get('wish_percent')

        if not (1 <= int(percent) <= 100):
            return Response({'detail': '1~100 사이의 숫자만 입력 가능합니다.'}, status=400)

        try:
            wishlist = Wishlist.objects.get(user=user, appID=app_id)
            wishlist.wish_percent = int(percent)
            wishlist.save()
            return Response({'message': '희망 할인율이 설정되었습니다.'}, status=200)
        except Wishlist.DoesNotExist:
            return Response({'detail': '위시리스트에 존재하지 않습니다.'}, status=404)
        
class SimpleDiscountListView(APIView):
    def get(self, request):
        games = SimpleGameDiscount.objects.all().values('gameID', 'name', 'discount')
        return Response(list(games))
    
def send_discount_alerts():
    wishlists = Wishlist.objects.filter(wish_percent__isnull=False, alert_sent=False)

    for item in wishlists:
        try:
            game = SimpleGameDiscount.objects.get(appID=item.appID)
            if game.discount >= item.wish_percent:
                # 이메일 전송
                send_mail(
                    subject='[SOS] 희망 할인율 도달!',
                    message=f'{game.name}이 희망한 할인율 {item.wish_percent}% 이상으로 할인 중입니다! 현재 할인율은 {game.discount}%입니다.',
                    from_email='no-reply@example.com',
                    recipient_list=[item.user.email],
                    fail_silently=False,
                )

                # 알림 플래그 갱신
                item.alert_sent = True
                item.save()

        except SimpleGameDiscount.DoesNotExist:
            continue

# HTML 렌더링 뷰들
def home(request):
    return render(request, 'main/home.html')

def signup_form(request):
    return render(request, 'main/signup.html')

def mainpage(request):
    return render(request, 'main/mainpage.html')

def mypage(request):
    return render(request, 'main/mypage.html')

def login_result(request):
    message = request.GET.get('msg', '알 수 없는 오류')
    return render(request, 'main/login_result.html', {'message': message})

def edit_profile_page(request):
    return render(request, 'main/edit_profile.html')

def find_id_page(request):
    return render(request, 'main/find_id.html')

def find_password_page(request):
    return render(request, 'main/find_password.html')

def change_password_page(request):
    return render(request, 'main/change_password.html')

def wishlist_page(request):
    return render(request, 'main/wishlist.html')

def test_alert_trigger(request):
    send_discount_alerts()
    return Response({"message": "알림 체크 완료"})

