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

import os
from pymongo import MongoClient

# Constant blend weight for content vs collaborative filtering scores
HYBRID_BLEND_WEIGHT = 0.5

def get_mongo_collaborative_history():
    """Fetches all borrow records across all users from MongoDB."""
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        return []
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        db = client.get_default_database() or client['libra-ai']
        records = list(db.borrowrecords.find({}, {"user": 1, "book": 1}))
        serialized = []
        for r in records:
            if "user" in r and "book" in r:
                serialized.append({
                    "userId": str(r["user"]),
                    "bookId": str(r["book"])
                })
        client.close()
        return serialized
    except Exception as e:
        print(f"Warning: Failed to fetch collaborative history from MongoDB: {str(e)}")
    return []

def get_recommendations(user_history, all_books, top_k=4, collaborative_history=None):
    """Generates personalized book recommendations based on user borrowing history.
    user_history: list of categories/titles borrowed by the target user
    all_books: list of all books in catalog
    collaborative_history: optional list of borrow interactions across all users
    """
    if not all_books:
        return []

    # Cold start: if target user has no history, return first top_k books
    if not user_history:
        return all_books[:top_k]

    # Exclude books already borrowed by the target user
    borrowed_ids = {str(record.get("bookId")) for record in user_history if record.get("bookId")}

    # Get collaborative interactions list
    if collaborative_history is None:
        collaborative_history = get_mongo_collaborative_history()

    # --- 1. Compute Collaborative Filtering (CF) Scores ---
    cf_scores = {}
    if collaborative_history:
        # Build mappings of user -> books and book -> users
        user_to_books = {}
        book_to_users = {}
        for interaction in collaborative_history:
            u_id = str(interaction.get("userId"))
            b_id = str(interaction.get("bookId"))
            if not u_id or not b_id:
                continue
            user_to_books.setdefault(u_id, set()).add(b_id)
            book_to_users.setdefault(b_id, set()).add(u_id)

        # Calculate similarity between all candidate books and user's borrowed books
        # We use Jaccard similarity: intersection / union of users who borrowed them
        for target_book in all_books:
            b_id = str(target_book.get("_id") or target_book.get("id"))
            if b_id in borrowed_ids:
                continue

            users_b = book_to_users.get(b_id, set())
            if not users_b:
                cf_scores[b_id] = 0.0
                continue

            total_sim = 0.0
            count = 0
            for borrowed_record in user_history:
                borrowed_id = str(borrowed_record.get("bookId"))
                if not borrowed_id:
                    continue
                users_borrowed = book_to_users.get(borrowed_id, set())
                if not users_borrowed:
                    continue
                
                intersection = len(users_b.intersection(users_borrowed))
                union = len(users_b.union(users_borrowed))
                jaccard_sim = intersection / union if union > 0 else 0.0
                total_sim += jaccard_sim
                count += 1

            cf_scores[b_id] = total_sim / count if count > 0 else 0.0
    else:
        # No collaborative history -> fallback all CF scores to 0
        for b in all_books:
            b_id = str(b.get("_id") or b.get("id"))
            cf_scores[b_id] = 0.0

    # --- 2. Compute Content-Based (CB) Semantic Scores ---
    cb_scores = {}
    try:
        # Create text strings for candidate books
        candidate_books = [b for b in all_books if str(b.get("_id") or b.get("id")) not in borrowed_ids]
        if candidate_books:
            candidate_texts = [f"Title: {b.get('title','')} | Author: {b.get('author','')} | Category: {b.get('category','')}" for b in candidate_books]
            
            # Embed candidate books
            candidate_vecs = embedder.encode(candidate_texts, show_progress_bar=False)
            candidate_vecs = candidate_vecs / np.linalg.norm(candidate_vecs, axis=1, keepdims=True)

            # Compute average embedding vector of target user's borrow history
            history_texts = [f"Title: {b.get('title','')} | Author: {b.get('author','')} | Category: {b.get('category','')}" for b in user_history]
            history_vecs = embedder.encode(history_texts, show_progress_bar=False)
            avg_history_vec = np.mean(history_vecs, axis=0)
            avg_history_vec = avg_history_vec / np.linalg.norm(avg_history_vec)

            # Calculate cosine similarities
            similarities = np.dot(candidate_vecs, avg_history_vec)
            for idx, b in enumerate(candidate_books):
                b_id = str(b.get("_id") or b.get("id"))
                cb_scores[b_id] = float(similarities[idx])
    except Exception as e:
        print(f"Warning: Semantic recommendation scoring failed: {str(e)}. Falling back to category baselines.")

    # Fallback category preference checks if semantic embedding fails
    if not cb_scores:
        category_counts = {}
        for record in user_history:
            cat = record.get("category")
            if cat:
                category_counts[cat] = category_counts.get(cat, 0) + 1
        total_borrowed = max(1, len(user_history))
        for b in all_books:
            b_id = str(b.get("_id") or b.get("id"))
            cat = b.get("category")
            cb_scores[b_id] = category_counts.get(cat, 0) / total_borrowed

    # --- 3. Compute Hybrid Score & Sort ---
    candidates_with_scores = []
    for b in all_books:
        b_id = str(b.get("_id") or b.get("id"))
        if b_id in borrowed_ids:
            continue

        # Get scores (default to 0 if not calculated)
        cb_val = cb_scores.get(b_id, 0.0)
        cf_val = cf_scores.get(b_id, 0.0)

        # Scale semantic cosine similarity (typically 0.1 - 0.8) to align with Jaccard range
        cb_val_scaled = max(0.0, cb_val)

        # Weighted hybrid blend
        hybrid_score = (HYBRID_BLEND_WEIGHT * cb_val_scaled) + ((1.0 - HYBRID_BLEND_WEIGHT) * cf_val)

        b_copy = b.copy()
        b_copy["hybrid_score"] = float(hybrid_score)
        b_copy["content_score"] = float(cb_val)
        b_copy["collab_score"] = float(cf_val)
        candidates_with_scores.append(b_copy)

    # Sort candidates by hybrid score descending
    candidates_with_scores.sort(key=lambda x: x["hybrid_score"], reverse=True)

    # Return top K
    return candidates_with_scores[:top_k]
