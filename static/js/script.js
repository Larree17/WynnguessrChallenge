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

    //function to get coords of the map when clicked
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
        var rand = Math.floor(Math.random() * data.length);
        console.log("Index Number: " + rand);
        LOCATIONS = data;
        console.log(LOCATIONS);
        image = LOCATIONS[rand];
        window.addEventListener('load', onVrViewLoad);

            function onVrViewLoad() {
                var vrView = new VRView.Player('#vrview', {
                    image: image['url'],
                    is_stereo: false 
                });
            }
    });
});