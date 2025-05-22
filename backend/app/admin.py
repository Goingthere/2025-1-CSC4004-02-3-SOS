from django.contrib import admin

from .models import AppInfo, AppGenreInfo, AppCategoryInfo, AppTagInfo, AppPriorDiscountInfo, AppPredictedDiscountInfo

admin.site.register(AppInfo)
admin.site.register(AppGenreInfo)
admin.site.register(AppCategoryInfo)
admin.site.register(AppTagInfo)
admin.site.register(AppPriorDiscountInfo)
admin.site.register(AppPredictedDiscountInfo)