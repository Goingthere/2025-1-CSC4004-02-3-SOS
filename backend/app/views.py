from django.shortcuts import render
from .models import AppInfo, AppPriorDiscountInfo, AppPredictedDiscountInfo

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

    return render(request, 'search_result.html', {
        'app': app,
        'prior_discounts': prior_discounts,
        'predicted_discounts': predicted_discounts,
    })
