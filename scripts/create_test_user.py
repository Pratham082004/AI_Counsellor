from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def create_user(email: str, password: str):
    db = SessionLocal()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print('User already exists:', email)
        print('id:', existing.id)
        return

    user = User(
        email=email,
        password_hash=hash_password(password),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print('Created user:', email)
    print('id:', user.id)


if __name__ == '__main__':
    create_user('testuser@example.com', 'Password123')
