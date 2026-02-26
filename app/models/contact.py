import json
import os
from datetime import datetime

CONTACT_PATH = os.path.join(os.path.dirname(__file__), '../data/contact.json')

def get_all_messages():
    if not os.path.exists(CONTACT_PATH):
        return []
    with open(CONTACT_PATH, 'r') as f:
        return json.load(f)

def save_message(name, email, message):
    messages = get_all_messages()
    new_msg = {
        'id': len(messages) + 1,
        'name': name,
        'email': email,
        'message': message,
        'date': datetime.utcnow().isoformat(),
        'read': False
    }
    messages.append(new_msg)
    with open(CONTACT_PATH, 'w') as f:
        json.dump(messages, f, indent=2)
    return new_msg

def mark_as_read(msg_id):
    messages = get_all_messages()
    for msg in messages:
        if msg['id'] == msg_id:
            msg['read'] = True
            break
    with open(CONTACT_PATH, 'w') as f:
        json.dump(messages, f, indent=2)
    return True

def delete_message(msg_id):
    messages = get_all_messages()
    new_msgs = [m for m in messages if m['id'] != msg_id]
    with open(CONTACT_PATH, 'w') as f:
        json.dump(new_msgs, f, indent=2)
    return len(new_msgs) < len(messages)
