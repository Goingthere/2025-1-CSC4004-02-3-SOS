from django.contrib import admin
import app.models as models

admin.site.register(models.AppInfo)
admin.site.register(models.AppGenreInfo)
admin.site.register(models.AppCategoryInfo)
admin.site.register(models.AppTagInfo)
admin.site.register(models.AppDevelopersInfo)
admin.site.register(models.AppPublishersInfo)
admin.site.register(models.AppPriorDiscountInfo)
admin.site.register(models.AppPredictedDiscountInfo)