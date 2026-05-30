import os


class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///civiceye.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AI_SERVICE_URL = os.getenv('AI_SERVICE_URL', 'http://localhost:8000')

    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        ','.join([
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            'http://127.0.0.1:5176',
            'http://127.0.0.1:5177',
        ])
    )
