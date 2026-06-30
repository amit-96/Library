# Nalanda Digital Library (LibraAI) - AI Features Implementation Notes

This document summarizes the updates, newly introduced environment variables, model download behaviors, and execution steps for the five completed AI tasks.

---

## 1. Overview of Changes

### Task 1: Real AI Seat Prediction Model
- **File Created**: [train_occupancy.py](file:///c:/Users/amit8/OneDrive/Desktop/Library/ai-service/app/ml/train_occupancy.py) - Synthetic library occupancy dataset generator & scikit-learn RandomForest model training script.
- **File Modified**: [predict_service.py](file:///c:/Users/amit8/OneDrive/Desktop/Library/ai-service/app/services/predict_service.py) - Refactored to load `occupancy_model.pkl` and perform inference from date-derived calendar features (hour, day of week, weekend, exam periods, month) with standard-deviation derived confidence scores.

### Task 2: Hybrid Collaborative Recommendation Engine
- **File Modified**: [rec_service.py](file:///c:/Users/amit8/OneDrive/Desktop/Library/ai-service/app/services/rec_service.py) - Replaced category lists with a hybrid scorer. Uses item-based Jaccard similarity collaborative filtering and average-history semantic embeddings, weighted at `0.5` blend ratios.
- **File Modified**: [recommend.py](file:///c:/Users/amit8/OneDrive/Desktop/Library/ai-service/app/routes/recommend.py) - Updated Recommendations Pydantic model to allow optional `collaborative_history`.

### Task 3: FaceNet Face Recognition default path
- **File Modified**: [face_service.py](file:///c:/Users/amit8/OneDrive/Desktop/Library/ai-service/app/services/face_service.py) - Re-routed the face matcher fallback flow to `facenet-pytorch`'s MTCNN and InceptionResnetV1, converting 512D representations into 128D via average pooling to fit database models.

### Task 4: Twilio SMS Alerts
- **File Created**: [smsService.js](file:///c:/Users/amit8/OneDrive/Desktop/Library/backend/utils/smsService.js) - Twilio SMS transmitter matching `whatsappService.js` structure.
- **Files Modified**: [borrowController.js](file:///c:/Users/amit8/OneDrive/Desktop/Library/backend/controllers/borrowController.js), [noticeController.js](file:///c:/Users/amit8/OneDrive/Desktop/Library/backend/controllers/noticeController.js), [seatController.js](file:///c:/Users/amit8/OneDrive/Desktop/Library/backend/controllers/seatController.js), [studentController.js](file:///c:/Users/amit8/OneDrive/Desktop/Library/backend/controllers/studentController.js) - Added `sendSMSAlert` triggers.
- **File Created**: [.env.example](file:///c:/Users/amit8/OneDrive/Desktop/Library/backend/.env.example) - Documents environment variables.

### Task 5: Voice Search Langs
- **File Modified**: [BookSearch.js](file:///c:/Users/amit8/OneDrive/Desktop/Library/frontend/src/pages/BookSearch.js) - Added Odia (`or-IN`) selection, expanded search tooltips, and handled speech recognition `language-not-supported` errors gracefully.

---

## 2. Configuration Settings (.env)

The following Twilio configuration variables are required in `backend/.env` for live SMS notifications:
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SMS_FROM=your_sender_phone_number
```
If these variables are omitted, the code operates in **Mock Sandbox Mode**, printing notification details in console logs.

---

## 3. Running & Training Scripts

### Run Seat Occupancy Training
To train the seat occupancy prediction regressor:
```bash
cd ai-service
python app/ml/train_occupancy.py
```
This writes `occupancy_model.pkl` to `ai-service/app/ml/`.

### Pre-trained Weight Downloads
When `ai-service` starts up, it imports the face recognition module.
1. The model automatically downloads `MTCNN` and `InceptionResnetV1` weights (approx. 107MB) from public repositories and caches them locally.
2. Ensure active internet connectivity on initial boot.
