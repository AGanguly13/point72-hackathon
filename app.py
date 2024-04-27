from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

# Load your data
stops = pd.read_csv('./stops.csv')

@app.route('/receive_location', methods=['POST'])
def receive_location():
    data = request.get_json()
    if not data or 'lat' not in data or 'lng' not in data:
        logging.error("Invalid or missing data received")
        return jsonify({"error": "Invalid or missing latitude/longitude"}), 400

    lat = data['lat']
    lng = data['lng']
    print(f"Received latitude: {lat} and longitude: {lng}")
    
    # Store the coordinates in a JSON file
    with open('clicks.json', 'w') as f:
        json.dump({'lat': lat, 'lng': lng}, f)
    
    return jsonify({"status": "success", "message": "Coordinates received successfully."})

@app.route('/closest_station', methods=['POST'])
def closest_station():
    data = request.get_json()
    if not data or 'lat' not in data or 'lng' not in data:
        logging.error("No valid latitude or longitude provided.")
        return jsonify({"error": "Invalid or missing latitude/longitude"}), 400

    lat = data['lat']
    lon = data['lng']
    stop_name, distance = find_closest_station(lat, lon)
    distance_miles = distance * 69.17  # Convert radians to miles, adjust as necessary
    walk_time = distance_miles * 20  # Rough estimate for walking
    run_time = distance_miles * 2.15827338129  # Example conversion for running
    return jsonify({
        "station_name": stop_name,
        "distance_miles": f"{distance_miles:.3f} miles",
        "walk_time": f"{walk_time:.0f} minutes",
        "run_time": f"{run_time:.2f} minutes"
    })

def find_closest_station(lat, lon):
    # Calculate Manhattan distance to each station
    stops_this_click = stops.copy()
    stops_this_click['distance'] = abs(stops_this_click['stop_lat'] - lat) + abs(stops_this_click['stop_lon'] - lon)
    
    # Find the station with the smallest distance
    closest_station = stops_this_click.loc[stops_this_click['distance'].idxmin()]
    
    return closest_station['stop_name'], closest_station['distance']

if __name__ == '__main__':
    app.run(debug=True, port=5000)
