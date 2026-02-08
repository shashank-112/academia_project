from django.db import models
from django.db.models import Func, F, Q
from django.core.files.storage import default_storage
from students.models import Student
from faculty.models import Faculty
import os


class Assignment(models.Model):
    """
    Assignment Model - Upgraded with date/time tracking
    
    Attributes:
        assignment_id: Unique identifier (auto-generated)
        student: ForeignKey to Student
        year_id: Year of the student
        branch_id: Branch of the student
        section_id: Section of the student
        faculty: ForeignKey to Faculty (instructor)
        course_id: Course code
        assignment_pdf: PDF file uploaded by student
        submitted_at: Timestamp when submitted
        marks_awarded: Marks given by faculty (NULL if not graded)
        graded_at: Timestamp when graded (NULL if not graded)
    """
    
    assignment_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignments')
    year_id = models.IntegerField()
    branch_id = models.IntegerField()
    section_id = models.IntegerField()
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='student_assignments')
    course_id = models.CharField(max_length=50)
    assignment_pdf = models.FileField(
        upload_to='assignments/%Y/%m/%d/',
        null=True,
        blank=True
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    marks_awarded = models.IntegerField(null=True, blank=True)  # NULL = not graded
    graded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'faculty', 'course_id')
        ordering = ['-submitted_at', '-created_at']
        indexes = [
            models.Index(fields=['student', '-submitted_at']),
            models.Index(fields=['faculty', '-submitted_at']),
            models.Index(fields=['course_id']),
            models.Index(fields=['marks_awarded']),
        ]
    
    def __str__(self):
        return f"Assignment: {self.student.student_id} - {self.course_id} by {self.faculty.faculty_id}"
    
    @property
    def status(self):
        """
        Returns the status of the assignment
        'not_submitted': No record or file not uploaded
        'submitted': Uploaded but not graded
        'graded': Graded with marks
        """
        if not self.assignment_pdf:
            return 'not_submitted'
        elif self.marks_awarded is None:
            return 'submitted'
        else:
            return 'graded'
    
    @property
    def file_name(self):
        """Returns the PDF file name"""
        if self.assignment_pdf:
            return os.path.basename(self.assignment_pdf.name)
        return None
    
    @property
    def file_size(self):
        """Returns file size in KB"""
        if self.assignment_pdf and self.assignment_pdf.size:
            return round(self.assignment_pdf.size / 1024, 2)
        return None
    
    @property
    def is_graded(self):
        """Check if assignment is graded"""
        return self.marks_awarded is not None and self.graded_at is not None
    
    @property
    def is_submitted(self):
        """Check if assignment is submitted"""
        return self.assignment_pdf is not None and self.submitted_at is not None
