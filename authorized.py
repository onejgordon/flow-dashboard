"""
authorized.py

"""

import django_version
from constants import SITENAME, TAGLINE, AUTHOR_NAME
from datetime import datetime


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
                    d['logout_url'] = "/logout" #users.create_logout_url("/logout")
                    kwargs['d'] = d
                    handler_method(self, *args, **kwargs)

        return check_login
    return wrapper
