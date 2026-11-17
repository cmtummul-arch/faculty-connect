from datetime import time

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.accounts.models import User
from apps.appointments.models import ConsultationHour
from apps.resources.models import Resource, ResourceCategory


class Command(BaseCommand):
    help = "Create approved demo users, categories, consultation hours, and resources."

    def handle(self, *args, **options):
        faculty, _ = User.objects.get_or_create(
            email="faculty@campus.edu",
            defaults={
                "first_name": "Ayesha",
                "last_name": "Khan",
                "role": User.Role.FACULTY,
                "department": "Computer Science",
                "institution_id": "FAC-101",
                "bio": "Faculty advisor for student consultations and project support.",
                "office_location": "Block A, Room 204",
                "approval_status": User.ApprovalStatus.APPROVED,
            },
        )
        faculty.set_password("DemoPass123!")
        faculty.save()

        student, _ = User.objects.get_or_create(
            email="student@campus.edu",
            defaults={
                "first_name": "Ali",
                "last_name": "Raza",
                "role": User.Role.STUDENT,
                "department": "Software Engineering",
                "institution_id": "STU-501",
                "bio": "Student account for testing appointments and the swap hub.",
                "approval_status": User.ApprovalStatus.APPROVED,
            },
        )
        student.set_password("DemoPass123!")
        student.save()

        categories = [
            ("Lecture Notes", "Curated lecture notes and summaries."),
            ("Books", "Reference books and solved examples."),
            ("Past Papers", "Exam preparation material."),
        ]

        created_categories = []
        for name, description in categories:
            category, _ = ResourceCategory.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name, "description": description},
            )
            created_categories.append(category)

        consultation_blocks = [
            (0, time(10, 0), time(12, 0)),
            (2, time(14, 0), time(16, 0)),
        ]
        for weekday, start_time, end_time in consultation_blocks:
            ConsultationHour.objects.get_or_create(
                faculty=faculty,
                weekday=weekday,
                start_time=start_time,
                end_time=end_time,
                defaults={
                    "slot_duration_minutes": 30,
                    "location": "Office / Google Meet",
                    "meeting_mode": ConsultationHour.MeetingMode.HYBRID,
                    "note": "Bring your course outline or project questions.",
                },
            )

        resource, created = Resource.objects.get_or_create(
            title="Data Structures Quick Revision Notes",
            uploaded_by=student,
            defaults={
                "description": "Compact revision notes for arrays, stacks, queues, trees, and graphs.",
                "category": created_categories[0],
                "subject": "Data Structures",
                "resource_type": Resource.ResourceType.NOTES,
            },
        )
        if created or not resource.file:
            content = ContentFile(
                b"Sample study material for the Faculty Appointment and Swap Hub project.",
                name="data-structures-notes.txt",
            )
            resource.file.save("data-structures-notes.txt", content, save=True)

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
