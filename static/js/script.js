var provinces = $('#game-variables').attr('provinces');
var look = $('#game-variables').attr('look');
var timeLimit = $('#game-variables').attr('timeLimit');
var LOCATIONS;
var round = 0;
var maxRounds = $('#game-variables').attr('rounds');
var score = 0;
var totalScore = 0;
var images = new Array(Number(maxRounds));
var markers = new Array(Number(maxRounds));
var polylines = new Array(Number(maxRounds));
var map;
var timer = 0;
var scoreMap;
var totalTime = 0;

// Document ready function
$(document).ready(function() {
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
    });
}


// Handle map click event to set a marker
function onMapClick(e) {
    if (markers[round - 1] != undefined) {
        map.removeLayer(markers[round - 1]);
    }
    markers[round - 1] = L.marker(e.latlng).addTo(map);
}

// Display the score screen
function showScoreScreen() {
    if(timeLimit > 0){
        clearTimeout(timer);
    }
    showContent('score-screen');
    document.getElementById('score-screen').innerHTML =
        "<div class = 'score-map' id='scoreMap'></div>" + 
        "<div id = 'score-container'>" +
        "<p id='score' class='score-info'></p>" + 
        "<div class = 'progress-bar'>" +
        "<div class = 'progress' id = 'progress'></div></div>" + 
        "<p id='distance' class='score-info'></p>" +
        "<button id='next-button' class='next-button'>Next Location</button></div>";
    document.getElementById('guess-screen').innerHTML = "";

    scoreMap = L.map('scoreMap', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 5,
        attribution: '<a href="https://wynntils.com/">Wynntils Map</a>'
    }).setView([0, 0], 0);
    var bounds = [[159, -2383], [6573, 1651]]; // Map bounds
    L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(scoreMap);
    scoreMap.setView([3000, -500], -1);
    scoreMap.on('click', onMapClick);

    var xActual = images[round - 1]['X'];
    var zActual = images[round - 1]['Z'];
    if(markers[round - 1] == undefined){
        document.getElementById('score').innerHTML = "No location selected!";
        document.getElementById('progress').style.width = "0%";
        document.getElementById('distance').innerHTML = "Distance: 0 blocks away!";
        document.getElementById('next-button').onclick = function(){
            showNextLocation();
        };
        var greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.marker([-zActual, xActual], { icon: greenIcon }).addTo(scoreMap);
        scoreMap.fitBounds([[[-zActual, xActual], [-zActual, xActual]]]);
        return;
    }
    var xGuess = markers[round - 1].getLatLng().lng;
    var zGuess = -markers[round - 1].getLatLng().lat;


    var distance = Math.sqrt(Math.pow(xActual - xGuess, 2) + Math.pow(zActual - zGuess, 2)).toFixed(2);
    score = Math.round(5200/(1 + .002* Math.E ** (.0042*distance + 3)) + .822);
    if (score < 0) {
        score = 0;
    }
    totalScore += score;

    document.getElementById('distance').innerHTML = "Distance: " + distance + " blocks away!";
    document.getElementById('progress').style.width = (score / 5000) * 100 + "%";
    document.getElementById('totalScore').innerHTML = "Score: " + totalScore;
    document.getElementById('score').innerHTML = score + " points!";

    document.getElementById('next-button').onclick = function(){
        if(round >= maxRounds){
            post('/api/score', {'score': totalScore, 'look': look, 'provinces': provinces, 'totalTime': totalTime});
            finalScore();
        }
        else{
            showNextLocation();
        }
    };
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
    if(timeLimit > 0){
        let countdown = timeLimit;
        timer = setInterval(function(){
            console.log(countdown);
            document.getElementById('time-left').innerHTML = "Time: " + countdown;
            countdown--;
            totalTime++;
            if (countdown < 0) {
                clearInterval(time);
                console.log('Time limit reached');
                showScoreScreen();
            }
        }, 1000);
    }

    showContent('guess-screen');
    round++;
    
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
        attribution: '<a href="https://wynntils.com/">Wynntils Map</a>'
    }).setView([0, 0], 0);

    var bounds = [[159, -2383], [6573, 1651]]; // Map bounds
    L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(map);
    map.setView([3000, -500], -2);
    map.on('click', onMapClick);

    //selects a random location from the list of locations and removes it to prevent duplicates
    var rand = Math.floor(Math.random() * LOCATIONS.length);
    images[round - 1] = LOCATIONS[rand];
    LOCATIONS.splice(rand, 1);
    //loads next vrview image
    //sets up guess button functionality
    document.getElementById('guess-button').onclick = function () {
        if (markers[round - 1] == undefined) {
            document.getElementById('guess-button').innerHTML = "Select a location first!";
            document.getElementById('guess-button').style.backgroundColor = "red";
            return;
        }
        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }
        showScoreScreen();
    };
    
    if(look == 'True'){
        $('#vrview').css('pointer-events', 'none');
    }
    var vrView = new VRView.Player('#vrview', {
        image: images[round - 1]['url'],
        is_stereo: false,
        is_autopan_off: true,
    });
    //removes all markers from the map
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            layer.remove();
        }
    });
    if(polylines[round - 1] != undefined){
        console.log('removing polyline');
        map.removeLayer(polyline);
    }
    marker = null;
    
    document.getElementById('round-number').innerHTML = "Round: " + round + "/" + maxRounds;
    
    
}
function showContent(contentId){
    document.getElementById('guess-screen').style.display = "none";
    document.getElementById('score-screen').style.display = "none";
    document.getElementById(contentId).style.display = "block";
}

function finalScore() {
    showContent('score-screen');
    document.getElementById('score-screen').innerHTML =
        "<div class = 'score-map' id='scoreMap'></div>" + 
        "<div id = 'score-container'>" +
        "<p id='Finish Message' class='score-info'>Game Finished!</p>" + 
        "<div class = 'progress-bar'>" +
        "<div class = 'progress' id = 'progress'></div></div>" + 
        "<p id='score' class='score-info'></p>" + 
        "<button id='next-button' class='next-button'>Play Again!</button></div>";
    document.getElementById('guess-screen').innerHTML = "";

    scoreMap = L.map('scoreMap', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 5,
        attribution: '<a href="https://wynntils.com/">Wynntils Map</a>'
        //renderer: L.canvas({ padding: 10 })
    }).setView([0, 0], 0);
    var bounds = [[159, -2383], [6573, 1651]]; // Map bounds
    L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(scoreMap);
    scoreMap.setView([3000, -500], -1);
    scoreMap.on('click', onMapClick);
    
    var featureGroup = [];
    for(let i = 0; i < images.length; i++){
        var greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        let answer = L.marker([-images[i]['Z'], images[i]['X']], { icon: greenIcon }).addTo(scoreMap);
        featureGroup.push(answer);
        if(markers[i] != undefined){
            L.marker(markers[i].getLatLng()).addTo(scoreMap);
            featureGroup.push(markers[i]);
        }
        if(polylines[i] != undefined){
            polylines[i].addTo(scoreMap);
        }
    }
    var group = new L.featureGroup(featureGroup);
    scoreMap.fitBounds(group.getBounds());

    document.getElementById('score').innerHTML = "Final Score: " + totalScore + "/" + maxRounds * 5000;
    document.getElementById('progress').style.width = (totalScore / (maxRounds * 5000)) * 100 + "%";
    $('#next-button').click(function(){
        location.reload();
    });
}

function post(path, params, method='post') {
    $.ajax({
        url: path,
        data: params,
        type: method,
        dataType: 'json',
        success: function(response){
            console.log(response);
        },
        error: function(error){
            console.log(error);
        }
    });
}
