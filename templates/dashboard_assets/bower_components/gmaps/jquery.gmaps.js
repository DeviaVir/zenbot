$(document).ready(function() {
    // Simple map
    map = new GMaps({
        el: '#gmaps-simple',
        lat: 34.05,
        lng: -78.72,
        zoom: 5,
        panControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        overviewMapControl: false
    });
});
