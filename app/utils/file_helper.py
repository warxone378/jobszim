import json
import os

def get_jobs_path():
    return os.path.join(os.path.dirname(__file__), '../data/jobs.json')

def read_jobs():
    with open(get_jobs_path(), 'r') as f:
        return json.load(f)

def write_jobs(jobs):
    with open(get_jobs_path(), 'w') as f:
        json.dump(jobs, f, indent=2)