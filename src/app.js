const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { stops } = require('./stops.js')
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function findClosestStation(lat, lon) {
  let closestStation = null;
  let minDistance = Infinity;

  stops.forEach(station => {
    const distance = getDistanceFromLatLonInKm(lat, lon, station.stop_lat, station.stop_lon);
    if (distance < minDistance) {
      minDistance = distance;
      closestStation = [station.stop_name, station.stop_id];
    }
  });

  return closestStation;
}

async function fetchById(id) {
  const url = `http://127.0.0.1:5000/by-id/${id}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function fetchDataByLocation(latitude, longitude) {
  const url = `http://127.0.0.1:5000/by-location?lat=${latitude}&lon=${longitude}`;
  try {
    const response = await axios.get(url);
    return response.data.data[0].id;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

function findClosestTime(data) {
  const stations = data.data;
  const result = [];

  stations.forEach(station => {
    const stationData = {
      name: station.name,
      closestTimes: {}
    };

    station.routes.forEach(route => {
      const closestTimes = [];
      const northboundTimes = station.N.filter(direction => direction.route === route);
      const southboundTimes = station.S.filter(direction => direction.route === route);

      [northboundTimes, southboundTimes].forEach(directions => {
        directions.sort((a, b) => new Date(a.time) - new Date(b.time));
        for (let i = 0; i < 2 && i < directions.length; i++) {
          closestTimes.push(directions[i].time);
        }
      });

      stationData.closestTimes[route] = closestTimes.length > 0 ? closestTimes.slice(0, 2) : "No upcoming times";
    });

    result.push(stationData);
  });

  return result;
}

function convertToRelativeTime(data) {
  const newData = JSON.parse(JSON.stringify(data)); // Clone the data to avoid modifying the original
  newData.forEach(station => {
    for (const route in station.closestTimes) {
      station.closestTimes[route] = station.closestTimes[route].map(time => moment(time).fromNow());
    }
  });
  return newData;
}


io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', async (message) => {
    const lat = message.lat
    const lon = message.lon

    let stationData = findClosestStation(lat, lon);
    let stationName = stationData[0];

    console.log(`closest station: ${stationName}`)

    const id = await fetchDataByLocation(lat, lon);
    const apiData = await fetchById(id);

    let d = findClosestTime(apiData);
    d = convertToRelativeTime(d);


    socket.emit('showData', d);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});
