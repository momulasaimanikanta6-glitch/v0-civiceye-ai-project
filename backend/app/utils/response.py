def ok(data=None):
    return {'ok': True, 'data': data}


def error(message, status_code=400):
    return {'ok': False, 'error': message}, status_code

