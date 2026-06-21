import random
import cv2
import numpy as np

# CCTV Analytics simulation with OpenCV-based grid detection and YOLOv11 occupancy hooks
def get_cctv_status():
    """
    Simulates OpenCV template matching and YOLOv11 person detection.
    Analyzes live seat status and active occupancy logs.
    """
    total_seats = 100
    occupied_count = random.randint(35, 65)
    empty_seats = total_seats - occupied_count

    # Mock OpenCV image frame occupancy mapping
    # 0 = Empty, 1 = Occupied
    seat_map = []
    for f in range(1, 3): # Floor 1 and Floor 2
        for s in range(1, 9):
            seat_num = f"{f}F-0{s:02d}"
            # OpenCV random mock evaluation
            occupied = random.choice([True, False])
            seat_map.append({
                "seatNumber": seat_num,
                "occupied": occupied
            })

    # Security threats / alert monitoring
    security_alerts = []
    if occupied_count > 60:
        security_alerts.append({
            "level": "Warning",
            "message": "Crowd safety threshold warning: High occupancy rate detected."
        })

    # Simulate restricted area detection
    if random.random() < 0.15:
        security_alerts.append({
            "level": "Critical",
            "message": "Unauthorized entry detected in restricted archives area."
        })

    return {
        "success": True,
        "occupancy": occupied_count,
        "totalSeats": total_seats,
        "emptySeatsCount": empty_seats,
        "activeCameras": 4,
        "crowdThresholdSafe": occupied_count <= 60,
        "securityAlerts": security_alerts,
        "seatGrid": seat_map
    }
