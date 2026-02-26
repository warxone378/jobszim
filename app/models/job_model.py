import json
import os

JOBS_PATH = os.path.join(os.path.dirname(__file__), '../data/jobs.json')

def get_all_jobs():
    with open(JOBS_PATH, 'r') as f:
        return json.load(f)

def get_job_by_id(job_id):
    jobs = get_all_jobs()
    return next((job for job in jobs if job['id'] == job_id), None)

def create_job(job_data):
    jobs = get_all_jobs()
    new_id = max([j['id'] for j in jobs], default=0) + 1
    job_data['id'] = new_id
    job_data['status'] = 'pending'          # <-- new jobs are pending
    jobs.append(job_data)
    with open(JOBS_PATH, 'w') as f:
        json.dump(jobs, f, indent=2)
    return job_data

def update_job(job_id, updated_data):
    jobs = get_all_jobs()
    for i, job in enumerate(jobs):
        if job['id'] == job_id:
            updated_data['id'] = job_id
            updated_data['posted_by'] = job.get('posted_by')
            jobs[i] = updated_data
            with open(JOBS_PATH, 'w') as f:
                json.dump(jobs, f, indent=2)
            return jobs[i]
    return None

def delete_job(job_id):
    jobs = get_all_jobs()
    new_jobs = [job for job in jobs if job['id'] != job_id]
    if len(new_jobs) == len(jobs):
        return False
    with open(JOBS_PATH, 'w') as f:
        json.dump(new_jobs, f, indent=2)
    return True
