//vr view initialization
window.addEventListener('load', onVrViewLoad);

        function onVrViewLoad() {
            var vrView = new VRView.Player('#vrview', {
                image: 'http://127.0.0.1:5000/static/locations/emerald%20trail%20360.png',
                width: window.screen.width,
                height: window.screen.height,
                is_stereo: false // Change to true if the image is stereo
            });
        }

//leaflet map initialization
document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map',{
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 4
    }).setView([0, 0], 0);
    var bounds = [[157,-2392], [6542,1699]];//coords of the bounds of map
    var image = L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(map);
    map.fitBounds(bounds);
    map.setView( [1000, 100], -2);
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
});

function convertCoords(z, x){
    
    return [z * -1, x];
}

//function to get values of marker when guess button is clicked
document.getElementById('guess-button').onclick = function(){
    if(marker == undefined){
        alert("Please select a location on the map");
        return;
    }
    alert(marker.getLatLng());

};