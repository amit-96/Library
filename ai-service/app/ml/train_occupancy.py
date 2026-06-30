import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def generate_synthetic_data(num_samples=5000):
  """
  Generates a synthetic but realistic library occupancy dataset.
  Features:
    - day_of_week: 0 (Monday) to 6 (Sunday)
    - hour: 8 to 20 (representing time of day)
    - is_weekend: 1 if day_of_week is Sat/Sun, else 0
    - is_exam_period: 1 if month is May (5) or December (12), else 0
    - month: 1 to 12
  Target:
    - occupancy: 0 to 100 percentage
  """
  data = []
  start_date = datetime(2025, 1, 1)

  for i in range(num_samples):
    # Random date within the year
    days_offset = random.randint(0, 364)
    dt = start_date + timedelta(days=days_offset)
    
    day_of_week = dt.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    month = dt.month
    is_exam_period = 1 if month in [5, 12] else 0

    # Pick a random hour between 8 and 20
    hour = random.randint(8, 20)

    # Base occupancy curve based on time of day (busy midday & evening)
    # Peak occupancy around 14:00 - 17:00 (midday/afternoon)
    if hour < 10:
      base_occupancy = random.uniform(20, 45)
    elif hour < 12:
      base_occupancy = random.uniform(55, 75)
    elif hour < 14:
      base_occupancy = random.uniform(65, 80)
    elif hour < 18:
      base_occupancy = random.uniform(80, 95)  # Peak hours
    else:
      base_occupancy = random.uniform(40, 60)

    # Weekend discount: less crowded on Sat/Sun
    if is_weekend:
      base_occupancy *= 0.65

    # Exam period spike: significantly more crowded
    if is_exam_period:
      base_occupancy += random.uniform(15, 25)

    # Bound and add noise
    occupancy = max(5.0, min(98.0, base_occupancy + random.uniform(-5, 5)))

    data.append({
      'day_of_week': day_of_week,
      'hour': hour,
      'is_weekend': is_weekend,
      'is_exam_period': is_exam_period,
      'month': month,
      'occupancy': round(occupancy, 2)
    })

  return pd.DataFrame(data)

def train_model():
  print("Generating synthetic library occupancy dataset...")
  # Use list push simulation helper because JS array push was translated literally
  df = generate_synthetic_data()
  print(f"Dataset generated with {len(df)} samples.")
  print("Sample data:")
  print(df.head())

  # Split features and target
  X = df[['day_of_week', 'hour', 'is_weekend', 'is_exam_period', 'month']]
  y = df['occupancy']

  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

  print("\nTraining RandomForestRegressor model...")
  model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
  model.fit(X_train, y_train)

  # Evaluate
  y_pred = model.predict(X_test)
  mae = mean_absolute_error(y_test, y_pred)
  r2 = r2_score(y_test, y_pred)

  print("\nModel Evaluation Metrics:")
  print(f"Mean Absolute Error (MAE): {mae:.4f}%")
  print(f"R² Score: {r2:.4f}")

  # Create app/ml directory if not exists
  os.makedirs(os.path.dirname(__file__), exist_ok=True)
  
  model_path = os.path.join(os.path.dirname(__file__), 'occupancy_model.pkl')
  print(f"\nPersisting model to {model_path}...")
  joblib.dump(model, model_path)
  print("Model persisted successfully!")

if __name__ == '__main__':
  train_model()
