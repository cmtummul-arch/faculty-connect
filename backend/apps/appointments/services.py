from datetime import datetime, timedelta

from django.db.models import Q
from django.utils import timezone

from .models import Appointment, ConsultationHour


ACTIVE_APPOINTMENT_STATUSES = [
    Appointment.Status.PENDING,
    Appointment.Status.ACCEPTED,
    Appointment.Status.ALTERNATIVE_SUGGESTED,
]


def appointment_conflicts(*, faculty, start, end):
    return Appointment.objects.filter(
        faculty=faculty,
        status__in=ACTIVE_APPOINTMENT_STATUSES,
    ).filter(
        Q(requested_start__lt=end, requested_end__gt=start)
        | Q(suggested_start__lt=end, suggested_end__gt=start)
    )


def get_matching_consultation_hour(*, faculty, requested_start, requested_end):
    blocks = ConsultationHour.objects.filter(
        faculty=faculty,
        weekday=requested_start.weekday(),
        is_active=True,
    ).order_by("start_time")
    for block in blocks:
        if (
            block.start_time <= requested_start.time() < block.end_time
            and block.start_time < requested_end.time() <= block.end_time
        ):
            return block
    return None


def is_within_consultation_window(*, faculty, requested_start, requested_end):
    return get_matching_consultation_hour(
        faculty=faculty,
        requested_start=requested_start,
        requested_end=requested_end,
    ) is not None


def generate_faculty_slots(*, faculty, start_date=None, days=7):
    current_date = start_date or timezone.localdate()
    blocks = ConsultationHour.objects.filter(faculty=faculty, is_active=True)
    slots = []

    for offset in range(max(days, 1)):
        slot_date = current_date + timedelta(days=offset)
        day_blocks = blocks.filter(weekday=slot_date.weekday())

        for block in day_blocks:
            current_start = datetime.combine(slot_date, block.start_time)
            current_start = timezone.make_aware(current_start, timezone.get_current_timezone())
            block_end = timezone.make_aware(
                datetime.combine(slot_date, block.end_time),
                timezone.get_current_timezone(),
            )

            while current_start + timedelta(minutes=block.slot_duration_minutes) <= block_end:
                current_end = current_start + timedelta(minutes=block.slot_duration_minutes)
                available = not appointment_conflicts(
                    faculty=faculty,
                    start=current_start,
                    end=current_end,
                ).exists()
                if current_start > timezone.now():
                    slots.append(
                        {
                            "date": slot_date.isoformat(),
                            "start": current_start.isoformat(),
                            "end": current_end.isoformat(),
                            "meeting_mode": block.meeting_mode,
                            "location": block.location,
                            "note": block.note,
                            "available": available,
                        }
                    )
                current_start = current_end

    return slots
