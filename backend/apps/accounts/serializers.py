from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "department",
            "institution_id",
            "bio",
            "office_location",
            "approval_status",
            "is_staff",
        )


class FacultyDirectorySerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = (
            "id",
            "full_name",
            "email",
            "department",
            "bio",
            "office_location",
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "department",
            "institution_id",
            "bio",
            "office_location",
        )

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AdminAccountReviewSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + (
            "is_active",
            "date_joined",
            "last_login",
        )
        read_only_fields = fields


class VerifiedTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        credentials = {
            "email": attrs.get("email"),
            "password": attrs.get("password"),
        }
        user = authenticate(**credentials)
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        if not user.is_approved:
            raise serializers.ValidationError(
                "Your account is waiting for faculty/admin verification."
            )

        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }
