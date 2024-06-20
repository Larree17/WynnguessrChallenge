var LOCATIONS;
var image;
var round = 0;
var score = 0;
var polyline;
var totalScore = 0;
var scoreScreen = false;
var marker;
var map;

// Document ready function
document.addEventListener('DOMContentLoaded', function () {
    initializeMap();
    fetchLocations();
    setupGuessButton();
});

// Fetch location data from the server
function fetchLocations() {
    fetch('/api/locations')
    .then(response => response.json())
    .then(data => {
        LOCATIONS = data;
        console.log(LOCATIONS);
        showNextLocation();
    });
}

// Initialize the Leaflet map
function initializeMap() {
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

        calculateAndDisplayScore();
        showScoreScreen();
    };
}

// Calculate the score and draw the polyline
function calculateAndDisplayScore() {
    var xGuess = marker.getLatLng().lng;
    var zGuess = -marker.getLatLng().lat;
    var xActual = image['X'];
    var zActual = image['Z'];

    // Green marker for actual location
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    L.marker([-zActual, xActual], { icon: greenIcon }).addTo(map);

    console.log("Actual coords: " + [-zActual, xActual] + ", Guess coords: " + [-zGuess, xGuess]);
    //draws line between guess and actual location
    polyline = L.polyline([[-zActual, xActual], [-zGuess, xGuess]], { color: 'red' }).addTo(map);
    console.log(polyline.getBounds());

    var distance = Math.sqrt(Math.pow(xActual - xGuess, 2) + Math.pow(zActual - zGuess, 2));
    console.log("Distance: " + distance.toFixed(2) + " blocks away!");

    score = 5000 - distance;
    if (distance > 5000) {
        score = 0;
    }
    totalScore += score;

    document.getElementById('guess-button').innerHTML = "Distance: " + distance.toFixed(2) + " blocks away!";

    // Wait for the map container to resize properly before fitting bounds
    setTimeout(function () {
        map.invalidateSize({ pan: false, debounceMoveend: true });
        var padding = Math.min(map.getSize().x, map.getSize().y) * 0.1; // 10% of the smaller dimension
        map.fitBounds(polyline.getBounds(), { padding: [padding, padding] });
    }, 1000); 
}

// Display the score screen
function showScoreScreen() {
    scoreScreen = true;
    document.getElementById('score-screen').innerHTML =
        "<p id='distance' class='score-info'></p>" +
        "<button id='next-button' class='next-button'>Next Location</button>" +
        "<p id='score' class='score-info'>SCOREEEEEEEEEEEEEEEE</p>";

    document.getElementById('distance').innerHTML = "Distance: " + (5000 - score).toFixed(2) + " blocks away!";
    document.getElementById('score').innerHTML = "Score: " + (totalScore + score) + "/" + round * 5000;

    document.getElementById('map-container').style.top = "5.5%";
    document.getElementById('map-container').style.height = "84.5%";
    document.getElementById('map-container').style.width = "100%";
    document.getElementById('score-screen').style.display = "flex";
    document.getElementById('guess-button').style.display = "none";
    document.getElementById('vrview').style.display = "none";

    document.getElementById('next-button').onclick = showNextLocation;
}

// Load the next location
function showNextLocation() {
    scoreScreen = false;

    if (LOCATIONS.length === 0) {
        document.getElementById('guess-button').innerHTML = "No more locations!";
        document.getElementById('guess-button').style.backgroundColor = "red";
        return;
    }

    var rand = Math.floor(Math.random() * LOCATIONS.length);
    image = LOCATIONS[rand];
    LOCATIONS.splice(rand, 1);

    console.log(image);
    var vrView = new VRView.Player('#vrview', {
        image: image['url'],
        is_stereo: false
    });

    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            layer.remove();
        }
    });

    round++;
    document.getElementById('round-number').innerHTML = "Round: " + round + "/5 ";
}

function finalScore() {
    // TODO: Implement final score calculation
}
