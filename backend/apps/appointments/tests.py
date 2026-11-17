from datetime import datetime, time, timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.notifications.models import Notification

from .models import Appointment, ConsultationHour


class AppointmentCreateTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            first_name="Sara",
            last_name="Student",
            role=User.Role.STUDENT,
            department="Computer Science",
            institution_id="STD-1001",
            approval_status=User.ApprovalStatus.APPROVED,
        )
        self.faculty = User.objects.create_user(
            email="faculty@example.com",
            password="testpass123",
            first_name="Farah",
            last_name="Faculty",
            role=User.Role.FACULTY,
            department="Computer Science",
            institution_id="FAC-1001",
            approval_status=User.ApprovalStatus.APPROVED,
        )
        self.client.force_authenticate(user=self.student)
        self.url = reverse("appointments-list")

    def _aware_datetime(self, target_date, hour, minute=0):
        return timezone.make_aware(datetime.combine(target_date, time(hour, minute)))

    def test_student_can_create_appointment_inside_consultation_hour(self):
        next_date = timezone.localdate() + timedelta(days=1)
        hour = ConsultationHour.objects.create(
            faculty=self.faculty,
            weekday=next_date.weekday(),
            start_time=time(9, 0),
            end_time=time(12, 0),
            slot_duration_minutes=30,
            location="Room A-12",
        )
        requested_start = self._aware_datetime(next_date, 10, 0)
        requested_end = self._aware_datetime(next_date, 10, 30)

        response = self.client.post(
            self.url,
            {
                "faculty_id": self.faculty.id,
                "requested_start": requested_start.isoformat(),
                "requested_end": requested_end.isoformat(),
                "purpose": "Project discussion",
                "note": "Reviewing the final proposal draft.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)

        appointment = Appointment.objects.get()
        self.assertEqual(appointment.student, self.student)
        self.assertEqual(appointment.faculty, self.faculty)
        self.assertEqual(appointment.consultation_hour, hour)
        self.assertEqual(Notification.objects.filter(recipient=self.faculty).count(), 1)

    def test_create_uses_matching_consultation_hour_when_multiple_blocks_exist(self):
        next_date = timezone.localdate() + timedelta(days=2)
        ConsultationHour.objects.create(
            faculty=self.faculty,
            weekday=next_date.weekday(),
            start_time=time(9, 0),
            end_time=time(11, 0),
            slot_duration_minutes=30,
            location="Morning office",
        )
        afternoon_hour = ConsultationHour.objects.create(
            faculty=self.faculty,
            weekday=next_date.weekday(),
            start_time=time(14, 0),
            end_time=time(16, 0),
            slot_duration_minutes=30,
            location="Lab 3",
        )
        requested_start = self._aware_datetime(next_date, 14, 30)
        requested_end = self._aware_datetime(next_date, 15, 0)

        response = self.client.post(
            self.url,
            {
                "faculty_id": self.faculty.id,
                "requested_start": requested_start.isoformat(),
                "requested_end": requested_end.isoformat(),
                "purpose": "Lab feedback",
                "note": "Need guidance on experiment setup.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        appointment = Appointment.objects.get()
        self.assertEqual(appointment.consultation_hour, afternoon_hour)
