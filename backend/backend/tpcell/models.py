from django.db import models

class TPCellEmployee(models.Model):
    emp_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    passcode = models.CharField(max_length=100)
    gender = models.CharField(max_length=10)
    designation = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.emp_id} - {self.first_name} {self.last_name}"
