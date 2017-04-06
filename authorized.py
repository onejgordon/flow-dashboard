"""
authorized.py

"""

import django_version
from constants import SITENAME, TAGLINE, AUTHOR_NAME
from datetime import datetime
import base64
from models import User
import logging


def role(role=None):
    def wrapper(handler_method):
        def check_login(self, *args, **kwargs):
            d = {
                'SITENAME': SITENAME,
                'TAGLINE': TAGLINE,
                'AUTHOR_NAME': AUTHOR_NAME,
                'YEAR': datetime.now().year,
                'CURTIME': datetime.now()
            }
            allow = False
            handled = False
            user = None
            session = self.session
            if 'user' in session:
                user = session['user']
            if not user and role:
                headers = self.request.headers
                if headers:
                    authorization = headers.get('authorization')
                    if authorization and authorization.startswith("Basic "):
                        auth_b64 = authorization.replace('Basic ','')
                        user_pass = base64.b64decode(auth_b64)
                        if user_pass:
                            _user_id, _pass = user_pass.split(':')
                            if _user_id and _pass:
                                if _user_id.isdigit():
                                    # Interpret as User ID
                                    user = User.get_by_id(int(_user_id))
                                elif '@' in _user_id:
                                    # Interpret as user amil
                                    user = User.GetByEmail(_user_id)
                                if user and not user.checkPass(_pass):
                                    user = None
            if not role:
                allow = True
            elif role == "user":
                if user:
                    allow = True
            elif role == "admin":
                if user and user.admin():
                    allow = True
            if not handled:
                if allow:
                    self.user = d['user'] = user
                    d['logout_url'] = "/logout"
                    kwargs['d'] = d
                    handler_method(self, *args, **kwargs)
                else:
                    # Unauthorized
                    self.set_response(success=False, message="Unauthorized", status=401)

        return check_login
    return wrapper
