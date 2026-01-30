from pydantic import BaseModel

class ProfileCreate(BaseModel):
    first_name: str
    last_name: str
    mobile_number: str | None = None
    education_level: str
    major: str
    graduation_year: int
    ielts_score: float | None = None
    toefl_score: float | None = None
    sop_status: str = "NOT_STARTED"
    lor_status: str = "NOT_STARTED"
    target_degree: str
    target_field: str
    target_country: str
    budget_range: str

class OnboardingRequest(BaseModel):
    first_name: str
    last_name: str
    mobile_number: str | None = None
    education_level: str
    major: str
    graduation_year: int
    ielts_score: float | None = None
    toefl_score: float | None = None
    sop_status: str = "NOT_STARTED"
    lor_status: str = "NOT_STARTED"
    target_degree: str
    target_field: str
    target_country: str
    budget_range: str
