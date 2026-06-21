def analyze_resume_text(resume_text: str):
    """
    Parses resume text to calculate a mock ATS matching index, identifies missing keywords,
    and returns resume enhancement notes.
    """
    text_lower = resume_text.lower()
    
    # Common industry skills list
    industry_skills = {
        "Frontend": ["React", "HTML", "CSS", "JavaScript", "Angular", "Vue", "TypeScript"],
        "Backend": ["Node.js", "Express", "Python", "Flask", "Django", "FastAPI", "Java", "Spring Boot"],
        "DevOps/Cloud": ["Docker", "Kubernetes", "AWS", "Google Cloud", "CI/CD Pipelines", "Terraform", "Git"],
        "Databases": ["MongoDB", "MySQL", "PostgreSQL", "SQLite", "Redis", "SQL"],
        "Architecture": ["System Design", "Microservices", "Design Patterns", "REST APIs"]
    }
    
    found_skills = []
    missing_skills = []
    
    for category, skills in industry_skills.items():
        for skill in skills:
            if skill.lower() in text_lower:
                found_skills.append(skill)
            else:
                # Add a few default missing skills if they aren't matched, to simulate gap
                missing_skills.append(skill)

    # Let's cap missing skills to something representative
    missing_skills = [s for s in missing_skills if s in ["Docker", "AWS", "System Design", "Kubernetes", "TypeScript", "Microservices"]]
    
    # Calculate ATS Match Score
    num_found = len(found_skills)
    ats_score = 60 + (num_found * 4)
    if ats_score > 98:
        ats_score = 98

    # Improvements recommendations
    suggestions = [
        "Include metrics-driven results (e.g., 'Optimized database queries decreasing load times by 30%').",
        "Make sure to list developer toolings like Git and containerization like Docker in a dedicated Technical Skills section."
    ]
    
    if "Docker" in missing_skills:
        suggestions.append("Add container orchestration or Docker container deployment projects.")
    if "AWS" in missing_skills:
        suggestions.append("List cloud hosting certifications or cloud-native AWS (S3, EC2) service exposures.")
    if "System Design" in missing_skills:
        suggestions.append("Include mention of high-level system components (e.g., Load Balancers, Redis Caches) under backend projects.")

    return {
        "atsScore": ats_score,
        "matchedSkills": found_skills[:8], # limit output count
        "missingSkills": missing_skills[:4],
        "suggestions": suggestions
    }
