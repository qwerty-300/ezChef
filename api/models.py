# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

#---------------ADD_RECIPE TABLE---------------#
class AddRecipe(models.Model):
    recipe = models.ForeignKey('Recipe', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)
    cb = models.ForeignKey('Cookbook', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'add_recipe'

#---------------ADMIN TABLE---------------#
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


#---------------CATEGORY TABLE---------------#
class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    r_type = models.CharField(max_length=100, blank=True, null=True)
    r_region = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'category'
    
    def __str__(self):
        if self.r_type and self.r_region:
            return f"{self.r_type} ({self.r_region})"
        if self.r_region:
            return self.r_region
        else:
            return self.r_type
        return f"Category {self.category_id}"

    
#---------------CLIENT TABLE---------------#
class Client(models.Model):
    user = models.ForeignKey('User', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'client'


#---------------COOKBOOK TABLE---------------#
class Cookbook(models.Model):
    cb_id = models.IntegerField(primary_key=True)
    cb_title = models.CharField(max_length=30)
    cb_description = models.TextField(blank=True, null=True)
    num_of_saves = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cookbook'


#---------------IDENTIFIED_BY TABLE---------------#
class IdentifiedBy(models.Model):
    id = models.AutoField(primary_key=True)

    # Identifies a recipe via type and/or region
    recipe = models.ForeignKey(
        'Recipe', db_column='ib_r_id', on_delete=models.CASCADE, 
    )
    category = models.ForeignKey(
        'Category', db_column='ib_c_id', on_delete=models.CASCADE, 
    )

    class Meta:
        managed = False
        db_table = 'identified_by'
        unique_together = (('recipe', 'category'),) 

    
#---------------INCLUDES TABLE---------------#
class Includes(models.Model):
    id = models.AutoField(primary_key=True)
    recipe = models.ForeignKey(
        'Recipe', 
        db_column='inc_r_id',
        on_delete=models.DO_NOTHING, 
        blank=True, 
        null=True
    )

    class Meta:
        managed = False
        db_table = 'includes'


#---------------INGREDIENT TABLE---------------#
class Ingredient(models.Model):
    ingredient_id = models.AutoField(primary_key=True)
    ingredient_name = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'ingredient'

    def __str__(self):
        return self.ingredient_name

    
#---------------NUTRITION TABLE---------------#
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


#---------------QUANTITY TABLE---------------#
class Quantity(models.Model):
    quantity_id = models.IntegerField(primary_key=True)
    quantity_amount = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'quantity'
    
    def __str__(self):
        return str(self.quantity_amount)

    
#---------------RECIPE TABLE---------------#
class Recipe(models.Model):
    recipe_id = models.AutoField(primary_key=True)
    recipe_name = models.CharField(max_length=50)
    recipe_description = models.TextField()
    date_added = models.DateField()
    recipe_difficulty = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )


    category = models.ManyToManyField(
        'Category',
        through='IdentifiedBy',
        related_name='recipes'
    )

    class Meta:
        managed = False
        db_table = 'recipe'


#---------------RECIPE_INGREDIENTS TABLE---------------#
class RecipeIngredients(models.Model):
    id = models.AutoField(primary_key=True)
    ingredient = models.ForeignKey(Ingredient, models.DO_NOTHING)
    quantity = models.ForeignKey(Quantity, models.DO_NOTHING)
    unit = models.ForeignKey('Unit', models.DO_NOTHING, blank=True, null=True)
    recipe = models.ForeignKey(Recipe, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'recipe_ingredients'
        unique_together = (('recipe', 'ingredient', 'quantity'),)


#---------------UNIT TABLE---------------#
class Unit(models.Model):
    unit_id = models.AutoField(primary_key=True)
    unit_name = models.CharField(max_length=50, null=True)
    symbol = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'unit'
    
    def __str__(self):
        return str(self.unit_name)
    

#---------------USER TABLE---------------#
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


#---------------REVIEW TABLE---------------#
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
