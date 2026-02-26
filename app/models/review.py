import json
import os
from datetime import datetime

REVIEWS_PATH = os.path.join(os.path.dirname(__file__), '../data/reviews.json')

def get_all_reviews():
    if not os.path.exists(REVIEWS_PATH):
        return []
    with open(REVIEWS_PATH, 'r') as f:
        return json.load(f)

def add_review(job_id, user_id, rating, comment):
    reviews = get_all_reviews()
    new_review = {
        'id': len(reviews) + 1,
        'job_id': job_id,
        'user_id': user_id,
        'rating': rating,
        'comment': comment,
        'date': datetime.utcnow().isoformat()
    }
    reviews.append(new_review)
    with open(REVIEWS_PATH, 'w') as f:
        json.dump(reviews, f, indent=2)
    return new_review

def get_reviews_for_job(job_id):
    reviews = get_all_reviews()
    return [r for r in reviews if r['job_id'] == job_id]
