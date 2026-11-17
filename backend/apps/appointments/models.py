from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class ConsultationHour(models.Model):
    class MeetingMode(models.TextChoices):
        IN_PERSON = "in_person", "In Person"
        ONLINE = "online", "Online"
        HYBRID = "hybrid", "Hybrid"

    WEEKDAY_CHOICES = (
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    )

    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="consultation_hours",
    )
    weekday = models.PositiveSmallIntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.PositiveIntegerField(default=30)
    location = models.CharField(max_length=120, blank=True)
    meeting_mode = models.CharField(
        max_length=20,
        choices=MeetingMode.choices,
        default=MeetingMode.IN_PERSON,
    )
    note = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["faculty__first_name", "weekday", "start_time"]

    def __str__(self):
        return f"{self.faculty.full_name} - {self.get_weekday_display()}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("End time must be later than start time.")
        if self.faculty.role != "faculty":
            raise ValidationError("Consultation hours can only be assigned to faculty users.")


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        ALTERNATIVE_SUGGESTED = "alternative_suggested", "Alternative Suggested"
        COMPLETED = "completed", "Completed"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_appointments",
    )
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="faculty_appointments",
    )
    consultation_hour = models.ForeignKey(
        ConsultationHour,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="appointments",
    )
    requested_start = models.DateTimeField()
    requested_end = models.DateTimeField()
    purpose = models.CharField(max_length=160)
    note = models.TextField(blank=True)
    faculty_response = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    suggested_start = models.DateTimeField(blank=True, null=True)
    suggested_end = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-requested_start", "-created_at"]

    def __str__(self):
        return f"{self.student.full_name} -> {self.faculty.full_name} ({self.status})"

    def clean(self):
        if self.student.role != "student":
            raise ValidationError("Only student accounts can create appointments.")
        if self.faculty.role != "faculty":
            raise ValidationError("Appointments must be assigned to a faculty user.")
        if self.requested_start >= self.requested_end:
            raise ValidationError("Requested end time must be later than start time.")

# Create your models here.
