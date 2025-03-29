from django.db import models

# Create your models here.
class Patient(models.Model):  
    patient_id = models.CharField(max_length=50, unique=True)  
    full_name = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True)  
    diseases = models.TextField(blank=True, null=True)  

    def __str__(self):  
        return f"{self.full_name} (ID: {self.patient_id})"