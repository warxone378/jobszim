import json
import os

SAVED_PATH = os.path.join(os.path.dirname(__file__), '../data/saved_jobs.json')

def get_saved_jobs():
    if not os.path.exists(SAVED_PATH):
        return []
    with open(SAVED_PATH, 'r') as f:
        return json.load(f)

def save_job(user_id, job_id):
    saved = get_saved_jobs()
    # Check if already saved
    for entry in saved:
        if entry['user_id'] == user_id and entry['job_id'] == job_id:
            return False  # already saved
    saved.append({'user_id': user_id, 'job_id': job_id})
    with open(SAVED_PATH, 'w') as f:
        json.dump(saved, f, indent=2)
    return True

def unsave_job(user_id, job_id):
    saved = get_saved_jobs()
    new_saved = [e for e in saved if not (e['user_id'] == user_id and e['job_id'] == job_id)]
    if len(new_saved) == len(saved):
        return False  # not found
    with open(SAVED_PATH, 'w') as f:
        json.dump(new_saved, f, indent=2)
    return True

def get_user_saved_jobs(user_id):
    saved = get_saved_jobs()
    return [e['job_id'] for e in saved if e['user_id'] == user_id]
