import django_filters
from .models import Issue

class IssueFilter(django_filters.FilterSet):
    # Filter set to handle filtering issues by reported date range
    reported_date_min = django_filters.DateFilter(
        field_name="reported_date",
        lookup_expr='gte'
    )
    reported_date_max = django_filters.DateFilter(
        field_name="reported_date",
        lookup_expr='lte'
    )


    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'college', 'program', 'year_of_study',
            'semester', 'course_unit', 'course_code', 'category', 'priority'
        ]
