// Client facing scripts here
$(document).ready(() => {

  const markersMax = 2000;

  let map = L.map('map').setView([52.268112, -113.811241], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright%22%3EOpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([52.268112, -113.811241]).addTo(map);

  
  let markersGroup = L.layerGroup();
  map.addLayer(markersGroup);

  const renderMarkers = function(events) {
    console.log("events", events)

    for (const event of events) {
      const marker = L.marker([event.latitude, event.longitude]).addTo(markersGroup);
      marker.bindPopup(`<h3>${event.name}</h3><p>${event.description}</p>`);
    }
  };

  const loadEvents = async function() {
    const response = await fetch('/api/events');
    const data = await response.json();
    //console.log("data", data)
    renderMarkers(data.events);
  };

  loadEvents();


  map.on('click', function(e) {
    // get the count of currently displayed markers
    let markersCount = markersGroup.getLayers().length;
    let coord = e.latlng;
    let lat = coord.lat;
    let lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);

    if (markersCount < markersMax) {
      let marker = L.marker(e.latlng).addTo(markersGroup);
      console.log(get)
        .bindPopup('Add event to this location?<br><button type="submit">Add</button>')
        .openPopup();
      return;
    }

    markersGroup.clearLayers();
  });
});
