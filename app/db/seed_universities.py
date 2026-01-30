from app.db.session import SessionLocal
from app.models.university import University

db = SessionLocal()

# Comprehensive university database for AI recommendations
universities = [
    # USA Universities - AI/Computer Science
    University(
        name="Stanford University",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=50000,
        tuition_max=60000,
        difficulty="HIGH"
    ),
    University(
        name="Massachu setts Institute of Technology",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=50000,
        tuition_max=55000,
        difficulty="HIGH"
    ),
    University(
        name="Carnegie Mellon University",
        country="USA",
        degree="Masters",
        field="Artificial Intelligence",
        tuition_min=45000,
        tuition_max=52000,
        difficulty="HIGH"
    ),
    University(
        name="University of California Berkeley",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=35000,
        tuition_max=45000,
        difficulty="HIGH"
    ),
    University(
        name="University of Texas Austin",
        country="USA",
        degree="Masters",
        field="Artificial Intelligence",
        tuition_min=20000,
        tuition_max=30000,
        difficulty="MEDIUM"
    ),
    University(
        name="Georgia Institute of Technology",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=30000,
        tuition_max=40000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Washington",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=35000,
        tuition_max=45000,
        difficulty="MEDIUM"
    ),
    University(
        name="Arizona State University",
        country="USA",
        degree="Masters",
        field="Artificial Intelligence",
        tuition_min=15000,
        tuition_max=25000,
        difficulty="LOW"
    ),
    University(
        name="University of Central Florida",
        country="USA",
        degree="Masters",
        field="Artificial Intelligence",
        tuition_min=12000,
        tuition_max=20000,
        difficulty="LOW"
    ),
    University(
        name="Northeastern University",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=35000,
        tuition_max=45000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Southern California",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=45000,
        tuition_max=55000,
        difficulty="MEDIUM"
    ),
    University(
        name="New York University",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=40000,
        tuition_max=50000,
        difficulty="MEDIUM"
    ),
    University(
        name="Boston University",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=35000,
        tuition_max=45000,
        difficulty="LOW"
    ),
    University(
        name="University of Illinois Chicago",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=18000,
        tuition_max=28000,
        difficulty="LOW"
    ),
    University(
        name="University of Colorado Boulder",
        country="USA",
        degree="Masters",
        field="Computer Science",
        tuition_min=25000,
        tuition_max=35000,
        difficulty="LOW"
    ),
    # UK Universities
    University(
        name="University of Oxford",
        country="UK",
        degree="Masters",
        field="Computer Science",
        tuition_min=35000,
        tuition_max=45000,
        difficulty="HIGH"
    ),
    University(
        name="University of Cambridge",
        country="UK",
        degree="Masters",
        field="Computer Science",
        tuition_min=35000,
        tuition_max=45000,
        difficulty="HIGH"
    ),
    University(
        name="Imperial College London",
        country="UK",
        degree="Masters",
        field="Artificial Intelligence",
        tuition_min=35000,
        tuition_max=42000,
        difficulty="MEDIUM"
    ),
    University(
        name="University College London",
        country="UK",
        degree="Masters",
        field="Computer Science",
        tuition_min=30000,
        tuition_max=40000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Edinburgh",
        country="UK",
        degree="Masters",
        field="Artificial Intelligence",
        tuition_min=25000,
        tuition_max=35000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Manchester",
        country="UK",
        degree="Masters",
        field="Computer Science",
        tuition_min=25000,
        tuition_max=35000,
        difficulty="LOW"
    ),
    # Canada Universities
    University(
        name="University of Toronto",
        country="Canada",
        degree="Masters",
        field="Computer Science",
        tuition_min=25000,
        tuition_max=40000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of British Columbia",
        country="Canada",
        degree="Masters",
        field="Computer Science",
        tuition_min=20000,
        tuition_max=35000,
        difficulty="MEDIUM"
    ),
    University(
        name="McGill University",
        country="Canada",
        degree="Masters",
        field="Computer Science",
        tuition_min=15000,
        tuition_max=25000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Waterloo",
        country="Canada",
        degree="Masters",
        field="Computer Science",
        tuition_min=20000,
        tuition_max=35000,
        difficulty="MEDIUM"
    ),
    University(
        name="Simon Fraser University",
        country="Canada",
        degree="Masters",
        field="Computer Science",
        tuition_min=15000,
        tuition_max=25000,
        difficulty="LOW"
    ),
    # Australia Universities
    University(
        name="Australian National University",
        country="Australia",
        degree="Masters",
        field="Computer Science",
        tuition_min=30000,
        tuition_max=45000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Melbourne",
        country="Australia",
        degree="Masters",
        field="Computer Science",
        tuition_min=30000,
        tuition_max=45000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Sydney",
        country="Australia",
        degree="Masters",
        field="Computer Science",
        tuition_min=30000,
        tuition_max=42000,
        difficulty="LOW"
    ),
    # Germany Universities
    University(
        name="Technical University of Munich",
        country="Germany",
        degree="Masters",
        field="Computer Science",
        tuition_min=500,
        tuition_max=2000,
        difficulty="MEDIUM"
    ),
    University(
        name="University of Stuttgart",
        country="Germany",
        degree="Masters",
        field="Computer Science",
        tuition_min=500,
        tuition_max=1500,
        difficulty="LOW"
    ),
    # Netherlands Universities
    University(
        name="Delft University of Technology",
        country="Netherlands",
        degree="Masters",
        field="Computer Science",
        tuition_min=10000,
        tuition_max=20000,
        difficulty="MEDIUM"
    ),
    University(
        name="Eindhoven University of Technology",
        country="Netherlands",
        degree="Masters",
        field="Computer Science",
        tuition_min=10000,
        tuition_max=20000,
        difficulty="LOW"
    ),
]

db.add_all(universities)
db.commit()
db.close()

print(f"Seeded {len(universities)} universities successfully!")
