from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
import os
from sqlalchemy import inspect, text

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()

# Create the Flask app directly
app = Flask(__name__, static_folder='../client/public', static_url_path='')

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'your-email@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'your-app-password')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME', 'your-email@gmail.com')

# Initialize extensions with app
db.init_app(app)
login_manager.init_app(app)
mail.init_app(app)
login_manager.login_view = 'auth.login'

# Import blueprints
from app.routes import (
    job_routes, auth_routes, admin_routes, contact_routes, saved_routes,
    application_routes, alert_routes, password_routes, review_routes,
    company_routes, seo_routes, twofa_routes
)

# Register blueprints
app.register_blueprint(job_routes.job_bp)
app.register_blueprint(auth_routes.auth_bp)
app.register_blueprint(admin_routes.admin_bp)
app.register_blueprint(contact_routes.contact_bp)
app.register_blueprint(saved_routes.saved_bp)
app.register_blueprint(application_routes.application_bp)
app.register_blueprint(alert_routes.alert_bp)
app.register_blueprint(password_routes.password_bp)
app.register_blueprint(review_routes.review_bp)
app.register_blueprint(company_routes.company_bp)
app.register_blueprint(seo_routes.seo_bp)
app.register_blueprint(twofa_routes.twofa_bp)

# Create database tables and add missing columns
with app.app_context():
    db.create_all()
    inspector = inspect(db.engine)
    columns = [c['name'] for c in inspector.get_columns('user')]
    if 'is_blocked' not in columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN is_blocked BOOLEAN DEFAULT 0'))
        db.session.commit()
        print("Added is_blocked column to user table.")
    if 'company_name' not in columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN company_name VARCHAR(120)'))
    if 'company_logo' not in columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN company_logo VARCHAR(200)'))
    if 'company_description' not in columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN company_description TEXT'))
    if 'website' not in columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN website VARCHAR(200)'))
    if 'otp_secret' not in columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN otp_secret VARCHAR(16)'))
    if 'otp_enabled' not in columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN otp_enabled BOOLEAN DEFAULT 0'))
    db.session.commit()
    db.create_all()

# Routes
@app.route('/job/<int:job_id>')
def job_detail(job_id):
    return send_from_directory(app.static_folder, 'job.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')
