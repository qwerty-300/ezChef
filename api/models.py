from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class AddRecipe(models.Model):
    pk = models.CompositePrimaryKey('user', 'cb', 'recipe')
    user = models.ForeignKey('User', db_column='user_id', on_delete=models.DO_NOTHING, related_name='saved_recipes')
    recipe = models.ForeignKey('Recipe', db_column='recipe_id', on_delete=models.DO_NOTHING, related_name='in_cookbooks')
    cb = models.ForeignKey('Cookbook', db_column='cb_id', on_delete=models.CASCADE, related_name='entries')

    class Meta:
        managed = False
        db_table = 'add_recipe'
        unique_together = (('user', 'cb', 'recipe'),)


class Admin(models.Model):
    admin = models.OneToOneField('User', models.DO_NOTHING, db_column='admin_id', primary_key=True)

    class Meta:
        managed = False
        db_table = 'admin'


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    r_type = models.CharField(max_length=100, blank=True, null=True)
    r_region = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'category'
        unique_together = (('r_type', 'r_region'),)

    @property
    def cat_name(self):
        parts = [p for p in (self.r_type, self.r_region) if p]
        return ' - '.join(parts) if parts else 'Uncategorized'

    def __str__(self):
        return self.cat_name


class Client(models.Model):
    user = models.ForeignKey('User', models.DO_NOTHING, db_column='user_id', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'client'


class Cookbook(models.Model):
    cb_id = models.IntegerField(primary_key=True)
    cb_title = models.CharField(max_length=30)
    cb_description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(
        'User',
        db_column='creator_id',
        on_delete=models.DO_NOTHING,
        related_name='created_cookbooks',
        blank=True,
        null=True,
    )
    subscribers = models.ManyToManyField(
        'User',
        through='SubscribedCookbook',
        related_name='subscribed_cookbooks',
    )

    class Meta:
        managed = False
        db_table = 'cookbook'


class SubscribedCookbook(models.Model):
    pk = models.CompositePrimaryKey('user', 'cookbook')
    user = models.ForeignKey('User', db_column='user_id', on_delete=models.CASCADE)
    cookbook = models.ForeignKey('Cookbook', db_column='cb_id', on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'subscribed_cookbook'
        unique_together = (('user', 'cookbook'),)


class IdentifiedBy(models.Model):
    pk = models.CompositePrimaryKey('recipe', 'category')
    recipe = models.ForeignKey('Recipe', db_column='ib_r_id', on_delete=models.CASCADE)
    category = models.ForeignKey('Category', db_column='ib_c_id', on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'identified_by'
        unique_together = (('recipe', 'category'),)


class Ingredient(models.Model):
    ingredient_id = models.AutoField(primary_key=True)
    ingredient_name = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'ingredient'

    def __str__(self):
        return self.ingredient_name


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

    def __str__(self):
        return str(self.quantity_amount)


class Recipe(models.Model):
    recipe_id = models.AutoField(primary_key=True)
    recipe_name = models.CharField(max_length=50)
    recipe_description = models.TextField()
    date_added = models.DateTimeField(blank=True, null=True)
    recipe_difficulty = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    category = models.ManyToManyField(
        'Category',
        through='IdentifiedBy',
        related_name='recipes',
    )

    class Meta:
        managed = False
        db_table = 'recipe'

    def __str__(self):
        return self.recipe_name


class RecipeIngredients(models.Model):
    pk = models.CompositePrimaryKey('recipe', 'ingredient', 'quantity')
    ingredient = models.ForeignKey(Ingredient, models.DO_NOTHING)
    quantity = models.ForeignKey(Quantity, models.DO_NOTHING)
    unit = models.ForeignKey('Unit', models.DO_NOTHING, blank=True, null=True)
    recipe = models.ForeignKey(Recipe, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'recipe_ingredients'
        unique_together = (('recipe', 'ingredient', 'quantity'),)


class Unit(models.Model):
    unit_id = models.AutoField(primary_key=True)
    unit_name = models.CharField(max_length=50, null=True)
    symbol = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'unit'

    def __str__(self):
        return str(self.unit_name)


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

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_staff(self):
        return Admin.objects.filter(admin=self).exists()

    @property
    def is_active(self):
        return True

    def get_username(self):
        return self.username


class Review(models.Model):
    review_id = models.AutoField(primary_key=True, db_column='review_id')
    user = models.ForeignKey('User', db_column='user_id', on_delete=models.DO_NOTHING)
    recipe = models.ForeignKey('Recipe', db_column='recipe_id', on_delete=models.DO_NOTHING)
    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'review'
        unique_together = (('user', 'recipe'),)
