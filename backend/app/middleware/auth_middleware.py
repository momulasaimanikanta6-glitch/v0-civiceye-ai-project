# Placeholder auth middleware

from functools import wraps
from flask import request, jsonify


def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # TODO: implement real auth
        return f(*args, **kwargs)

    return wrapper

