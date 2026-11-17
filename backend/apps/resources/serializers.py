from rest_framework import serializers

from apps.accounts.models import User

from .models import Resource, ResourceCategory, ResourceRating


class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = ("id", "name", "slug", "description")


class ResourceUploaderSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ("id", "full_name", "department")


class ResourceRatingSerializer(serializers.ModelSerializer):
    user = ResourceUploaderSerializer(read_only=True)

    class Meta:
        model = ResourceRating
        fields = ("id", "user", "rating", "feedback", "created_at")


class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by = ResourceUploaderSerializer(read_only=True)
    category = ResourceCategorySerializer(read_only=True)
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.ReadOnlyField()
    ratings = ResourceRatingSerializer(read_only=True, many=True)

    class Meta:
        model = Resource
        fields = (
            "id",
            "title",
            "description",
            "category",
            "uploaded_by",
            "subject",
            "resource_type",
            "file",
            "download_count",
            "average_rating",
            "rating_count",
            "ratings",
            "created_at",
        )


class ResourceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ("title", "description", "category", "subject", "resource_type", "file")
