import json


def test_register_requires_valid_key(client):
    resp = client.post('/auth/register', json={
        'username': 'alice', 'email': 'alice@example.com',
        'password': 'password123', 'key': 'not-a-real-key'
    })
    assert resp.status_code == 400
    assert 'Invalid or expired' in resp.get_json()['error']


def test_register_and_login(client, registration_key):
    resp = client.post('/auth/register', json={
        'username': 'alice', 'email': 'alice@example.com',
        'password': 'password123', 'key': registration_key
    })
    assert resp.status_code == 201

    # duplicate username should now be rejected
    dup = client.post('/auth/register', json={
        'username': 'alice', 'email': 'someone-else@example.com',
        'password': 'password123', 'key': registration_key
    })
    assert dup.status_code == 400

    resp = client.post('/auth/login', json={
        'username': 'alice', 'password': 'password123'
    })
    assert resp.status_code == 200
    assert resp.get_json()['user'] == 'alice'


def test_login_wrong_password(client, registration_key):
    client.post('/auth/register', json={
        'username': 'bob', 'email': 'bob@example.com',
        'password': 'correct-password', 'key': registration_key
    })
    resp = client.post('/auth/login', json={
        'username': 'bob', 'password': 'wrong-password'
    })
    assert resp.status_code == 401


def test_status_when_logged_out(client):
    resp = client.get('/auth/status')
    assert resp.status_code == 200
    assert resp.get_json()['logged_in'] is False


def test_logout_requires_login(client):
    resp = client.post('/auth/logout')
    # flask-login redirects/denies unauthenticated access
    assert resp.status_code in (302, 401)
