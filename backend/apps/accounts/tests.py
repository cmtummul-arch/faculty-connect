from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


def create_user(email, institution_id, **extra_fields):
    defaults = {
        "password": "DemoPass123!",
        "first_name": "Demo",
        "last_name": "User",
        "role": User.Role.STUDENT,
        "department": "Computer Science",
        "approval_status": User.ApprovalStatus.PENDING,
    }
    defaults.update(extra_fields)
    return User.objects.create_user(
        email=email,
        institution_id=institution_id,
        **defaults,
    )


class AdminAccountReviewTests(APITestCase):
    def setUp(self):
        self.admin = create_user(
            email="admin@campus.edu",
            institution_id="ADM-001",
            role=User.Role.FACULTY,
            approval_status=User.ApprovalStatus.APPROVED,
            is_staff=True,
        )
        self.faculty = create_user(
            email="faculty@campus.edu",
            institution_id="FAC-001",
            role=User.Role.FACULTY,
            approval_status=User.ApprovalStatus.APPROVED,
        )
        self.pending_student = create_user(
            email="pending@campus.edu",
            institution_id="STD-001",
        )

    def test_staff_can_list_pending_accounts(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("pending-accounts"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], self.pending_student.email)

    def test_non_staff_cannot_list_pending_accounts(self):
        self.client.force_authenticate(user=self.faculty)

        response = self.client.get(reverse("pending-accounts"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_can_approve_pending_account(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse(
                "account-approval",
                kwargs={"pk": self.pending_student.pk, "action": "approve"},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.pending_student.refresh_from_db()
        self.assertEqual(
            self.pending_student.approval_status,
            User.ApprovalStatus.APPROVED,
        )
