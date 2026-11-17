from datetime import datetime

from django.shortcuts import get_object_or_404
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.permissions import IsFaculty, IsStudent
from apps.notifications.models import Notification
from apps.notifications.services import create_notification

from .models import Appointment, ConsultationHour
from .serializers import (
    AppointmentActionSerializer,
    AppointmentCreateSerializer,
    AppointmentSerializer,
    ConsultationHourSerializer,
)
from .services import generate_faculty_slots


class ConsultationHourViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationHourSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsFaculty()]

    def get_queryset(self):
        queryset = ConsultationHour.objects.select_related("faculty")
        faculty_id = self.request.query_params.get("faculty")
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id, is_active=True)
        if self.action in {"update", "partial_update", "destroy"}:
            queryset = queryset.filter(faculty=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(faculty=self.request.user)


class FacultyAvailabilityView(APIView):
    def get(self, request, faculty_id):
        faculty = get_object_or_404(
            User,
            id=faculty_id,
            role=User.Role.FACULTY,
            approval_status=User.ApprovalStatus.APPROVED,
        )
        start_date_raw = request.query_params.get("start_date")
        days = int(request.query_params.get("days", 7))
        start_date = None
        if start_date_raw:
            start_date = datetime.strptime(start_date_raw, "%Y-%m-%d").date()

        return Response(generate_faculty_slots(faculty=faculty, start_date=start_date, days=days))


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        queryset = Appointment.objects.select_related("student", "faculty", "consultation_hour")
        user = self.request.user
        if user.role == User.Role.FACULTY:
            return queryset.filter(faculty=user)
        return queryset.filter(student=user)

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        if self.action in {"accept", "reject", "suggest_alternative"}:
            return AppointmentActionSerializer
        return AppointmentSerializer

    def perform_create(self, serializer):
        appointment = serializer.save()
        create_notification(
            recipient=appointment.faculty,
            title="New appointment request",
            message=f"{appointment.student.full_name} requested a meeting about {appointment.purpose}.",
            kind=Notification.Kind.APPOINTMENT,
            metadata={"appointment_id": appointment.id, "status": appointment.status},
        )

    def create(self, request, *args, **kwargs):
        if request.user.role != User.Role.STUDENT:
            return Response(
                {"detail": "Only student accounts can request appointments."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsFaculty])
    def accept(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            return Response(
                {"detail": "Only pending appointments can be accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment.status = Appointment.Status.ACCEPTED
        appointment.faculty_response = serializer.validated_data.get("faculty_response", "")
        appointment.save(update_fields=["status", "faculty_response", "updated_at"])
        create_notification(
            recipient=appointment.student,
            title="Appointment accepted",
            message=f"{appointment.faculty.full_name} accepted your appointment request.",
            kind=Notification.Kind.APPOINTMENT,
            metadata={"appointment_id": appointment.id, "status": appointment.status},
        )
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsFaculty])
    def reject(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            return Response(
                {"detail": "Only pending appointments can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment.status = Appointment.Status.REJECTED
        appointment.faculty_response = serializer.validated_data.get("faculty_response", "")
        appointment.save(update_fields=["status", "faculty_response", "updated_at"])
        create_notification(
            recipient=appointment.student,
            title="Appointment declined",
            message=f"{appointment.faculty.full_name} declined your request and left a note.",
            kind=Notification.Kind.APPOINTMENT,
            metadata={"appointment_id": appointment.id, "status": appointment.status},
        )
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsFaculty])
    def suggest_alternative(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            return Response(
                {"detail": "Alternative times can only be suggested for pending appointments."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment.status = Appointment.Status.ALTERNATIVE_SUGGESTED
        appointment.faculty_response = serializer.validated_data.get("faculty_response", "")
        appointment.suggested_start = serializer.validated_data["suggested_start"]
        appointment.suggested_end = serializer.validated_data["suggested_end"]
        appointment.save(
            update_fields=[
                "status",
                "faculty_response",
                "suggested_start",
                "suggested_end",
                "updated_at",
            ]
        )
        create_notification(
            recipient=appointment.student,
            title="Alternative time suggested",
            message=f"{appointment.faculty.full_name} suggested a new appointment time.",
            kind=Notification.Kind.APPOINTMENT,
            metadata={"appointment_id": appointment.id, "status": appointment.status},
        )
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsStudent])
    def accept_suggestion(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.ALTERNATIVE_SUGGESTED:
            return Response(
                {"detail": "There is no pending alternative suggestion for this appointment."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        appointment.requested_start = appointment.suggested_start
        appointment.requested_end = appointment.suggested_end
        appointment.suggested_start = None
        appointment.suggested_end = None
        appointment.status = Appointment.Status.ACCEPTED
        appointment.save(
            update_fields=[
                "requested_start",
                "requested_end",
                "suggested_start",
                "suggested_end",
                "status",
                "updated_at",
            ]
        )
        create_notification(
            recipient=appointment.faculty,
            title="Alternative slot accepted",
            message=f"{appointment.student.full_name} accepted the alternative consultation time.",
            kind=Notification.Kind.APPOINTMENT,
            metadata={"appointment_id": appointment.id, "status": appointment.status},
        )
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status in {
            Appointment.Status.REJECTED,
            Appointment.Status.CANCELLED,
            Appointment.Status.COMPLETED,
        }:
            return Response(
                {"detail": "This appointment can no longer be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=["status", "updated_at"])
        other_party = appointment.faculty if request.user == appointment.student else appointment.student
        create_notification(
            recipient=other_party,
            title="Appointment cancelled",
            message=f"{request.user.full_name} cancelled the appointment for {appointment.purpose}.",
            kind=Notification.Kind.APPOINTMENT,
            metadata={"appointment_id": appointment.id, "status": appointment.status},
        )
        return Response(AppointmentSerializer(appointment).data)

# Create your views here.
