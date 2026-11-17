from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AccountApprovalView,
    CurrentUserView,
    FacultyDirectoryView,
    LoginView,
    PendingAccountListView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("faculty/", FacultyDirectoryView.as_view(), name="faculty-directory"),
    path("admin/accounts/pending/", PendingAccountListView.as_view(), name="pending-accounts"),
    path(
        "admin/accounts/<int:pk>/<str:action>/",
        AccountApprovalView.as_view(),
        name="account-approval",
    ),
]
