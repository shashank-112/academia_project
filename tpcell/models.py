from django.db import models
from django.contrib.auth.hashers import check_password, make_password

class TPCellEmployee(models.Model):
    emp_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    passcode = models.CharField(max_length=255)  # SECURITY: Now stores HASHED passwords
    gender = models.CharField(max_length=10)
    designation = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.emp_id} - {self.first_name} {self.last_name}"
    
    def set_passcode(self, raw_passcode):
        """
        Hash and set the passcode securely.
        
        Usage:
            tpcell.set_passcode('mypassword123')
            tpcell.save()
        """
        self.passcode = make_password(str(raw_passcode))
    
    def check_passcode(self, raw_passcode):
        """
        Verify a plain text passcode against the hashed one.
        Uses constant-time comparison to prevent timing attacks.
        
        Returns:
            bool: True if passcode matches, False otherwise
        
        Usage:
            if tpcell.check_passcode('mypassword123'):
                print("Password correct!")
        """
        if not raw_passcode or not self.passcode:
            return False
        return check_password(str(raw_passcode), self.passcode)
