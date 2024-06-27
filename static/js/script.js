var LOCATIONS;
var round = 0;
var score = 0;
var totalScore = 0;
var images = new Array(5);
var markers = new Array(5);
var polylines = new Array(5);
var map;
var scoreMap;

// Document ready function
document.addEventListener('DOMContentLoaded', function () {
    fetchLocations().then(() => {
        showNextLocation();
    });
});

// Fetch location data from the server
function fetchLocations() {
    return fetch('/api/locations')
    .then(response => response.json())
    .then(data => {
        LOCATIONS = data;
        console.log(LOCATIONS);
    });
}


// Handle map click event to set a marker
function onMapClick(e) {
    if (markers[round - 1] != undefined) {
        map.removeLayer(markers[round - 1]);
    }
    console.log("You clicked at: " + e.latlng);
    markers[round - 1] = L.marker(e.latlng).addTo(map);
}

// Display the score screen
function showScoreScreen() {
    showContent('score-screen');
    document.getElementById('score-screen').innerHTML =
        "<div class = 'score-map' id='scoreMap'></div>" + 
        "<div id = 'score-container'>" +
        "<p id='score' class='score-info'></p>" + 
        "<div class = 'skill-bar'><div class = 'progress' id = 'progress'></div></div>" + 
        "<p id='distance' class='score-info'></p>" +
        "<button id='next-button' class='next-button'>Next Location</button></div>";
    document.getElementById('guess-screen').innerHTML = "";

    scoreMap = L.map('scoreMap', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 5,
        attribution: '<a href="https://wynntils.com/">Wynntils</a> Map'
        //renderer: L.canvas({ padding: 10 })
    }).setView([0, 0], 0);
    var bounds = [[159, -2383], [6573, 1651]]; // Map bounds
    L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(scoreMap);
    scoreMap.setView([3000, -500], -1);
    scoreMap.on('click', onMapClick);

    var xGuess = markers[round - 1].getLatLng().lng;
    var zGuess = -markers[round - 1].getLatLng().lat;
    console.log(images[round - 1]);
    var xActual = images[round - 1]['X'];
    var zActual = images[round - 1]['Z'];

    //console.log("Actual coords: " + [-zActual, xActual] + ", Guess coords: " + [-zGuess, xGuess]);
    var distance = Math.sqrt(Math.pow(xActual - xGuess, 2) + Math.pow(zActual - zGuess, 2)).toFixed(2);
    console.log("Distance: " + distance + " blocks away!");
    score = Math.round(5000 - distance + .5);
    if (distance > 5000) {
        score = 0;
    }
    totalScore += score;

    document.getElementById('distance').innerHTML = "Distance: " + distance + " blocks away!";
    document.getElementById('progress').style.width = (distance / 5000) * 100 + "%";
    document.getElementById('totalScore').innerHTML = "Score: " + totalScore + "/" + round * 5000;
    document.getElementById('score').innerHTML = "Score: " + score + " points!";

    document.getElementById('next-button').onclick = showNextLocation;

    
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    L.marker([-zActual, xActual], { icon: greenIcon }).addTo(scoreMap);
    
    L.marker([-zGuess, xGuess]).addTo(scoreMap);
    
    //draws line between guess and actual location
    polylines[round - 1] = L.polyline([[-zActual, xActual], [-zGuess, xGuess]], { color: 'red' }).addTo(scoreMap);
    scoreMap.fitBounds(polylines[round - 1].getBounds());
}

// Load the next location
function showNextLocation() {
    if(round == 5){
        showScoreScreen();
    }
    showContent('guess-screen');

    document.getElementById('guess-screen').innerHTML = 
    "<div id='vrview' class = vr-image></div>" +
    "<div class = 'map-container' id = 'map-container'>" +
        "<div class = 'map' id='map'></div>" +
        "<button id='guess-button' class = 'guess-button' type = 'submit'>Guess!</button></div>";
    
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 5,
        renderer: L.canvas({ padding: 10 }), 
        attribution: '<a href="https://wynntils.com/">Wynntils</a> Map'
    }).setView([0, 0], 0);

    var bounds = [[159, -2383], [6573, 1651]]; // Map bounds
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
    images[round - 1] = LOCATIONS[rand];
    LOCATIONS.splice(rand, 1);
    //loads next vrview image
    console.log(images[round - 1]);
    //sets up guess button functionality
    document.getElementById('guess-button').onclick = function () {
        if (markers[round - 1] == undefined) {
            document.getElementById('guess-button').innerHTML = "Select a location first!";
            document.getElementById('guess-button').style.backgroundColor = "red";
            return;
        }
        showScoreScreen();
    };
    
    var vrView = new VRView.Player('#vrview', {
        image: images[round - 1]['url'],
        is_stereo: false,
        is_autopan_off: true
    });
    //removes all markers from the map
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            layer.remove();
        }
    });
    if(polylines[round - 1]){
        map.removeLayer(polyline);
    }
    marker = null;
    
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