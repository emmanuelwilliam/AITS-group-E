from django.core.management.base import BaseCommand
from Apps.models import UserRole
from django.db import transaction
from django.db.utils import IntegrityError

class Command(BaseCommand):
    help = 'Creates default user roles'

    @transaction.atomic
    def handle(self, *args, **options):
        # Clear existing roles using raw SQL
        UserRole.objects.raw('DELETE FROM user_roles')
        
        roles = ['student', 'lecturer', 'admin']
        created = []

        for role_name in roles:
            try:
                with transaction.atomic():
                    # Check if role exists first
                    if not UserRole.objects.filter(name=role_name).exists():
                        role = UserRole.objects.create(name=role_name)
                        created.append(role_name)
                        self.stdout.write(
                            self.style.SUCCESS(f'Created role "{role_name}"')
                        )
            except IntegrityError:
                self.stdout.write(
                    self.style.WARNING(f'Role "{role_name}" already exists')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created)} roles: {", ".join(created)}'
            )
        )