var LOCATIONS;
var image;
var round = 0;
var score = 0;
var totalScore = 0;
var scoreScreen = false;
var marker = new Array(5);
var polyline = new Array(5);
var map;
var scoreMap;

// Document ready function
document.addEventListener('DOMContentLoaded', function () {
    fetchLocations();
    setTimeout(function () {
        showNextLocation();
        setupGuessButton();
    }, 300);
});

// Fetch location data from the server
function fetchLocations() {
    fetch('/api/locations')
    .then(response => response.json())
    .then(data => {
        LOCATIONS = data;
        console.log(LOCATIONS);
    });
}


// Handle map click event to set a marker
function onMapClick(e) {
    if (scoreScreen) {
        return;
    }
    if (marker) {
        map.removeLayer(marker);
    }
    console.log("You clicked at: " + e.latlng);
    marker = L.marker(e.latlng).addTo(map);
}

// Set up the guess button functionality
function setupGuessButton() {
    document.getElementById('guess-button').onclick = function () {
        if (!marker) {
            document.getElementById('guess-button').innerHTML = "Select a location first!";
            document.getElementById('guess-button').style.backgroundColor = "red";
            return;
        }
        showScoreScreen();
    };
}

// Calculate the score and draw the polyline
function calculateAndDisplayScore() {
    var xGuess = marker.getLatLng().lng;
    var zGuess = -marker.getLatLng().lat;
    var xActual = image['X'];
    var zActual = image['Z'];
    console.log('attempt');
    // Green marker for actual location
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    L.marker([-zActual, xActual], { icon: greenIcon }).addTo(scoreMap);

    console.log("Actual coords: " + [-zActual, xActual] + ", Guess coords: " + [-zGuess, xGuess]);
    //draws line between guess and actual location
    polyline = L.polyline([[-zActual, xActual], [-zGuess, xGuess]], { color: 'red' }).addTo(scoreMap);
    console.log(polyline.getBounds());

    var distance = Math.sqrt(Math.pow(xActual - xGuess, 2) + Math.pow(zActual - zGuess, 2));
    console.log("Distance: " + distance.toFixed(2) + " blocks away!");

    score = 5000 - distance;
    if (distance > 5000) {
        score = 0;
    }
    totalScore += score;

    // Wait for the map container to resize properly before fitting bounds
    //BUG WHERE MAP DOESNT RESIZE PROPERLY TO FIT POLYLINE IDK HOW TO FIX ITS BEEN 7 HOURS PLS HELP(copilot generated this comment lol)
    scoreMap.invalidateSize({ pan: false, debounceMoveend: true });
    setTimeout(function () {
        scoreMap.fitBounds(polyline.getBounds());
    }, 300); // Adjust the delay as needed
}

// Display the score screen
function showScoreScreen() {
    showContent('score-screen');
    document.getElementById('guess-screen').innerHTML = "";
    document.getElementById('score-screen').innerHTML =
        "<div class = 'score-map' id='scoreMap'></div>" + 
        "<div id = 'score-container'><p id='distance' class='score-info-right'></p>" +
        "<button id='next-button' class='next-button'>Next Location</button>" +
        "<p id='score' class='score-info-left'>SCORE</p></div>";
    setTimeout(function () {
        scoreMap = L.map('scoreMap', {
            crs: L.CRS.Simple,
            minZoom: -3,
            maxZoom: 5,
            renderer: L.canvas({ padding: 10 })
        }).setView([0, 0], 0);
        var bounds = [[123, -2392], [6608, 1699]]; // Map bounds
        L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(scoreMap);
        scoreMap.setView([3000, -500], -1);
        scoreMap.on('click', onMapClick);

        document.getElementById('distance').innerHTML = "Distance: " + (5000 - score).toFixed(2) + " blocks away!";
        document.getElementById('score').innerHTML = "Score: " + (totalScore + score) + "/" + round * 5000;

        document.getElementById('next-button').onclick = showNextLocation;
    }, 300);
    
}

// Load the next location
function showNextLocation() {
    showContent('guess-screen');
    document.getElementById('score-screen').innerHTML = "";
    document.getElementById('guess-screen').innerHTML = 
    "<div id='vrview' class = vr-image></div>" +
    "<div class = 'map-container' id = 'map-container'>" +
        "<div class = 'map' id='map'></div>" +
        "<button id='guess-button' class = 'guess-button' type = 'submit'>Guess!</button></div>";
        //initialize map
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 5,
        renderer: L.canvas({ padding: 10 })
    }).setView([0, 0], 0);

    var bounds = [[123, -2392], [6608, 1699]]; // Map bounds
    L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(map);
    map.setView([3000, -500], -2);

    map.on('click', onMapClick);

    if (LOCATIONS.length === 0) {
        document.getElementById('guess-button').innerHTML = "No more locations!";
        document.getElementById('guess-button').style.backgroundColor = "red";
        return;
    }
    //selects a random location from the list of locations and removes it to prevent duplicates
    var rand = Math.floor(Math.random() * LOCATIONS.length);
    image = LOCATIONS[rand];
    LOCATIONS.splice(rand, 1);
    //loads next vrview image
    console.log(image);
    
    var vrView = new VRView.Player('#vrview', {
        image: image['url'],
        is_stereo: false
    });
    //removes all markers from the map
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            layer.remove();
        }
    });
    if(polyline){
        map.removeLayer(polyline);
    }
    marker = null;
    
    round++;
    document.getElementById('round-number').innerHTML = "Round: " + round + "/5 ";
}
function showContent(contentId){
    document.getElementById('guess-screen').style.display = "none";
    document.getElementById('score-screen').style.display = "none";
    document.getElementById(contentId).style.display = "block";
}

function finalScore() {
    // TODO: Implement final score calculation
}
