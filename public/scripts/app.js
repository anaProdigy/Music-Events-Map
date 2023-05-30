// Client facing scripts here
const markers = {};

$(document).ready(() => {

  const markersMax = 2000;

  // old code to show openmaps tile map
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="https://osm.org/copyright%22%3EOpenStreetMap</a> contributors'
  // }).addTo(map);

  // openstreetmaps map
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright%22%3EOpenStreetMap</a> contributors'
  });

  // we need to confirm terms of use for the google stuff
  // google streets map
  const googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });

  // google hybrid map
  const googleHybrid = L.tileLayer('http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });

  // old code defining map and where it is centered
  // let map = L.map('map').setView([52.268112, -113.811241], 5);

  // implement layers control
  let map = L.map('map', {
    center: [52.268112, -113.811241],
    zoom: 5,
    layers: [osm]
  });

  // base layers we want to switch between in layers control
  const baseMaps = {
    "OpenStreetMap": osm,
    "Google Streets": googleStreets,
    "Google Hybrid": googleHybrid
  };

  // display layers control and make it always visible in the top right corner, we can filter from here
  const layerControl = L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);

  // old default display marker we used to have something on the map
  // L.marker([52.268112, -113.811241]).addTo(map);

  let markersGroup = L.layerGroup();
  map.addLayer(markersGroup);

  const renderMarkers = function (events) {
    

    // create LatLongBounds object so we can zoom the map to fit the set of location events
    const bounds = L.latLngBounds();

    for (const event of events) {
      const marker = L.marker([event.latitude, event.longitude]).addTo(markersGroup);
      marker.bindPopup(`<h3>${event.name}</h3><p>${event.description}</p>`);

      //ADD MARKER TO MARKERS OBJECT????????
      
      markers[event.id] = marker
      console.log("markers", markers)
      // extend latLndBounds with coordinates
      bounds.extend([event.latitude, event.longitude]);
    }
    // fit map to bounds
    map.fitBounds(bounds);
  };

  const loadEvents = async function () {
    const response = await fetch('/api/events');
    const data = await response.json();
    //console.log("data", data)
    renderMarkers(data.events);
  };

  loadEvents();

  map.on('click', function (e) {
    let marker;
    // get the count of currently displayed markers
    let markersCount = markersGroup.getLayers().length;
    let coord = e.latlng;
    let lat = coord.lat;
    let lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);

    if (markersCount < markersMax) {
      marker = L.marker(e.latlng).addTo(markersGroup)
        .bindPopup(`<b>Add event to this location?</b><br><button type='submit' class='marker-submit-button'>Add</button>
        <button type='delete' class='marker-delete-button'>No</button>`);
      marker.on('popupopen', onPopupOpen)
        // marker.on('popupclose', onPopupClose)
        .openPopup();

      marker._popup._closeButton.onclick = function () {
        if ($('.add-event-section').is(":visible")) {
          $('.add-event-section').slideToggle();
        };
        map.removeLayer(marker);
        return;
      }
    };

    // Function to handle add event/delete marker on marker popup open
    function onPopupOpen() {

      let tempMarker = this;

      // To remove marker on click of delete button in the popup of marker
      $('.marker-delete-button:visible').click(function () {
        map.removeLayer(tempMarker);
        if ($('.add-event-section').is(":visible")) {
          $('.add-event-section').slideToggle();
        };
      });
      // to toggle add event form on click of add button in popup
      $('.marker-submit-button:visible').click(function () {
        $('.add-event-section').slideToggle();
        map.closePopup();
        $('#name').focus();
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
      });
    };
    // to remove marker and close form when 'cancel' button is clicked
    $('.cancel-event').click(function () {
      if ($('.add-event-section').is(":visible")) {
        $('#event-form').trigger("reset");
        $('.add-event-section').hide(500);
      };
      map.removeLayer(marker);
      return;
    });

  });

});
