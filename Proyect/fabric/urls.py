from django.urls import path
from .views import FabricView, render_pdf_view

urlpatterns = [
    path('', FabricView.as_view()),
    path('save_pdf/', render_pdf_view, name="save"),
]