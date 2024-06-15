var locations;
//leaflet map initialization
document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map',{
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 2
    }).setView([0, 0], 0);
    var bounds = [[157,-2392], [6542,1699]];//coords of the bounds of map
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
        alert(marker.getLatLng());

    };

    function convertCoords(z, x){
        
        return [z * -1, x];
    }

    //vr view initialization
    window.addEventListener('load', onVrViewLoad);

            function onVrViewLoad() {
                var vrView = new VRView.Player('#vrview', {
                    image: 'static/locations/almuj 360.png',
                    
                    is_stereo: false // Change to true if the image is stereo
                });
            }

    fetch('/api/locations').then(response => response.json()).then(data => {locations = data.locations});
    alert(locations);
});