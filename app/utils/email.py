from flask_mail import Mail, Message
from flask import current_app

mail = Mail()

def send_email(to, subject, body):
    msg = Message(subject, recipients=[to], body=body)
    mail.send(msg)

def send_async_email(app, to, subject, body):
    with app.app_context():
        send_email(to, subject, body)

def init_mail(app):
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Change as needed
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'your-email@gmail.com'  # Set via env
    app.config['MAIL_PASSWORD'] = 'your-app-password'     # Set via env
    app.config['MAIL_DEFAULT_SENDER'] = 'your-email@gmail.com'
    mail.init_app(app)
