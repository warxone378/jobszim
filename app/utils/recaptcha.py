import requests
import os

def verify_recaptcha(response_token):
    secret = os.environ.get('RECAPTCHA_SECRET_KEY')
    if not secret:
        print("RECAPTCHA_SECRET_KEY not set")
        return False
    payload = {
        'secret': secret,
        'response': response_token
    }
    try:
        r = requests.post('https://www.google.com/recaptcha/api/siteverify', data=payload)
        result = r.json()
        return result.get('success', False)
    except:
        return False
