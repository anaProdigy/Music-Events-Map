// Client facing scripts here
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
    console.log("events", events)

    // create LatLongBounds object so we can zoom the map to fit the set of location events
    const bounds = L.latLngBounds();

    for (const event of events) {
      const marker = L.marker([event.latitude, event.longitude]).addTo(markersGroup);
      marker.bindPopup(`<h3>${event.name}</h3><p>${event.description}</p>`);

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
    // get the count of currently displayed markers
    let markersCount = markersGroup.getLayers().length;
    let coord = e.latlng;
    let lat = coord.lat;
    let lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);

    if (markersCount < markersMax) {
      let marker = L.marker(e.latlng).addTo(markersGroup);
        .bindPopup('Add event to this location?<br><button type="submit">Add</button>')
        .openPopup();
      return;
    }

    markersGroup.clearLayers();
  });
});
