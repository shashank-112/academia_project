from rest_framework import serializers
from .models import Assignment
from students.models import Student
from faculty.models import Faculty
from django.utils import timezone


class AssignmentListSerializer(serializers.ModelSerializer):
    """Serializer for listing assignments"""
    faculty_name = serializers.SerializerMethodField()
    faculty_email = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_roll_no = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    file_name = serializers.CharField(read_only=True)
    file_size = serializers.CharField(read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'assignment_id', 'course_id', 'faculty_name', 'faculty_email',
            'student_name', 'student_roll_no', 'year_id', 'branch_id', 'section_id',
            'status', 'submitted_at', 'file_name', 'file_size', 'marks_awarded', 'graded_at'
        ]
    
    def get_faculty_name(self, obj):
        return f"{obj.faculty.first_name} {obj.faculty.last_name}"
    
    def get_faculty_email(self, obj):
        return obj.faculty.email
    
    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"
    
    def get_student_roll_no(self, obj):
        return obj.student.roll_no


class AssignmentDetailSerializer(serializers.ModelSerializer):
    """Serializer for assignment detail view"""
    faculty_name = serializers.SerializerMethodField()
    faculty_email = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_roll_no = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    file_name = serializers.CharField(read_only=True)
    file_size = serializers.CharField(read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'assignment_id', 'course_id', 'faculty_name', 'faculty_email',
            'student_name', 'student_roll_no', 'year_id', 'branch_id', 'section_id',
            'status', 'submitted_at', 'file_name', 'file_size', 'marks_awarded',
            'graded_at', 'created_at', 'updated_at'
        ]
    
    def get_faculty_name(self, obj):
        return f"{obj.faculty.first_name} {obj.faculty.last_name}"
    
    def get_faculty_email(self, obj):
        return obj.faculty.email
    
    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"
    
    def get_student_roll_no(self, obj):
        return obj.student.roll_no


class AssignmentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading/updating assignment"""
    
    class Meta:
        model = Assignment
        fields = ['assignment_pdf']
    
    def update(self, instance, validated_data):
        """Override update to set submitted_at"""
        instance.assignment_pdf = validated_data.get('assignment_pdf', instance.assignment_pdf)
        if not instance.submitted_at and instance.assignment_pdf:
            instance.submitted_at = timezone.now()
        instance.save()
        return instance


class AssignmentGradeSerializer(serializers.ModelSerializer):
    """Serializer for grading assignments"""
    
    class Meta:
        model = Assignment
        fields = ['marks_awarded']
    
    def validate_marks_awarded(self, value):
        """Validate marks are within 0-10 range"""
        if value is not None:
            if not isinstance(value, int) or value < 0 or value > 10:
                raise serializers.ValidationError("Marks must be between 0 and 10")
        return value
    
    def update(self, instance, validated_data):
        """Override update to set graded_at"""
        instance.marks_awarded = validated_data.get('marks_awarded', instance.marks_awarded)
        if instance.marks_awarded is not None and not instance.graded_at:
            instance.graded_at = timezone.now()
        instance.save()
        return instance


class StudentAssignmentCardSerializer(serializers.ModelSerializer):
    """Serializer for student assignment cards"""
    faculty_name = serializers.SerializerMethodField()
    faculty_email = serializers.CharField(source='faculty.email', read_only=True)
    faculty_id = serializers.IntegerField(source='faculty.faculty_id', read_only=True)
    status = serializers.CharField(read_only=True)
    is_graded = serializers.BooleanField(read_only=True)
    is_submitted = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'assignment_id', 'course_id', 'faculty_id', 'faculty_name', 'faculty_email', 'status',
            'is_submitted', 'is_graded', 'submitted_at', 'marks_awarded', 'graded_at'
        ]
    
    def get_faculty_name(self, obj):
        return f"{obj.faculty.first_name} {obj.faculty.last_name}"


class FacultyAssignmentOverviewSerializer(serializers.Serializer):
    """Serializer for faculty assignment overview/statistics"""
    total_assignments = serializers.IntegerField()
    pending_grading = serializers.IntegerField()
    graded = serializers.IntegerField()
