# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AddRecipe(models.Model):
    recipe = models.ForeignKey('Recipe', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)
    cb = models.ForeignKey('Cookbook', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'add_recipe'


class Admin(models.Model):
    admin = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'admin'


# class AuthGroup(models.Model):
#     name = models.CharField(unique=True, max_length=150)

#     class Meta:
#         managed = False
#         db_table = 'auth_group'


# class AuthGroupPermissions(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
#     permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

#     class Meta:
#         managed = False
#         db_table = 'auth_group_permissions'
#         unique_together = (('group', 'permission'),)


# class AuthPermission(models.Model):
#     name = models.CharField(max_length=255)
#     content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
#     codename = models.CharField(max_length=100)

#     class Meta:
#         managed = False
#         db_table = 'auth_permission'
#         unique_together = (('content_type', 'codename'),)


# class AuthUser(models.Model):
#     password = models.CharField(max_length=128)
#     last_login = models.DateTimeField(blank=True, null=True)
#     is_superuser = models.IntegerField()
#     username = models.CharField(unique=True, max_length=150)
#     first_name = models.CharField(max_length=150)
#     last_name = models.CharField(max_length=150)
#     email = models.CharField(max_length=254)
#     is_staff = models.IntegerField()
#     is_active = models.IntegerField()
#     date_joined = models.DateTimeField()

#     class Meta:
#         managed = False
#         db_table = 'auth_user'


# class AuthUserGroups(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     user = models.ForeignKey(AuthUser, models.DO_NOTHING)
#     group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

#     class Meta:
#         managed = False
#         db_table = 'auth_user_groups'
#         unique_together = (('user', 'group'),)


# class AuthUserUserPermissions(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     user = models.ForeignKey(AuthUser, models.DO_NOTHING)
#     permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

#     class Meta:
#         managed = False
#         db_table = 'auth_user_user_permissions'
#         unique_together = (('user', 'permission'),)


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    r_type = models.CharField(max_length=100, blank=True, null=True)
    r_region = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'category'
        unique_together = (('r_type', 'r_region'),)


class Client(models.Model):
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'client'


class Cookbook(models.Model):
    cb_id = models.IntegerField(primary_key=True)
    cb_title = models.CharField(max_length=30)
    cb_description = models.TextField(blank=True, null=True)
    num_of_saves = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cookbook'


class IdentifiedBy(models.Model):
    ib_r = models.ForeignKey('Recipe', models.DO_NOTHING, blank=True, null=True)
    ib_c = models.ForeignKey(Category, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'identified_by'


class Includes(models.Model):
    inc_r = models.ForeignKey('Recipe', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'includes'


class Ingredient(models.Model):
    ingredient_id = models.AutoField(primary_key=True)
    ingredient_name = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'ingredient'


class Nutrition(models.Model):
    nutrition_id = models.AutoField(primary_key=True)
    protein_count = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    calorie_count = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    ingredient = models.ForeignKey(Ingredient, models.DO_NOTHING, blank=True, null=True)
    unit = models.ForeignKey('Unit', models.DO_NOTHING)
    serving_size = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'nutrition'


class Quantity(models.Model):
    quantity_id = models.IntegerField(primary_key=True)
    quantity_amount = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'quantity'


class Recipe(models.Model):
    recipe_id = models.AutoField(primary_key=True)
    recipe_name = models.CharField(max_length=50)
    recipe_description = models.TextField()
    date_added = models.DateTimeField(blank=True, null=True)
    recipe_difficulty = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'recipe'


class RecipeIngredients(models.Model):
    pk = models.CompositePrimaryKey('recipe_id', 'ingredient_id', 'quantity_id')
    recipe = models.ForeignKey(Recipe, models.DO_NOTHING)
    ingredient = models.ForeignKey(Ingredient, models.DO_NOTHING)
    quantity = models.ForeignKey(Quantity, models.DO_NOTHING)
    unit = models.ForeignKey('Unit', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'recipe_ingredients'
        unique_together = (('recipe', 'ingredient', 'quantity'),)


class Unit(models.Model):
    unit_id = models.AutoField(primary_key=True)
    unit_name = models.CharField(max_length=50, blank=True, null=True)
    symbol = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'unit'


class User(models.Model):
    username = models.CharField(unique=True, max_length=20)
    password = models.CharField(max_length=255)
    f_name = models.CharField(max_length=15)
    l_name = models.CharField(max_length=15)
    date_of_birth = models.DateField(blank=True, null=True)
    email = models.CharField(unique=True, max_length=40)

    class Meta:
        managed = False
        db_table = 'user'


class Review(models.Model):
    review = models.ForeignKey('User', models.DO_NOTHING)
    user_id = models.IntegerField()
    recipe = models.ForeignKey('Recipe', models.DO_NOTHING)
    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'review'
        unique_together = (('user_id', 'recipe'),)
