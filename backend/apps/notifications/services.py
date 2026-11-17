from .models import Notification


def create_notification(*, recipient, title, message, kind=Notification.Kind.SYSTEM, metadata=None):
    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        kind=kind,
        metadata=metadata or {},
    )
