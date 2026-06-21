import cv2
import numpy as np
import base64

# Try to import face_recognition (requires dlib, which might fail compilation on Windows)
HAS_FACE_REC = False
try:
    import face_recognition
    HAS_FACE_REC = True
    print("face_recognition (dlib-based) successfully imported.")
except ImportError:
    print("face_recognition (dlib-based) not available. Falling back to OpenCV YuNet/Haar Cascades + Color Histogram matcher.")

# Load Haar Cascades for face detection as fallback
cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(cascade_path)

def decode_image(image_bytes):
    """Converts raw image bytes to an OpenCV BGR image."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def get_face_embedding(img):
    """Extracts a 128-dimensional embedding vector from a face image.
    Returns None if no face is found."""
    if img is None:
        return None

    if HAS_FACE_REC:
        try:
            # Convert BGR (OpenCV) to RGB (face_recognition)
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(rgb_img)
            if len(encodings) > 0:
                # Return the 128D list
                return encodings[0].tolist()
        except Exception as e:
            print(f"Error extracting embedding via face_recognition: {e}")

    # Fallback OpenCV method: Resize cropped face and create standardized mock embedding vector
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        if len(faces) > 0:
            x, y, w, h = faces[0]
            face_roi = img[y:y+h, x:x+w]
            # Resize cropped face to standard size (e.g. 100x100)
            face_resized = cv2.resize(face_roi, (100, 100))
            # Standardize pixel values and use them to construct a mock 128D embedding vector
            # This embedding is a representation of the face's color/intensity profile
            hist = cv2.calcHist([face_resized], [0, 1, 2], None, [4, 4, 4], [0, 256, 0, 256, 0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            
            # Pad or slice hist to fit exactly 128 dimensions
            embedding = np.zeros(128)
            embedding[:min(128, len(hist))] = hist[:min(128, len(hist))]
            return embedding.tolist()
    except Exception as e:
        print(f"Error in OpenCV fallback face detector: {e}")

    return None

def match_face(uploaded_embedding, db_students):
    """Matches an uploaded face embedding against a list of student profiles from database.
    db_students: list of dicts: [ { "id": "student_mongo_id", "name": "...", "embeddings": [...] } ]
    Returns matching student dict or None.
    """
    if not uploaded_embedding or not db_students:
        return None

    uploaded_vector = np.array(uploaded_embedding)
    best_match = None
    min_distance = 999.0

    # Distance Thresholds: 0.6 for face_recognition (L2 distance), 0.4 for histogram
    threshold = 0.6 if HAS_FACE_REC else 0.4

    for student in db_students:
        student_embeds = student.get("faceEmbeddings")
        if not student_embeds or len(student_embeds) != 128:
            continue

        db_vector = np.array(student_embeds)
        # Calculate Euclidean Distance
        dist = np.linalg.norm(uploaded_vector - db_vector)
        
        if dist < min_distance:
            min_distance = dist
            best_match = student

    if min_distance < threshold:
        print(f"Face matched with student {best_match['name']} (Distance: {min_distance:.4f})")
        return best_match

    print(f"No match found. Best distance: {min_distance:.4f} (Threshold: {threshold})")
    return None
