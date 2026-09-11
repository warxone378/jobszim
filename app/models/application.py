import json
import os
from datetime import datetime

APPLICATIONS_PATH = os.path.join(os.path.dirname(__file__), '../data/applications.json')

def get_all_applications():
    if not os.path.exists(APPLICATIONS_PATH):
        return []
    with open(APPLICATIONS_PATH, 'r') as f:
        return json.load(f)

def save_application(job_id, user_id, message, cv_filename=None):
    apps = get_all_applications()
    new_app = {
        'id': len(apps) + 1,
        'job_id': job_id,
        'user_id': user_id,
        'message': message,
        'cv': cv_filename,
        'date': datetime.utcnow().isoformat(),
        'status': 'pending'  # pending, reviewed, rejected
    }
    apps.append(new_app)
    with open(APPLICATIONS_PATH, 'w') as f:
        json.dump(apps, f, indent=2)
    return new_app

def get_applications_for_job(job_id):
    apps = get_all_applications()
    return [a for a in apps if a['job_id'] == job_id]

def get_applications_by_user(user_id):
    apps = get_all_applications()
    return [a for a in apps if a['user_id'] == user_id]

def update_application_status(app_id, status):
    apps = get_all_applications()
    for app in apps:
        if app['id'] == app_id:
            app['status'] = status
            break
    with open(APPLICATIONS_PATH, 'w') as f:
        json.dump(apps, f, indent=2)
    return True
