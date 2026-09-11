from app import app, db
from app.models.user import User

with app.app_context():
    user = User.query.filter_by(username='Warzone').first()
    if user:
        user.is_admin = True
        db.session.commit()
        print(f"✅ User '{user.username}' is now an admin!")
    else:
        print("❌ User 'Warzone' not found.")
