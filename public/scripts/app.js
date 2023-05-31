// Client facing scripts here
//global object to store created marker, need for deleting them
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

      //add marker to markers object with event id as a key, need to handle deliting them
      markers[event.id] = marker

      // extend latLndBounds with coordinates
      bounds.extend([event.latitude, event.longitude]);
    }
    // fit map to bounds
    map.fitBounds(bounds);
    console.log("markersLength", Object.keys(markers).length)
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
        $(".add-event").html("Add Event");
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

  //ADD EVENTS
  $('#event-form').submit(function(e) {
    console.log('Button clicked, performing ajax call...');
    e.preventDefault();

    const form = $(this);
    const data = $(this).serialize();
    // console.log('data: ', data);

    $.post('/api/events/', data, function(response) {
      console.log('Sending form data to server');
      // clear form
      form.trigger('reset');
      form.hide(500);
      console.log(response);

      //load all events plus newly added event
      loadEvents();
    });
  });

  //return user id number from cookies to make userId dynamic
  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  //convert from string to number
  let userId = parseInt(getCookie("user_id"));
  // console.log("user_id", userId)

  // Fetch user's created events
  $.ajax({
    url: '/api/events',
    method: 'GET',
    success: function (response) {
      // console.log('All events:', response.events);
      // Handle the success response and filter the events by the user ID
      let events = response.events.filter(function (event) {
        return event.creator_id === userId;
      });
      // console.log('Filtered events:', events);
      //reference to html
      let dropdownMenu = $('#created-events');

      // Check if any events exist
      if (events.length > 0) {
        // Clear the dropdown menu
        dropdownMenu.empty();

        // Iterate over each event and create dropdown items
        events.forEach(function (event) {
          let eventItem = $('<a class="dropdown-item" href="#">')
            .text(event.name)
            .append('<div class="float-right">' +
              '<button class="btn btn-sm btn-info edit-event">Edit</button>' +
              '<button class="btn btn-sm btn-danger delete-event">Delete</button>' +
              '</div>');

          // Add event data as data attributes to the event item
          eventItem.data('event', event);

          dropdownMenu.append(eventItem);
        });
      } else {
        // If no events exist, display a message or placeholder item
        dropdownMenu.html('<span class="dropdown-item">No events found</span>');
      }
    },
    error: function (xhr, status, error) {
      // Handle the error response
      console.error('Error fetching events:', error);
    }
  });

  // Handle edit event click
  $(document).on('click', '.edit-event', function (e) {
    $(".add-event").html("Edit Event");
    // open event form
    if ($('.add-event-section').is(":hidden")) {
      $('.add-event-section').slideToggle();
    }
    e.preventDefault();

    let eventItem = $(this).closest('.dropdown-item');
    let event = eventItem.data('event');
    let startDate = dayjs(event.start_date).format('YYYY-MM-DD');
    let endDate = dayjs(event.end_date).format('YYYY-MM-DD');


    // set fields from event object
    $('#id').val(event.id);
    $('#creator_id').val(event.creator_id);
    $('#name').val(event.name);
    $('#description').val(event.description);
    $('#start-date').val(startDate);
    $('#end-date').val(endDate);
    $('#venue').val(event.venue);
    $('#city').val(event.city);
    $('#latitude').val(event.latitude);
    $('#longitude').val(event.longitude);
    $('#event-link').val(event.event_link_url);
    $('#event-thumbnail').val(event.event_thumbnail_url);

    // to remove marker and close form when 'cancel' button is clicked
    $('.cancel-event').click(function () {
      if ($('.add-event-section').is(":visible")) {
        $('#event-form').trigger("reset");
        $('.add-event-section').hide(500);
      };
    });
    // Send an AJAX request to edit the event
    $.ajax({
      url: '/api/events/',
      method: 'POST',
      success: function (response) {
        // submit new
        $('#event-form').submit(function (e) {
          console.log('Button clicked, performing ajax call...');
          e.preventDefault();

          const form = $(this);
          const data = $(this).serialize();
          // console.log('data: ', data);

          $.post('/api/events/', data, function () {
            console.log('Sending form data to server');
            // clear form
            form.trigger('reset');
            form.hide(500);
            loadEvents();
          });
        });
      },
      error: function (xhr, status, error) {
        // Handle the error response
        console.error('Error deleting event:', error);
      }
    });
  });

  // Handle delete event click
  $(document).on('click', '.delete-event', function (e) {
    e.preventDefault();
    let eventItem = $(this).closest('.dropdown-item');
    let event = eventItem.data('event');
    // Perform delete event action with the event data
    console.log('Delete event:', event);

    // Prompt the user for confirmation before deleting the event
    if (confirm('Are you sure you want to delete this event?')) {
      // Send an AJAX request to delete the event
      $.ajax({
        url: '/api/events/' + event.id,
        method: 'DELETE',
        success: function (response) {
          // Handle the success response
          //remove event from db and list
          eventItem.remove();

          //REMOVE MARKER
          markers[event.id].remove();
        },
        error: function (xhr, status, error) {
          // Handle the error response
          console.error('Error deleting event:', error);
        }
      });
    }
  });

  });

});
