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

    // helper function that determines if a date is before current date
    const isInThePast = function (date) {
      const today = new Date().toISOString().slice(0, 10);

      if (date < today && date !== today) {
        return true;
      }
      return false;
    };

    for (const event of events) {
      // if event.end_date is before today's date, don't display the event
      if (!isInThePast(event.end_date)) {
        const marker = L.marker([event.latitude, event.longitude]).addTo(markersGroup);
        const popupContent = `
        <h3>${event.name}</h3><p>${dayjs(event.start_date).format('MMMM D, YYYY')}</p>
        <p>${event.description}<p id="collapsible"><strong>. . .</strong></p>
        `;
        const popupExpansion = `
        <div id="expand">
          <p><b>Venue:</b> ${event.venue}<br><b>City:</b> ${event.city}<br>
          <b>Until:</b> ${dayjs(event.end_date).format('MMMM D, YYYY')}<br>
          <b>Link:</b> <a target="_blank" href=${event.event_link_url}>${event.event_link_url}</a><br>
          <b>More information:</b><a target="_blank" href=${event.event_thumbnail_url}>${event.event_thumbnail_url}</a></p>
        </div>
        `;

        // this won't work twice in a row ?
        const onPopupOpen = function () {
          $('#collapsible').click(function (e) {
            if ($('#expand').is(':visible')) {
              $('#expand').hide();
            } else {
              $('#expand').show();
            }
          });
        };
        marker.bindPopup(popupContent + popupExpansion);
        marker.on('popupopen', onPopupOpen);

        //add marker to markers object with event id as a key, need to handle deliting them

        markers[event.id] = marker;

        // extend latLndBounds with coordinates
        bounds.extend([event.latitude, event.longitude]);
      }
    }

    // fit map to bounds
    map.fitBounds(bounds);
    console.log("markersLength", Object.keys(markers).length);
  };

  const loadEvents = async function () {
    const response = await fetch('/api/events');
    const data = await response.json();
    //console.log("data", data)
    renderMarkers(data.events);
  };

  loadEvents();


  //move marker var outside of event listener
  let marker;
  map.on('click', function (e) {

    // get the count of currently displayed markers
    let markersCount = markersGroup.getLayers().length;
    let coord = e.latlng;
    let lat = coord.lat;
    let lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);

    //remove previous temp markers if there were any
    if (marker) {
      map.removeLayer(marker);
    }


    if (markersCount < markersMax) {
      marker = L.marker(e.latlng).addTo(markersGroup)
        .bindPopup(`<b>Add event to this location?</b><br><button type='submit' class='marker-submit-button'>Add</button>
        <button type='delete' class='marker-delete-button'>No</button>`);
      marker.on('popupopen', onPopupOpen)
        .openPopup();

      marker._popup._closeButton.onclick = function () {
        if ($('.add-event-section').is(":visible")) {
          $('.add-event-section').slideToggle();
        };
        map.removeLayer(marker);
        return;
      };
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
        $('#latitude').val(lat);
        $('#longitude').val(lng);

        //remove temp marker
        if (!$('.add-event-section').is(":visible")) {
          map.removeLayer(tempMarker);
        }
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

  //ADD EVENTS
  $('#event-form').submit(function (e) {
    console.log('Button clicked, performing ajax call...');
    e.preventDefault();

    const form = $(this);
    const data = $(this).serialize();
    // console.log('data: ', data);

    $.post('/api/events/', data, function (response) {
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
            .append(`
            <div class="float-right">
              <button class="btn btn-sm btn-info edit-event">Edit</button>
              <button class="btn btn-sm btn-danger delete-event">Delete</button>
            </div>
            `);

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
    $('.edit-event-section')
      .append(`
    <form id="edit-event-form">
      <input class="event-input" type="text" id="edit-name" placeholder="event name" name="name" required>
      <input class="event-input" type="text" id="edit-venue" name="venue" placeholder="venue" required>
      <input class="event-input" type="text" id="edit-city" placeholder="city" name="city" required>
      <textarea id="edit-description" placeholder="event description" name="description" required></textarea>
      <input class="event-input" type="date" id="edit-start-date" name="start-date" placeholder="start date" required>
      <input class="event-input" type="date" id="edit-end-date" name="end-date" placeholder="end date" required>
      <input class="event-input" type="number" id="edit-latitude" name="latitude" readonly>
      <input class="event-input" type="number" id="edit-longitude" name="longitude" readonly>
      <input class="event-input" type="text" id="edit-event-link" name="event-link" placeholder="event link">
      <input class="event-input" type="text" id="edit-event-thumbnail" name="event-thumbnail" placeholder="add event image or flyer">
      <button class = "edit-event" type="submit">Edit Event</button>
      <button class = "cancel-edit" type="button">Nevermind</button>
    </form>
    `);
    // open event form
    $('.edit-event-section').slideToggle();
    e.preventDefault();
    //access event to prepopulate form fields
    let eventItem = $(this).closest('.dropdown-item');
    let event = eventItem.data('event');
    // convert store date to proper format
    let startDate = dayjs(event.start - date).format('YYYY-MM-DD');
    let endDate = dayjs(event.end - date).format('YYYY-MM-DD');

    // set form fields from event object
    $('#edit-name').val(event.name);
    $('#edit-description').val(event.description);
    $('#edit-start-date').val(startDate);
    $('#edit-end-date').val(endDate);
    $('#edit-venue').val(event.venue);
    $('#edit-city').val(event.city);
    $('#edit-latitude').val(event.latitude);
    $('#edit-longitude').val(event.longitude);
    $('#edit-event-link').val(event.event - link - url);
    $('#edit-event-thumbnail').val(event.event - thumbnail - url); // this isn't filling ??

    // to clear and close form when 'cancel' button is clicked
    $('.cancel-edit').click(function () {
      if ($('.edit-event-section').is(":visible")) {
        $('#edit-event-form').trigger("reset");
        $('.edit-event-section').hide(500);
      };
    });
    // Send an AJAX request to edit the event
    // $.ajax({
    //   url: '/api/events/' + event.id,
    //   method: 'PUT',
    //   success: function (response) {
    //     // submit new
    $('#edit-event-form').submit(function (e) {
      console.log('Button clicked, performing ajax call...');
      e.preventDefault();

      const form = $(this);
      const data = $(this).serialize();
      // console.log('data: ', data);

      $.put('/api/events/', data, function () {
        console.log('Sending form data to server');
        // clear form
        form.trigger('reset');
        form.hide(500);
        loadEvents();
      });
    });
    // },
    // error: function (xhr, status, error) {
    //   // Handle the error response
    //   console.error('Error deleting event:', error);
    // }
    //   });
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
