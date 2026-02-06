from rest_framework import serializers

class ManagementProfileSerializer(serializers.Serializer):
    emp_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    designation = serializers.CharField()
