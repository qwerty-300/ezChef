# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

class User(models.Model):
    username = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=255)
    f_name = models.CharField(max_length=15)
    l_name = models.CharField(max_length=15)
    date_of_birth = models.DateField(null=True, blank=True)
    email = models.CharField(max_length=40, unique=True)

    class Meta:
        db_table = 'user'
        managed = False  # Tells Django not to manage this table

class Recipe(models.Model):
    recipe_id = models.AutoField(primary_key=True)
    recipe_name = models.CharField(max_length=50)
    recipe_description = models.TextField()
    date_added = models.DateTimeField(auto_now_add=True)
    recipe_difficulty = models.PositiveSmallIntegerField(null=True)

    class Meta:
        db_table = 'recipe'
        managed = False

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    r_type = models.CharField(max_length=100, null=True)
    r_region = models.CharField(max_length=100, null=True)

    class Meta:
        db_table = 'category'
        managed = False
        unique_together = (('r_type', 'r_region'),)

class Ingredient(models.Model):
    ingredient_id = models.AutoField(primary_key=True)
    ingredient_name = models.CharField(max_length=30)

    class Meta:
        db_table = 'ingredient'
        managed = False

class Unit(models.Model):
    unit_id = models.AutoField(primary_key=True)
    unit_name = models.CharField(max_length=50, null=True)
    symbol = models.CharField(max_length=10, null=True)

    class Meta:
        db_table = 'unit'
        managed = False

class Quantity(models.Model):
    quantity_id = models.IntegerField(primary_key=True)
    quantity_amount = models.IntegerField()

    class Meta:
        db_table = 'quantity'
        managed = False

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, primary_key=True)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.ForeignKey(Quantity, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'recipe_ingredients'
        managed = False
        unique_together = (('recipe', 'ingredient', 'quantity'),)

class Nutrition(models.Model):
    nutrition_id = models.AutoField(primary_key=True)
    protein_count = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    calorie_count = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    serving_size = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'nutrition'
        managed = False

class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review'
        managed = False
        unique_together = (('user', 'recipe'),)

class Cookbook(models.Model):
    cb_id = models.IntegerField(primary_key=True)
    cb_title = models.CharField(max_length=30)
    cb_description = models.TextField(null=True)
    num_of_saves = models.IntegerField(null=True)

    class Meta:
        db_table = 'cookbook'
        managed = False

class IdentifiedBy(models.Model):
    ib_r_id = models.ForeignKey(Recipe, db_column='ib_r_id', on_delete=models.CASCADE)
    ib_c_id = models.ForeignKey(Category, db_column='ib_c_id', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'identified_by'
        managed = False