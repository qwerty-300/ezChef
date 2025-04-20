import django_filters
from .models import Recipe

class RecipeFilter(django_filters.FilterSet):
    # Recipe type and region as filters
    r_type = django_filters.CharFilter(field_name='category.r_type')
    r_region = django_filters.CharFilter(field_name='category.r_region')

    class Meta:
        model = Recipe
        fields = ['r_type', 'r_region']