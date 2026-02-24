from django.db import models
from django.contrib.auth.hashers import check_password, make_password

class Faculty(models.Model):
    faculty_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    passcode = models.CharField(max_length=255)  # SECURITY: Now stores HASHED passwords
    gender = models.CharField(max_length=10)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    qualifications = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.faculty_id} - {self.first_name} {self.last_name}"
    
    def set_passcode(self, raw_passcode):
        """
        Hash and set the passcode securely.
        
        Usage:
            faculty.set_passcode('mypassword123')
            faculty.save()
        """
        self.passcode = make_password(str(raw_passcode))
    
    def check_passcode(self, raw_passcode):
        """
        Verify a plain text passcode against the hashed one.
        Uses constant-time comparison to prevent timing attacks.
        
        Returns:
            bool: True if passcode matches, False otherwise
        
        Usage:
            if faculty.check_passcode('mypassword123'):
                print("Password correct!")
        """
        if not raw_passcode or not self.passcode:
            return False
        return check_password(str(raw_passcode), self.passcode)

class FacultyAssignment(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='assignments')
    year_id = models.IntegerField()
    branch_id = models.IntegerField()
    section_id = models.IntegerField()
    course_id = models.CharField(max_length=50)
