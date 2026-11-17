import django_filters

from .models import Resource


class ResourceFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name="category_id")
    resource_type = django_filters.CharFilter(field_name="resource_type")
    subject = django_filters.CharFilter(field_name="subject", lookup_expr="icontains")

    class Meta:
        model = Resource
        fields = ["category", "resource_type", "subject"]
