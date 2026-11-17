from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ResourceFilter
from .models import Resource, ResourceCategory, ResourceRating
from .serializers import (
    ResourceCategorySerializer,
    ResourceRatingSerializer,
    ResourceSerializer,
    ResourceWriteSerializer,
)


class ResourceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.select_related("uploaded_by", "category").prefetch_related("ratings")
    search_fields = ("title", "description", "subject", "uploaded_by__first_name", "uploaded_by__last_name")
    filterset_class = ResourceFilter
    ordering_fields = ("created_at", "download_count", "title")

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ResourceWriteSerializer
        return ResourceSerializer

    def get_queryset(self):
        return Resource.objects.select_related("uploaded_by", "category").prefetch_related("ratings")

    def perform_update(self, serializer):
        resource = self.get_object()
        if self.request.user != resource.uploaded_by and not self.request.user.is_staff:
            raise permissions.PermissionDenied("Only the uploader can edit this resource.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.uploaded_by and not self.request.user.is_staff:
            raise permissions.PermissionDenied("Only the uploader can delete this resource.")
        instance.delete()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        resource = self.get_object()
        serializer = ResourceRatingSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        rating, _ = ResourceRating.objects.update_or_create(
            resource=resource,
            user=request.user,
            defaults=serializer.validated_data,
        )
        return Response(ResourceRatingSerializer(rating).data)

    @action(detail=True, methods=["post"])
    def increment_download(self, request, pk=None):
        resource = self.get_object()
        resource.download_count += 1
        resource.save(update_fields=["download_count"])
        return Response({"download_count": resource.download_count}, status=status.HTTP_200_OK)

# Create your views here.
