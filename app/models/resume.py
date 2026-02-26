import json
import os
from datetime import datetime

RESUMES_PATH = os.path.join(os.path.dirname(__file__), '../data/resumes.json')

def get_all_resumes():
    if not os.path.exists(RESUMES_PATH):
        return []
    with open(RESUMES_PATH, 'r') as f:
        return json.load(f)

def get_user_resume(user_id):
    resumes = get_all_resumes()
    return next((r for r in resumes if r['user_id'] == user_id), None)

def save_resume(user_id, data):
    resumes = get_all_resumes()
    existing = get_user_resume(user_id)
    if existing:
        existing.update(data)
        existing['updated'] = datetime.utcnow().isoformat()
    else:
        data['user_id'] = user_id
        data['id'] = len(resumes) + 1
        data['created'] = datetime.utcnow().isoformat()
        data['updated'] = data['created']
        resumes.append(data)
    with open(RESUMES_PATH, 'w') as f:
        json.dump(resumes, f, indent=2)
    return data
