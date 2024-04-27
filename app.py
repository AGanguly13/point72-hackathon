from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/receive_location', methods=['POST'])
def receive_location():
    data = request.get_json()
    lat = data['lat']
    lng = data['lng']
    print(f"Received latitude: {lat} and longitude: {lng}")
    
    # Store the coordinates in a JSON file
    with open('clicks.json', 'w') as f:
        json.dump({'lat': lat, 'lng': lng}, f)
    
    return jsonify({"status": "success", "message": "Coordinates received successfully."})

if __name__ == '__main__':
    app.run(debug=True)
 