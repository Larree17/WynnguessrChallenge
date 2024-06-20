var LOCATIONS;
var image;
var round = 1;
var score = 0;
var totalScore = 0;
var scoreScreen = false;
document.addEventListener('DOMContentLoaded', function () {

    fetch('/api/locations')
    .then(response => response.json())
    .then(data => {
        //initializing image with a random location and storing info
        LOCATIONS = data;
        console.log(LOCATIONS);
        showNextLocation();
    });
    //leaflet map initialization
    var map = L.map('map',{
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 5,
        renderer: L.canvas({ padding: 10 })
    }).setView([0, 0], 0);
    var bounds = [[123,-2392], [6608,1699]];//coords of the bounds of map
    var image = L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(map);
    map.fitBounds(bounds);
    map.setView( [3000, -500], -2);
    console.log(map.getZoom());

    //function to set marker on map where clicked
    var marker;
    function onMapClick(e) {
        if(scoreScreen){
            return;
        }
        if(marker != undefined){
            map.removeLayer(marker);
        }
        console.log("You clicked at: " + e.latlng)
        marker = L.marker(e.latlng).addTo(map);
    }
    map.on('click', onMapClick);

    //loads score screen and calculates distance between actual and guessed location
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
        //sets actual marker as green marker on map
        var greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.marker([-zActual,xActual], {icon: greenIcon}).addTo(map);
        console.log("Actual Point: " +[-zActual, xActual] + ", Guess Point: " + [-zGuess, xGuess])
        var polyline = L.polyline([[-zActual, xActual], [-zGuess, xGuess]], {color: 'red'}).addTo(map);
        // zoom the map to the polyline
        map.fitBounds(polyline.getBounds());
        console.log("Actual: " + xActual + ", " + zActual + " Guess: " + xGuess + ", " + zGuess);
        var distance = Math.sqrt(Math.pow(xActual - xGuess, 2) + Math.pow(zActual - zGuess, 2));
        console.log("Distance: " + distance.toFixed(2) + " blocks away!");

        score = 5000 - distance;
        if(distance > 5000){
            score = 0;
        }
        totalScore += score;
        
        //post results TODO works for now
        document.getElementById('guess-button').innerHTML = "Distance: " + distance.toFixed(2) + " blocks away!";

        showScoreScreen();
        map.setview(polyline.getBounds());
    };

    //function to react to next image button press
    document.getElementById('next-button').onclick = function(){
        
        
        showNextLocation();
        
    };

    function showNextLocation(){
        //bring map back to corner TODO

        //bring in score screen TODO

        //remove all markers TODO

        //remove hover css map change TODO

        //set map sight to cover all points TODO

        //remove guess button TODO

        //if somehow runs out of locations
        scoreScreen = false;
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
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
               layer.remove();
            }
          });
        //update round number
        round++;
        document.getElementById('round').innerHTML = "Round: " + round + "/5 ";
    }

    function showScoreScreen(){
        //adds score screen HTML and styles
        scoreScreen = true;
        document.getElementById('score-screen').innerHTML = 
        "<p id = 'distance' class = 'score-info'> </p>" +
        "<button id='next-button' class='next-button'>Next Location</button>" + 
        "<p id='score' class = 'score-info'>SCOREEEEEEEEEEEEEEEE</p>";
        document.getElementById('distance').innerHTML = "Distance: " + (5000 - score).toFixed(2) + " blocks away!";
        document.getElementById('score').innerHTML = "Score: " + (totalScore + score)+ "/" + round * 5000;
        document.getElementById('map-container').style.top = "5.5%";
        document.getElementById('map-container').style.height = "84.5%";
        document.getElementById('map-container').style.width = "100%";
        document.getElementById('score-screen').style.display = "flex";
        document.getElementById('guess-button').style.display = "none";
        document.getElementById('vrview').style.display = "none";
        
    }
    function finalScore(){
        //TODO

    }
});

