"""
One-off script: resets the password for the 'Warzone' admin account.
Run once with `python reset_admin_password.py`, then delete this file —
don't leave a plaintext password sitting in your repo history.
"""
from app import app, db
from app.models.user import User

NEW_PASSWORD = "Tale2007t"

with app.app_context():
    user = User.query.filter_by(username='Warzone').first()
    if user:
        user.set_password(NEW_PASSWORD)
        db.session.commit()
        print(f"✅ Password for '{user.username}' has been reset.")
    else:
        print("❌ User 'Warzone' not found.")
