import os
import pytest

# Point the app at an in-memory DB *before* importing it, since
# app/__init__.py builds the Flask app and calls db.create_all() at
# import time (it isn't structured as an app factory).
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ.setdefault('SECRET_KEY', 'test-secret-key')

from app import app as flask_app, db  # noqa: E402
from app.models.key import RegistrationKey  # noqa: E402


@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()
        yield client
        with flask_app.app_context():
            db.session.remove()
            db.drop_all()


@pytest.fixture
def registration_key(client):
    """A valid, unused registration key for the register() test."""
    with flask_app.app_context():
        key = RegistrationKey(key=RegistrationKey.generate_key())
        db.session.add(key)
        db.session.commit()
        return key.key
