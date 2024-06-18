var LOCATIONS;
var image;
var round = 1;
var score = 0;
var totalScore = 0;
//leaflet map initialization
document.addEventListener('DOMContentLoaded', function () {

    fetch('/api/locations')
    .then(response => response.json())
    .then(data => {
        //initializing image with a random location and storing info
        LOCATIONS = data;
        console.log(LOCATIONS);
        nextLocation();
    });

    var map = L.map('map',{
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 5
    }).setView([0, 0], 0);
    var bounds = [[123,-2392], [6608,1699]];//coords of the bounds of map
    var image = L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(map);
    map.fitBounds(bounds);
    map.setView( [3000, -500], -2);
    console.log(map.getZoom());

    //function to set marker on map where clicked
    var marker;
    function onMapClick(e) {
        if(marker != undefined){
            map.removeLayer(marker);
        }
        console.log("You clicked the map at " + e.latlng);
        marker = L.marker(e.latlng).addTo(map);
        
    }
    map.on('click', onMapClick);

    //function to react to guess button press
    document.getElementById('guess-button').onclick = function(){
        //calculates distance between actual and guessed location
        if(marker == undefined){
            document.getElementById('guess-button').innerHTML = "Select a location first!";
            document.getElementById('guess-button').style.backgroundColor = "red";
            return;
        }
        var xGuess = marker.getLatLng().lng;
        var zGuess = -marker.getLatLng().lat;
        var xActual = image['X'];
        var zActual = image['Z'];
        marker = L.marker([-zActual,xActual]).addTo(map);

        console.log("Actual: " + xActual + ", " + zActual + " Guess: " + xGuess + ", " + zGuess);
        var distance = Math.sqrt(Math.pow(xActual - xGuess, 2) + Math.pow(zActual - zGuess, 2));
        console.log("Distance: " + distance.toFixed(2) + " blocks away!");

        score = 5000 - distance;
        if(distance > 5000){
            score = 0;
        }
        totalScore += score;
        
        //post results
        document.getElementById('guess-button').innerHTML = "Distance: " + distance.toFixed(2) + " blocks away!";

        scoreScreen();
    };

    //function to react to next image button press
    document.getElementById('next-button').onclick = function(){
        
        //bring map back to corner TODO

        //bring in score screen TODO

        //remove all markers TODO

        //remove hover css map change TODO

        //set map sight to cover all points TODO

        //remove guess button TODO


        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
               layer.remove();
            }
          });
        nextLocation();
        //update round number
    };


    function convertCoords(z, x){
        
        return [z * -1, x];
    }

    function nextLocation(){
        //if somehow runs out of locations
        if(LOCATIONS.length == 0){
            document.getElementById('guess-button').innerHTML = "No more locations!";
            document.getElementById('guess-button').style.backgroundColor = "red";
            return;
        }
        //creates new vr view with a random location and sets image to coordinates
        var rand = Math.floor(Math.random() * LOCATIONS.length);
        console.log("Index Number: " + rand);
        image = LOCATIONS[rand];
        LOCATIONS.splice(rand, 1);
        console.log(image);
        var vrView = new VRView.Player('#vrview', {
            image: image['url'],
            is_stereo: false 
        });
    }
    function scoreScreen(){
        //TODO
        document.getElementById('score-screen').innerHTML = 
        "<h1>Your Score</h1>" + 
        "<p id='score'></p>" +
        "<button id='next-button' class='guess-button'>Next</button>";
        document.getElementById('score').innerHTML = "Score: " + (totalScore + score)+ "/" + round * 5000;
        
    }
    function finalScore(){
        //TODO

    }
});

