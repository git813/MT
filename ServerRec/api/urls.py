from django.urls import path
from . import controllers

urlpatterns =  [
    path('rec-all', controllers.index),
    path('rec-user', controllers.with_user)
] 