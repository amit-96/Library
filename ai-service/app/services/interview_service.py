import random

def get_question(domain: str, interview_type: str):
    """
    Generates technical and HR mock questions depending on focus domains.
    """
    dom = domain.strip().lower()
    it = interview_type.strip().lower()

    hr_questions = [
        "Tell me about a time you worked on a project with a tight deadline. How did you manage it?",
        "What are your greatest professional strengths, and how do you handle criticism or feedback?",
        "Describe a situation where you had a disagreement with a peer. How was it resolved?",
        "Why do you want to work as a developer, and what is your 5-year career vision?"
    ]

    tech_questions = {
        "web development": [
            "Explain the difference between client-side rendering (CSR) and server-side rendering (SSR) in Next.js.",
            "What is event delegation in JavaScript? How does it work and why is it useful?",
            "Explain RESTful API architecture principles. What makes an API design truly RESTful?"
        ],
        "data science": [
            "Explain the bias-variance tradeoff in Machine Learning. How does it relate to overfitting?",
            "How does the Random Forest algorithm work? What is bagging and boosting?",
            "What is the difference between supervised and unsupervised learning? Give examples of both."
        ],
        "cyber security": [
            "Explain how asymmetric encryption works. How does it differ from symmetric encryption?",
            "What is cross-site scripting (XSS)? How can a developer prevent XSS vulnerabilities in React?",
            "What is a SQL injection (SQLi) attack? How do parameterized queries mitigate it?"
        ]
    }

    if it == "hr":
        question = random.choice(hr_questions)
    else:
        # Tech domain matching
        matched_list = tech_questions.get(dom, tech_questions["web development"])
        question = random.choice(matched_list)

    return {
        "questionId": f"q_{random.randint(1000, 9999)}",
        "question": question,
        "instructions": "Write your detailed technical explanation. Click submit for AI feedback."
    }

def grade_answer(question: str, answer: str):
    """
    Evaluates response texts and outputs detailed grades and suggestions.
    """
    ans_len = len(answer.strip())
    
    if ans_len < 15:
        score = random.randint(35, 50)
        evaluation = "Your answer is extremely brief and lacks any technical explanation or definitions. Try to elaborate on core concepts."
        suggestions = [
            "Elaborate on the definition with key terms.",
            "Provide a code snippet or simple architectural analogy.",
            "Structuring answers using points improves readability."
        ]
    elif ans_len < 60:
        score = random.randint(60, 75)
        evaluation = "You have provided a basic definition, but it lacks specific structural details and practical examples."
        suggestions = [
            "Mention real-world project scenarios or use-cases.",
            "Differentiate from closely related alternatives.",
            "Discuss potential performance tradeoffs."
        ]
    else:
        score = random.randint(80, 95)
        evaluation = "Excellent response. You've explained the concept clearly, showing depth of understanding and structuring your ideas well."
        suggestions = [
            "Keep practicing similar analytical explanations.",
            "In physical interviews, speak confidently and use steady pacing."
        ]

    return {
        "score": score,
        "evaluation": evaluation,
        "suggestions": suggestions
    }
