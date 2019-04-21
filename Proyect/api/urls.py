from django.urls import path
from .views import ListGamesView

urlpatterns = [
    path('get/', ListGamesView.as_view()),
    path('save/', ListGamesView.as_view()),
]
