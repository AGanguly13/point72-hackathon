# point72-hackathon

## Overview

The goal of our project is to make it easier for people to digest information about the NYC Subway system and navigate the city faster. How our app works is that a user can click anywhere on the map, and a pin will be dropped showing the closest subway station to that location, along with information about distance, walk time, and upcoming train departures. Given that this application can work on mobile phones, and the information is displayed in a modular manner, we believe this app will be a reliable and effective method of helping users get to where they need to be as fast as possible.

## How we built this app

We used the Google Maps API integrated into our HTML file for a viewable and interactive map.

Our <ins>backend</ins> was built with Python, Flask and ExpressJS.

Our <ins>frontend</ins> was built with HTML, CSS, and JavaScript.

Our general flow structure is as follows.
1. A user clicks on a location on the map
2. An event listener in our Javascript send the latitude and longitude of that location to our Python backend.
3. We compute the distance to the closest train stop based on the longitude and latitude points of where the user clicked
4. We then send the relevant data back to the frontend, including data for upcoming train departures at that station using the MTA Subway Realtime Feeds API
 


