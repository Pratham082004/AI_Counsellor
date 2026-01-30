from sqlalchemy import inspect, text
from app.db.session import engine
from app.db.base import Base
from app.models import user, profile, university, shortlist  # 👈 import model
from app.models.ai_university import AIUniversityResult
from app.models.locked_university import LockedUniversity
from app.models.application_checklist import ApplicationChecklist
from app.models.cached_recommendation import CachedRecommendation
from app.models.application_document import ApplicationDocument, SOPDraft
from app.models.ai_counsellor_chat import AICounsellorChat


def run_migrations():
    """Run database migrations for new columns."""
    inspector = inspect(engine)
    
    # Migration for universities table
    university_columns = [c['name'] for c in inspector.get_columns('universities')]
    
    if 'generated_by_ai' not in university_columns:
        print("Adding 'generated_by_ai' column to universities table...")
        with engine.connect() as conn:
            conn.execute(text("""
                ALTER TABLE universities 
                ADD COLUMN generated_by_ai BOOLEAN NOT NULL DEFAULT FALSE
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_universities_generated_by_ai 
                ON universities (generated_by_ai)
            """))
            conn.commit()
        print("Successfully added 'generated_by_ai' column!")
    else:
        print("Column 'generated_by_ai' already exists. Skipping migration.")
    
    # Migration for shortlists table - add is_locked column
    shortlist_columns = [c['name'] for c in inspector.get_columns('shortlists')]

    if 'is_locked' not in shortlist_columns:
        print("Adding 'is_locked' column to shortlists table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE shortlists ADD COLUMN is_locked BOOLEAN DEFAULT FALSE"))
            conn.commit()
        print("Successfully added 'is_locked' column!")

    # Migration for profiles table - add new onboarding fields
    profile_columns = [c['name'] for c in inspector.get_columns('profiles')]

    new_profile_columns = [
        'first_name', 'last_name', 'mobile_number', 'gpa',
        'ielts_score', 'toefl_score', 'gre_score', 'gmat_score',
        'sop_status', 'lor_status', 'target_intake', 'funding_plan'
    ]
    
    for col in new_profile_columns:
        if col not in profile_columns:
            print(f"Adding '{col}' column to profiles table...")
            with engine.connect() as conn:
                if col in ['first_name', 'last_name']:
                    conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col} VARCHAR NOT NULL DEFAULT ''"))
                elif col in ['ielts_score', 'toefl_score', 'gpa']:
                    conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col} FLOAT"))
                elif col in ['gre_score', 'gmat_score']:
                    conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col} INTEGER"))
                elif col in ['mobile_number', 'target_intake', 'funding_plan']:
                    conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col} VARCHAR"))
                elif col in ['sop_status', 'lor_status']:
                    conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col} VARCHAR DEFAULT 'NOT_STARTED'"))
                conn.commit()
            print(f"Successfully added '{col}' column!")
        else:
            print(f"Column '{col}' already exists. Skipping.")


def init_db():
    Base.metadata.create_all(bind=engine)
    run_migrations()
    print("Database initialized!")

if __name__ == "__main__":
    init_db()
