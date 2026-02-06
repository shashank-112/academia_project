from django.db import models

class Faculty(models.Model):
    faculty_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    passcode = models.CharField(max_length=100)
    gender = models.CharField(max_length=10)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    qualifications = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.faculty_id} - {self.first_name} {self.last_name}"

class FacultyAssignment(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='assignments')
    year_id = models.IntegerField()
    branch_id = models.IntegerField()
    section_id = models.IntegerField()
    course_id = models.CharField(max_length=50)
