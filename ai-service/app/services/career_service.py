def generate_roadmap(goal: str, current_skills: list):
    """
    Analyzes student career objectives, calculates skill gaps against industry benchmarks,
    and returns step-by-step roadmaps.
    """
    # Clean goal input
    goal_clean = goal.strip().lower()
    
    # Defaults
    roadmap = []
    required_skills = []
    
    if "data scientist" in goal_clean or "data science" in goal_clean:
        required_skills = ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-Learn", "Deep Learning", "Tableau"]
        roadmap = [
            {"step": 1, "title": "Mathematical foundations (Probability, Statistics, Linear Algebra)", "duration": "2 Weeks"},
            {"step": 2, "title": "Data Manipulation with Python (Pandas, Numpy) & Advanced SQL", "duration": "3 Weeks"},
            {"step": 3, "title": "Classical Machine Learning Algorithms (Regressions, Trees, SVMs)", "duration": "4 Weeks"},
            {"step": 4, "title": "Neural Networks, Deep Learning & Cloud MLOps pipelines", "duration": "3 Weeks"}
        ]
    elif "cloud" in goal_clean or "devops" in goal_clean:
        required_skills = ["Linux", "Git", "Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Terraform"]
        roadmap = [
            {"step": 1, "title": "Linux Administration and Networking Foundations", "duration": "2 Weeks"},
            {"step": 2, "title": "Containerization using Docker & Podman", "duration": "2 Weeks"},
            {"step": 3, "title": "Orchestration with Kubernetes (EKS/GKE)", "duration": "4 Weeks"},
            {"step": 4, "title": "Infrastructure as Code (Terraform) & Jenkins CI/CD automation", "duration": "3 Weeks"}
        ]
    else:
        # Default Full Stack roadmap
        required_skills = ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "Docker", "System Design"]
        roadmap = [
            {"step": 1, "title": "HTML, CSS & JavaScript ES6 foundations", "duration": "2 Weeks"},
            {"step": 2, "title": "React.js State Management & modern hooks", "duration": "3 Weeks"},
            {"step": 3, "title": "REST APIs with Node.js, Express & Mongo database schemas", "duration": "4 Weeks"},
            {"step": 4, "title": "System Design patterns, Rate Limiting & Docker containerization", "duration": "3 Weeks"}
        ]

    # Calculate Skill Gap
    skills_lower = [s.strip().lower() for s in current_skills]
    skill_gap = []
    for skill in required_skills:
        if skill.lower() not in skills_lower:
            skill_gap.append(skill)

    # Learning Materials recommendations
    learning_materials = [
        {"resource": "Introduction to Algorithms (Cormen)", "type": "Textbook Reference"},
        {"resource": "Clean Code: Agile Software Craftsmanship (Martin)", "type": "Best Practice Reference"}
    ]
    
    if "python" in skill_gap or "Machine Learning" in skill_gap:
        learning_materials.append({"resource": "Artificial Intelligence: A Modern Approach (Russell)", "type": "Syllabus Recommendation"})

    return {
        "goal": goal,
        "roadmap": roadmap,
        "skillGap": skill_gap,
        "learningMaterials": learning_materials
    }
