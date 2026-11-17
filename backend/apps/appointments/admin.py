from django.contrib import admin

from .models import Appointment, ConsultationHour


@admin.register(ConsultationHour)
class ConsultationHourAdmin(admin.ModelAdmin):
    list_display = (
        "faculty",
        "weekday",
        "start_time",
        "end_time",
        "slot_duration_minutes",
        "meeting_mode",
        "is_active",
    )
    list_filter = ("weekday", "meeting_mode", "is_active", "faculty__department")
    search_fields = ("faculty__email", "faculty__first_name", "faculty__last_name")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("student", "faculty", "requested_start", "requested_end", "status")
    list_filter = ("status", "faculty__department")
    search_fields = ("student__email", "faculty__email", "purpose")

# Register your models here.
