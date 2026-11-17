from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import User

from .models import Appointment, ConsultationHour
from .services import (
    appointment_conflicts,
    get_matching_consultation_hour,
    is_within_consultation_window,
)


class CompactUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ("id", "full_name", "email", "department")


class ConsultationHourSerializer(serializers.ModelSerializer):
    faculty = CompactUserSerializer(read_only=True)

    class Meta:
        model = ConsultationHour
        fields = (
            "id",
            "faculty",
            "weekday",
            "start_time",
            "end_time",
            "slot_duration_minutes",
            "meeting_mode",
            "location",
            "note",
            "is_active",
        )

    def validate(self, attrs):
        if attrs["start_time"] >= attrs["end_time"]:
            raise serializers.ValidationError("End time must be later than start time.")
        return attrs


class AppointmentSerializer(serializers.ModelSerializer):
    student = CompactUserSerializer(read_only=True)
    faculty = CompactUserSerializer(read_only=True)
    consultation_hour = ConsultationHourSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = (
            "id",
            "student",
            "faculty",
            "consultation_hour",
            "requested_start",
            "requested_end",
            "purpose",
            "note",
            "faculty_response",
            "status",
            "suggested_start",
            "suggested_end",
            "created_at",
            "updated_at",
        )


class AppointmentCreateSerializer(serializers.ModelSerializer):
    faculty_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(
            role=User.Role.FACULTY,
            approval_status=User.ApprovalStatus.APPROVED,
        ),
        source="faculty",
    )

    class Meta:
        model = Appointment
        fields = ("faculty_id", "requested_start", "requested_end", "purpose", "note")

    def validate(self, attrs):
        faculty = attrs["faculty"]
        requested_start = attrs["requested_start"]
        requested_end = attrs["requested_end"]
        student = self.context["request"].user

        if requested_start >= requested_end:
            raise serializers.ValidationError("End time must be after the start time.")
        if requested_start <= timezone.now():
            raise serializers.ValidationError("Appointment requests must be scheduled in the future.")
        if not is_within_consultation_window(
            faculty=faculty,
            requested_start=requested_start,
            requested_end=requested_end,
        ):
            raise serializers.ValidationError(
                "Requested time does not match any active faculty consultation hour."
            )
        if appointment_conflicts(faculty=faculty, start=requested_start, end=requested_end).exists():
            raise serializers.ValidationError("That slot is already occupied or under review.")
        if Appointment.objects.filter(
            student=student,
            faculty=faculty,
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.ACCEPTED,
                Appointment.Status.ALTERNATIVE_SUGGESTED,
            ],
            requested_start__date=requested_start.date(),
        ).exists():
            raise serializers.ValidationError(
                "You already have an active appointment request with this faculty member on that date."
            )
        return attrs

    def create(self, validated_data):
        student = validated_data.pop("student", self.context["request"].user)
        faculty = validated_data["faculty"]
        hour = get_matching_consultation_hour(
            faculty=faculty,
            requested_start=validated_data["requested_start"],
            requested_end=validated_data["requested_end"],
        )
        return Appointment.objects.create(
            student=student,
            consultation_hour=hour,
            **validated_data,
        )


class AppointmentActionSerializer(serializers.Serializer):
    faculty_response = serializers.CharField(required=False, allow_blank=True)
    suggested_start = serializers.DateTimeField(required=False)
    suggested_end = serializers.DateTimeField(required=False)

    def validate(self, attrs):
        suggested_start = attrs.get("suggested_start")
        suggested_end = attrs.get("suggested_end")
        if suggested_start or suggested_end:
            if not suggested_start or not suggested_end:
                raise serializers.ValidationError("Both suggested start and end times are required.")
            if suggested_start >= suggested_end:
                raise serializers.ValidationError("Suggested end time must be later than start time.")
        return attrs
