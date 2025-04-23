from django.urls import path
from . import views

urlpatterns = [
    #--------------------RECIPE ENDPOINTS--------------------#
    path('recipes/', views.RecipeList.as_view(), name='recipe-list'),

    #--------------------REVIEW ENDPOINT--------------------#
    path('review/', views.ReviewCreateOrUpdate.as_view(), name='review-create-update'),

    #--------------------COOKBOOK ENDPOINTS--------------------#
    path('cookbooks/', views.CookbookListCreate.as_view(), name='cookbook-list-create'),
    path('cookbooks/<int:pk>/', views.CookbookUpdate.as_view(), name='cookbook-update'),

    #--------------------SUBSCRIPTION ENDPOINT--------------------#
    path('cookbooks/subscribe/', views.SubscribeCookbook.as_view(), name='cookbook-subscribe'),
]

