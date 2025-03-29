from django.urls import path
from . import views

urlpatterns = [
    path('', views.patients_handler, name='patients_handler'), # for fetching and adding patients
    path('list/', views.patient_view, name='patients'), # for fetching drug list
    path('generate-report/', views.generate_report, name='generate_report'),
    path('<str:patient_id>/', views.patient_detail, name='patient-detail'),
]