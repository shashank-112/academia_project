from rest_framework import serializers

class StudentAcademicSerializer(serializers.Serializer):
    semester_id = serializers.IntegerField()
    course_code = serializers.CharField()
    marks = serializers.IntegerField()
    attendance = serializers.FloatField()

class StudentBacklogSerializer(serializers.Serializer):
    semester_id = serializers.IntegerField()
    course_id = serializers.CharField()

class StudentProfileSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone_no = serializers.CharField()
    roll_no = serializers.IntegerField()
    year_id = serializers.IntegerField()
    branch_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
