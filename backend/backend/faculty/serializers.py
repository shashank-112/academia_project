from rest_framework import serializers

class FacultyProfileSerializer(serializers.Serializer):
    faculty_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    department = serializers.CharField()
    designation = serializers.CharField()
    qualifications = serializers.CharField()

class FacultyAssignmentSerializer(serializers.Serializer):
    year_id = serializers.IntegerField()
    branch_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    course_id = serializers.CharField()
