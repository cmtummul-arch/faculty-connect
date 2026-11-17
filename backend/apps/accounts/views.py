from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    AdminAccountReviewSerializer,
    FacultyDirectorySerializer,
    RegisterSerializer,
    UserSerializer,
    VerifiedTokenObtainPairSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VerifiedTokenObtainPairSerializer


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class FacultyDirectoryView(generics.ListAPIView):
    serializer_class = FacultyDirectorySerializer

    def get_queryset(self):
        return User.objects.filter(
            role=User.Role.FACULTY,
            approval_status=User.ApprovalStatus.APPROVED,
            is_active=True,
        ).order_by("first_name", "last_name")


class PendingAccountListView(generics.ListAPIView):
    serializer_class = AdminAccountReviewSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return (
            User.objects.filter(
                approval_status=User.ApprovalStatus.PENDING,
                is_staff=False,
            )
            .order_by("-date_joined")
        )


class AccountApprovalView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk, action):
        user = get_object_or_404(User, pk=pk, is_staff=False)
        if action == "approve":
            user.approval_status = User.ApprovalStatus.APPROVED
        elif action == "reject":
            user.approval_status = User.ApprovalStatus.REJECTED
        else:
            return Response(
                {"detail": "Unsupported account action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.save(update_fields=["approval_status"])
        return Response(AdminAccountReviewSerializer(user).data, status=status.HTTP_200_OK)

# Create your views here.
