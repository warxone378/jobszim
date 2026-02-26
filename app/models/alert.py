import json
import os

ALERTS_PATH = os.path.join(os.path.dirname(__file__), '../data/alerts.json')

def get_all_alerts():
    if not os.path.exists(ALERTS_PATH):
        return []
    with open(ALERTS_PATH, 'r') as f:
        return json.load(f)

def save_alert(user_id, keyword, location, frequency='daily'):
    alerts = get_all_alerts()
    new_alert = {
        'id': len(alerts) + 1,
        'user_id': user_id,
        'keyword': keyword,
        'location': location,
        'frequency': frequency,  # daily, weekly, instant
        'active': True
    }
    alerts.append(new_alert)
    with open(ALERTS_PATH, 'w') as f:
        json.dump(alerts, f, indent=2)
    return new_alert

def get_user_alerts(user_id):
    alerts = get_all_alerts()
    return [a for a in alerts if a['user_id'] == user_id]

def delete_alert(alert_id, user_id):
    alerts = get_all_alerts()
    new_alerts = [a for a in alerts if not (a['id'] == alert_id and a['user_id'] == user_id)]
    if len(new_alerts) == len(alerts):
        return False
    with open(ALERTS_PATH, 'w') as f:
        json.dump(new_alerts, f, indent=2)
    return True

def toggle_alert(alert_id, user_id, active):
    alerts = get_all_alerts()
    for a in alerts:
        if a['id'] == alert_id and a['user_id'] == user_id:
            a['active'] = active
            break
    with open(ALERTS_PATH, 'w') as f:
        json.dump(alerts, f, indent=2)
    return True
