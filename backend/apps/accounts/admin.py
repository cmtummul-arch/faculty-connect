from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = (
        "email",
        "full_name",
        "role",
        "department",
        "approval_status",
        "is_staff",
    )
    list_filter = ("role", "approval_status", "department", "is_staff")
    search_fields = ("email", "first_name", "last_name", "institution_id")
    readonly_fields = ("date_joined", "last_login")
    fieldsets = (
        (
            None,
            {"fields": ("email", "password")},
        ),
        (
            "Profile",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "role",
                    "department",
                    "institution_id",
                    "bio",
                    "office_location",
                    "approval_status",
                )
            },
        ),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "role",
                    "department",
                    "institution_id",
                    "password1",
                    "password2",
                    "approval_status",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )

# Register your models here.
