import cv2
import numpy as np
import base64

# Try to import face_recognition (requires dlib)
HAS_FACE_REC = False
try:
    import face_recognition
    HAS_FACE_REC = True
    print("face_recognition (dlib-based) successfully imported.")
except ImportError:
    pass

# Integrate lightweight facenet-pytorch default pipeline
HAS_FACENET_REC = False
try:
    from facenet_pytorch import MTCNN, InceptionResnetV1
    import torch
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    # MTCNN defaults to returning normalized cropped tensor of face (160x160)
    mtcnn = MTCNN(keep_all=False, device=device)
    # Load FaceNet model pre-trained on VGGFace2
    resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
    HAS_FACENET_REC = True
    print(f"facenet-pytorch successfully initialized on device: {device}")
except Exception as e:
    print(f"Warning: facenet-pytorch could not be loaded: {str(e)}")

if not HAS_FACE_REC and not HAS_FACENET_REC:
    print("Warning: Neither dlib face_recognition nor facenet-pytorch is available. Falling back to OpenCV YuNet/Haar Cascades + Color Histogram matcher.")

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

    # 1. Primary path: dlib-based face_recognition
    if HAS_FACE_REC:
        try:
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(rgb_img)
            if len(encodings) > 0:
                return encodings[0].tolist()
        except Exception as e:
            print(f"Error extracting embedding via face_recognition: {e}")

    # 2. Default standard path: facenet-pytorch InceptionResnetV1 (512D projected to 128D)
    if HAS_FACENET_REC:
        try:
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            # mtcnn crops the face and returns a PyTorch tensor
            face_tensor = mtcnn(rgb_img)
            if face_tensor is not None:
                face_tensor = face_tensor.unsqueeze(0).to(device)
                with torch.no_grad():
                    # Generate 512-dimensional embedding
                    embedding_512 = resnet(face_tensor)[0].cpu().numpy()
                
                # Project 512D to 128D via average pooling
                embedding_128 = embedding_512.reshape(-1, 4).mean(axis=1)
                # L2 normalize the projected embedding
                norm = np.linalg.norm(embedding_128)
                if norm > 0:
                    embedding_128 = embedding_128 / norm
                return embedding_128.tolist()
        except Exception as e:
            print(f"Error extracting embedding via facenet-pytorch: {e}")

    # 3. Fallback path: OpenCV Haar Cascades + Color Histogram
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        if len(faces) > 0:
            x, y, w, h = faces[0]
            face_roi = img[y:y+h, x:x+w]
            face_resized = cv2.resize(face_roi, (100, 100))
            hist = cv2.calcHist([face_resized], [0, 1, 2], None, [4, 4, 4], [0, 256, 0, 256, 0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            
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

    # Distance Thresholds: 0.6 for dlib (L2 distance), 0.65 for FaceNet-128D, 0.4 for histogram
    threshold = 0.6 if HAS_FACE_REC else (0.65 if HAS_FACENET_REC else 0.4)

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
