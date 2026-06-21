import numpy as np
from sentence_transformers import SentenceTransformer

# Re-use the sentence embedder or initialize if needed
from app.services.rag_service import embedder

def semantic_search_books(query, books_list, top_k=5):
    """Performs semantic search over a list of books.
    books_list: list of dicts: [ { "id": "...", "title": "...", "author": "...", "category": "..." } ]
    """
    if not books_list:
        return []

    # Format texts for embedding
    book_texts = [f"Title: {b['title']} | Author: {b['author']} | Category: {b['category']}" for b in books_list]

    # Embed query and books
    query_vec = embedder.encode([query])[0]
    book_vecs = embedder.encode(book_texts, show_progress_bar=False)

    # Normalize for cosine similarity
    query_vec = query_vec / np.linalg.norm(query_vec)
    book_vecs = book_vecs / np.linalg.norm(book_vecs, axis=1, keepdims=True)

    # Compute cosine similarities
    similarities = np.dot(book_vecs, query_vec)

    # Get sorted indexes
    sorted_idx = np.argsort(similarities)[::-1]

    results = []
    for idx in sorted_idx[:top_k]:
        book_info = books_list[idx].copy()
        book_info["score"] = float(similarities[idx])
        results.append(book_info)

    return results

def get_recommendations(user_history, all_books, top_k=4):
    """Generates personalized book recommendations based on user borrowing history.
    user_history: list of categories/titles borrowed
    all_books: list of all books in catalog
    """
    if not all_books:
        return []

    # If user has no borrowing history, recommend popular/random books across categories
    if not user_history:
        return all_books[:top_k]

    # Calculate category preferences from history
    category_counts = {}
    for record in user_history:
        cat = record.get("category")
        if cat:
            category_counts[cat] = category_counts.get(cat, 0) + 1

    # Sort categories by preference
    preferred_categories = sorted(category_counts, key=category_counts.get, reverse=True)

    # Already borrowed book IDs to exclude from recommendations
    borrowed_ids = {str(record.get("bookId")) for record in user_history if record.get("bookId")}

    recommendations = []
    
    # 1. Fill recommendations with unborrowed books from preferred categories
    for cat in preferred_categories:
        cat_books = [b for b in all_books if b.get("category") == cat and str(b.get("_id")) not in borrowed_ids]
        recommendations.extend(cat_books)
        if len(recommendations) >= top_k:
            break

    # 2. If not enough recommendations, add general books the user hasn't read
    if len(recommendations) < top_k:
        remaining = [b for b in all_books if str(b.get("_id")) not in borrowed_ids and b not in recommendations]
        recommendations.extend(remaining)

    return recommendations[:top_k]
