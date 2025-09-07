from django.shortcuts import render
from django.http import JsonResponse
import random

def hello_world(request):
    return JsonResponse({"message": "Hello from API!"})

def crowd_data(request):
    # Generate mock crowd data points for the heatmap
    data_points = [
        {
            "lat": 40.7589 + (random.random() - 0.5) * 0.01,
            "lng": -73.9851 + (random.random() - 0.5) * 0.01,
            "intensity": random.random(),
            "location": "Times Square"
        } for _ in range(20)
    ]
    
    # Add some fixed locations
    locations = [
        {"lat": 40.7505, "lng": -73.9934, "name": "Herald Square"},
        {"lat": 40.7614, "lng": -73.9776, "name": "Central Park South"},
        {"lat": 40.7580, "lng": -73.9855, "name": "Broadway Theater District"},
        {"lat": 40.7549, "lng": -73.9840, "name": "Garment District"},
        {"lat": 40.7527, "lng": -73.9772, "name": "Koreatown"},
    ]
    
    for loc in locations:
        data_points.append({
            "lat": loc["lat"],
            "lng": loc["lng"],
            "intensity": random.random(),
            "location": loc["name"]
        })
    
    return JsonResponse({"data": data_points})