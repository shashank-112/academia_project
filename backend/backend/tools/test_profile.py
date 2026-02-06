import sys
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

LOGIN_URL = 'http://localhost:8000/api/users/login/'
PROFILE_URL = 'http://localhost:8000/api/students/profile/'

def post_json(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        resp = urlopen(req)
        return resp.getcode(), json.loads(resp.read().decode())
    except HTTPError as e:
        body = e.read().decode()
        return e.code, body

status, data = post_json(LOGIN_URL, {'email':'4ycsea1@college.edu','password':'1234','role':'student'})
print('login status', status)
if not isinstance(data, dict):
    print('login response not json:', data)
    sys.exit(1)

token = data.get('access')
print('has access token:', bool(token))
if not token:
    sys.exit(1)

def get_with_bearer(url, token):
    req = Request(url, headers={'Authorization': f'Bearer {token}'})
    try:
        resp = urlopen(req)
        return resp.getcode(), resp.read().decode()
    except HTTPError as e:
        body = e.read().decode()
        return e.code, body

status, body = get_with_bearer(PROFILE_URL, token)
print('profile status', status)
print('profile body:', body)









