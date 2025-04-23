from django.contrib import admin
from .models import (
  Category, 
  User, 
  Recipe, 
  RecipeIngredients, 
  Ingredient, 
  Quantity, 
  Unit, 
  Nutrition, 
  IdentifiedBy, 
  AddRecipe, 
  Cookbook
)

# Register your models here.
#---------------User Admin---------------#
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'f_name', 'l_name', 'email')

#---------------Category Admin---------------#
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('category_id', 'r_type', 'r_region')
    search_fields = ('r_type', 'r_region')

#---------------Recipe & Inlines---------------# 
class RecipeIngredientsInline(admin.TabularInline):
    model = RecipeIngredients
    extra = 1

class IdentifiedByInline(admin.TabularInline):
    model = IdentifiedBy
    extra = 1
    autocomplete_fields = ('category',)

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('recipe_id', 'recipe_name', 'recipe_difficulty')
    inlines = [RecipeIngredientsInline, IdentifiedByInline]
    exclude = ('category',)

#---------------Ingredient Admin---------------#    
@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('ingredient_id', 'ingredient_name')

#---------------Quantity Admin---------------#    
@admin.register(Quantity)
class QuantityAdmin(admin.ModelAdmin):
    list_display = ('quantity_id', 'quantity_amount')

#---------------Unit Admin---------------#    
@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('unit_id', 'unit_name', 'symbol')

#---------------Nutrition Admin---------------#    
@admin.register(Nutrition)
class NutritionAdmin(admin.ModelAdmin):
    list_display = (
      'nutrition_id', 
      'protein_count', 
      'calorie_count', 
      'ingredient', 
      'unit', 
      'serving_size'
    )

#---------------Cookbook Admin---------------#
class AddRecipeInline(admin.TabularInline):
    model = AddRecipe
    fk_name = 'cb'
    extra = 1
    verbose_name = "Saved Recipe"
    verbose_name_plural = "Saved Recipes"

@admin.register(Cookbook)
class CookbookAdmin(admin.ModelAdmin):
    list_display = ('cb_id', 'cb_title')
    inlines = [AddRecipeInline]
    