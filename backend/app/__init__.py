from flask import Flask
from .config import Config
from .extensions import db, cors
from .routes.health_routes import health_bp
from .routes.complaint_routes import complaint_bp
from .routes.admin_routes import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app, origins=[origin.strip() for origin in app.config['CORS_ORIGINS'].split(',')])
    db.init_app(app)

    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(complaint_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    with app.app_context():
        db.create_all()

    @app.get('/')
    def root():
        return {'status': 'ok', 'service': 'civiceye-ai-backend'}

    return app
