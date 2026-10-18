import os
import json
import sys
from pathlib import Path
from urllib import request as urlrequest

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import django

django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
user = User.objects.filter(username='santhoshkannan').first()
if not user:
    raise SystemExit('missing test user')

refresh_token = str(RefreshToken.for_user(user))
refresh_request = urlrequest.Request(
    'http://127.0.0.1:8000/api/auth/token/refresh/',
    data=json.dumps({'refresh': refresh_token}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST',
)

with urlrequest.urlopen(refresh_request, timeout=15) as response:
    refresh_body = json.loads(response.read().decode('utf-8'))
    print('refresh_status', response.status)
    print('refresh_body_keys', sorted(refresh_body.keys()))

access_token = refresh_body.get('access')
profile_request = urlrequest.Request(
    'http://127.0.0.1:8000/api/auth/profile/',
    headers={'Authorization': f'Bearer {access_token}'},
    method='GET',
)

with urlrequest.urlopen(profile_request, timeout=15) as response:
    profile_body = json.loads(response.read().decode('utf-8'))
    print('profile_status', response.status)
    print('profile_username', profile_body.get('username'))
