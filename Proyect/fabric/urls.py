from django.urls import path
from .views import FabricView

urlpatterns = [
    path('', FabricView.as_view()),
]