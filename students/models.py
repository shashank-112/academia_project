from django.db import models

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
    passcode = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"

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
