from django.db import models
from django.contrib.auth.hashers import check_password, make_password

class Student(models.Model):
    student_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10)
    year_id = models.IntegerField()
    branch_id = models.IntegerField()
    sec_id = models.IntegerField()
    roll_no = models.IntegerField()
    phone_no = models.CharField(max_length=15)
    ssc_marks = models.FloatField(null=True, blank=True)
    inter_marks = models.FloatField(null=True, blank=True)
    passcode = models.CharField(max_length=255)  # SECURITY: Now stores HASHED passwords
    
    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"
    
    def set_passcode(self, raw_passcode):
        """
        Hash and set the passcode securely.
        
        Usage:
            student.set_passcode('mypassword123')
            student.save()
        """
        self.passcode = make_password(str(raw_passcode))
    
    def check_passcode(self, raw_passcode):
        """
        Verify a plain text passcode against the hashed one.
        Uses constant-time comparison to prevent timing attacks.
        
        Returns:
            bool: True if passcode matches, False otherwise
        
        Usage:
            if student.check_passcode('mypassword123'):
                print("Password correct!")
        """
        if not raw_passcode or not self.passcode:
            return False
        return check_password(str(raw_passcode), self.passcode)

class StudentAcademic(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='academics')
    semester_id = models.IntegerField()
    course_code = models.CharField(max_length=50)
    marks = models.IntegerField(null=True, blank=True)  # -1 means backlog
    attendance = models.FloatField()
    
    class Meta:
        unique_together = ('student', 'semester_id', 'course_code')

class StudentBacklog(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='backlogs')
    semester_id = models.IntegerField()
    course_id = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ('student', 'semester_id', 'course_id')

class StudentFee(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='fee_info')
    mode_of_admission = models.CharField(max_length=50)
    fee_total = models.IntegerField()
    paid_amount = models.IntegerField()
    remaining_amount = models.IntegerField()
    library_fine = models.IntegerField(default=0)
    equipment_fine = models.IntegerField(default=0)
    paid_crt_fee = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Fee for {self.student.student_id}"

class StudentExamData(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_data')
    year_id = models.IntegerField()
    branch_id = models.IntegerField()
    section_id = models.IntegerField()
    semester_id = models.IntegerField()
    mid_id = models.IntegerField()
    course_id = models.CharField(max_length=50)
    mid_marks = models.IntegerField()
    quiz_marks = models.IntegerField()
    assignment_marks = models.IntegerField()
    
    class Meta:
        unique_together = ('student', 'semester_id', 'mid_id', 'course_id')

class StudentAttendance(models.Model):
    """Store class-wise attendance for each student"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    year_id = models.IntegerField()
    branch_id = models.IntegerField()
    section_id = models.IntegerField()
    semester_id = models.IntegerField()
    course_id = models.CharField(max_length=50)
    # Store attendance for 50 classes as JSON (1=present, 0=absent)
    class_records = models.JSONField(default=list)
    
    class Meta:
        unique_together = ('student', 'semester_id', 'course_id')
    
    def get_total_classes(self):
        """Count total classes conducted (non-null records)"""
        return len([x for x in self.class_records if x is not None])
    
    def get_present_count(self):
        """Count total present classes"""
        return sum([1 for x in self.class_records if x == 1])
    
    def get_absent_count(self):
        """Count total absent classes"""
        return sum([1 for x in self.class_records if x == 0])
    
    def get_attendance_percentage(self):
        """Calculate attendance percentage"""
        total = self.get_total_classes()
        if total == 0:
            return 0
        present = self.get_present_count()
        return (present / total) * 100
