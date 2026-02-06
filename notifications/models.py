from django.db import models

class Notification(models.Model):
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    )
    
    year_id = models.IntegerField(null=True, blank=True)  # 0 for broadcast
    branch_id = models.IntegerField(null=True, blank=True)  # 0 for broadcast
    section_id = models.IntegerField(null=True, blank=True)  # 0 for broadcast
    semester_id = models.IntegerField(null=True, blank=True)
    student_id = models.IntegerField(null=True, blank=True)  # 0 for broadcast
    
    notification_type = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
