from django.core.management.base import BaseCommand
from Apps.models import User, UserRole, Student, Lecturer, Administrator

class Command(BaseCommand):
    help = 'Updates existing users with correct roles'

    def handle(self, *args, **kwargs):
        try:
            # Get or create roles
            student_role, _ = UserRole.objects.get_or_create(
                role_name='student',
                defaults={'is_verified': True}
            )
            Lecturer_role, _ = UserRole.objects.get_or_create(
                role_name='Lecturer',
                defaults={'is_verified': True}
            )
            admin_role, _ = UserRole.objects.get_or_create(
                role_name='admin',
                defaults={'is_verified': True}
            )

            # Update students
            students_updated = Student.objects.select_related('user').all()
            for student in students_updated:
                student.user.role = student_role
                student.user.save()
            
            # Update Lecturers
            Lecturers_updated = Lecturer.objects.select_related('user').all()
            for Lecturer in Lecturers_updated:
                Lecturer.user.role = Lecturer_role
                Lecturer.user.save()
            
            # Update administrators
            admins_updated = Administrator.objects.select_related('user').all()
            for admin in admins_updated:
                admin.user.role = admin_role
                admin.user.save()
    

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully updated roles for:'
                    f'\n- {students_updated.count()} students'
                    f'\n- {Lecturers_updated.count()} Lecturers'
                    f'\n- {admins_updated.count()} administrators'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating roles: {str(e)}')
            )
