from rest_framework.permissions import BasePermission


class IsFaculty(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "faculty"
            and request.user.is_approved
        )


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "student"
            and request.user.is_approved
        )
