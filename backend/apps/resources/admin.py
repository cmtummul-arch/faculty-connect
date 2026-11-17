from django.contrib import admin

from .models import Resource, ResourceCategory, ResourceRating


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "subject", "resource_type", "uploaded_by", "download_count", "created_at")
    list_filter = ("resource_type", "category", "subject")
    search_fields = ("title", "subject", "uploaded_by__email")


@admin.register(ResourceRating)
class ResourceRatingAdmin(admin.ModelAdmin):
    list_display = ("resource", "user", "rating", "created_at")
    search_fields = ("resource__title", "user__email")

# Register your models here.
