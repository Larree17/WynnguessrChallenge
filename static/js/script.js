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
        maxZoom: 3
    }).setView([0, 0], 0);
    var bounds = [[0,-2000], [6485,2091]];
    var image = L.imageOverlay('static/Wynncraft Map.png', bounds).addTo(map);
    map.fitBounds(bounds);
    //adds marker to the map
    coords = convertCoords(0, 0);
    L.marker(L.latLng(coords)).addTo(map);
    L.marker(L.latLng(convertCoords(-2264, -74))).addTo(map);
    map.setView( [70, 120], 1);
    
});

function convertCoords(z, x){
    
    return [z * -1, x];
}