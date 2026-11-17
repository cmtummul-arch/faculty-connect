from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, ConsultationHourViewSet, FacultyAvailabilityView

router = DefaultRouter()
router.register("consultation-hours", ConsultationHourViewSet, basename="consultation-hours")
router.register("", AppointmentViewSet, basename="appointments")

urlpatterns = [
    path("faculty/<int:faculty_id>/available-slots/", FacultyAvailabilityView.as_view(), name="faculty-slots"),
]
urlpatterns += router.urls
