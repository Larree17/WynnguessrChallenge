var LOCATIONS;
var image;
//leaflet map initialization
document.addEventListener('DOMContentLoaded', function () {
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

    //function to calculate distance between two points
    document.getElementById('guess-button').onclick = function(){
        if(marker == undefined){
            document.getElementById('guess-button').innerHTML = "Select a location first!";
            document.getElementById('guess-button').style.backgroundColor = "red";
        }
        var xGuess = marker.getLatLng().lng;
        var zGuess = -marker.getLatLng().lat;
        var xActual = image['X'];
        var zActual = image['Z'];
        marker = L.marker([-zActual,xActual]).addTo(map);

        console.log("Actual: " + xActual + ", " + zActual + " Guess: " + xGuess + ", " + zGuess);
        var distance = Math.sqrt(Math.pow(xActual - xGuess, 2) + Math.pow(zActual - zGuess, 2));
        console.log("Distance: " + distance.toFixed(2) + " blocks away!");
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
               layer.remove();
            }
          });

        nextLocation();
    };

    function convertCoords(z, x){
        
        return [z * -1, x];
    }

    //vr view initialization
    
    //gets all locations from the database
    fetch('/api/locations')
    .then(response => response.json())
    .then(data => {
        //initializing image with a random location and storing info
        LOCATIONS = data;
        console.log(LOCATIONS);
        nextLocation();
    });

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
});

