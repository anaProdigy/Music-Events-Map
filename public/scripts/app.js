// Client facing scripts here
//global object to store created marker, need for deleting them
const markers = {};


//return user id number from cookies to make userId dynamic, MOVED HERE TO BE AVAILABLE GLOBALLY
const getCookie = (cname) => {
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
};


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
    center: [53.52986013674078, -109.95611652731895],
    zoom: 5,
    layers: [osm]
  });
  //create layers for all events and created events
  const allEventsLayerGroup = L.layerGroup().addTo(map);
  const createdEventsLayerGroup = L.layerGroup().addTo(map);
  // base layers we want to switch between in layers control
  const baseMaps = {
    "OpenStreetMap": osm,
    "Google Streets": googleStreets,
    "Google Hybrid": googleHybrid
  };
  const overlayMaps = {
    "All Events": allEventsLayerGroup,
    "My events": createdEventsLayerGroup
  };


  let userId = parseInt(getCookie("user_id"));


  const allEventsIcon = L.icon({
    iconUrl: 'https://static.vecteezy.com/system/resources/previews/000/546/132/original/music-notes-vector-icon.jpg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });


  const createdIcon = L.icon({
    iconUrl: 'https://static.vecteezy.com/system/resources/previews/000/421/283/original/music-note-icon-vector-illustration.jpg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
  // display layers control and make it always visible in the top right corner, we can filter from here
  const layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
  // layerControl.addOverlay(allEventsLayerGroup, 'All Events');
  // layerControl.addOverlay(createdEventsLayerGroup, 'Created Events');


  // old default display marker we used to have something on the map
  // L.marker([52.268112, -113.811241]).addTo(map);


  let markersGroup = L.layerGroup();
  map.addLayer(markersGroup);


  const renderMarkers = function(events, isCreatedByCurrentUser) {




    // create LatLongBounds object so we can zoom the map to fit the set of location events
    const bounds = L.latLngBounds();


    // helper function that determines if a date is before current date
    const isInThePast = function(date) {
      const today = new Date().toISOString().slice(0, 10);


      if (date < today && date !== today) {
        return true;
      }
      return false;
    };


    for (const event of events) {
      // if event.end_date is before today's date, don't display the event
      if (!isInThePast(event.end_date)) {


        const markerOptions = {
          icon: isCreatedByCurrentUser ? createdIcon : allEventsIcon,
        };


        const marker = L.marker([event.latitude, event.longitude], markerOptions).addTo(markersGroup);
        //add marker to markers object with event id as a key, need to handle deliting them
        markers[event.id] = marker;


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
        const onPopupOpen = function() {
          $('#collapsible').click(function(e) {
            if ($('#expand').is(':visible')) {
              $('#expand').hide();
            } else {
              $('#expand').show();
            }
          });
        };
        marker.bindPopup(popupContent + popupExpansion);
        marker.on('popupopen', onPopupOpen);


        bounds.extend([event.latitude, event.longitude]);
        if (isCreatedByCurrentUser) {
          createdEventsLayerGroup.addLayer(marker);
        } else {
          allEventsLayerGroup.addLayer(marker);
        }
      }
    }


    // fit map to bounds
    map.fitBounds(bounds);
    // console.log("markersLength", Object.keys(markers).length);
  };
  const loadEvents = function() {
    $.ajax({
      url: '/api/events',
      method: 'GET',
      success: function(data) {
        renderMarkers(data.events, false);
      },
      error: function(error) {
        console.log('Error:', error);
      }
    });
  };


  const loadCreatedEvents = function(userId) {
    $.ajax({
      url: `/api/events/created/${userId}`,
      method: 'GET',
      success: function(data) {
        console.log("line 231", data.createdEvents);
        renderMarkers(data.createdEvents, true);
      },
      error: function(error) {
        console.log('Error:', error);
      }
    });
  };

  loadEvents();
  loadCreatedEvents(userId);


  //move marker var outside of event listener
  let marker;
  map.on('click', function(e) {
    console.log("line 183", e);
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

    // Function to handle add event/delete marker on marker popup open
    function onPopupOpen() {
      let tempMarker = this;


      // To remove marker on click of delete button in the popup of marker
      $('.marker-delete-button:visible').click(function() {
        map.removeLayer(tempMarker);
        if ($('.add-event-section').is(":visible")) {
          $('.add-event-section').slideToggle();
        };
      });
      // to toggle add event form on click of add button in popup
      $('.marker-submit-button:visible').click(function() {
        console.log("line 206");
        $('.add-event-section').slideToggle();
        // MERGE CONFLICT HERE, COMMENTED OUT ONE CHANGE, KEPT THE OTHER
        // $('.marker-submit-button:visible').click(function () {
        // $('.edit-event-section').hide(500);
        // $('.add-event-section').show(500);
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
    //CUSTOM ICON
    const markerOptions = {
      icon: createdIcon
    };
    if (markersCount < markersMax) {
      marker = L.marker(e.latlng, markerOptions).addTo(map)
        .bindPopup(`<b>Add event to this location?</b><br><button type='submit' class='marker-submit-button'>Add</button>
       <button type='delete' class='marker-delete-button'>No</button>`);
      marker.on('popupopen', onPopupOpen)
        // marker.on('popupclose', onPopupClose)
        .openPopup();

      marker._popup._closeButton.onclick = function() {
        if ($('.add-event-section').is(":visible")) {
          $('.add-event-section').slideToggle();
        };
        map.removeLayer(marker);
        return;
      };

    };

    // to remove marker and close form when 'cancel' button is clicked
    $('.cancel-event').click(function() {
      if ($('.add-event-section').is(":visible")) {
        $('#event-form').trigger("reset");
        $('.add-event-section').hide(500);
      };
      map.removeLayer(marker);
      return;
    });
  });


  //ADD EVENTS
  // Fetch user's CREATED EVENTS LIST DROPDOWN
  const addCreatedEventToList = () => {
    $.ajax({
      url: '/api/events',
      method: 'GET',
      success: function(response) {
        // Handle the success response and filter the events by the user ID
        let events = response.events.filter(function(event) {
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
          events.forEach(function(event) {
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
      error: function(xhr, status, error) {
        // Handle the error response
        console.error('Error fetching events:', error);
      }
    });
  };


  $('#event-form').submit(function(e) {
    e.stopPropagation();
    console.log('Button clicked, performing ajax call...');
    e.preventDefault();

    const form = $(this);
    const data = $(this).serialize();
    // console.log('data: ', data);
    $.post('/api/events/', data, function(response) {
      console.log('Sending form data to server');
      // clear form
      form.trigger('reset');
      // console.log(response);
      $('.add-event-section').slideToggle();
      //load all events plus newly added event
      loadEvents();
      loadCreatedEvents(userId);
      //ajax
      addCreatedEventToList();
    });
  });
  //adds all created events to the dropdowm list CREATED
  addCreatedEventToList();

  //edit event form
  $('.edit-event-section')
    .append(`
   <form id="edit-event-form">
     <input class="event-input" type="text" id="edit-name" placeholder="event name" name="name" required>
     <input class="event-input" type="text" id="edit-venue" name="venue" placeholder="venue" required>
     <input class="event-input" type="text" id="edit-city" placeholder="city" name="city" required>
     <textarea id="edit-description" placeholder="event description" name="description" required></textarea>
     <input class="event-input" type="date" id="edit-start-date" name="start_date" placeholder="start date" required>
     <input class="event-input" type="date" id="edit-end-date" name="end_date" placeholder="end date" required>
     <input class="event-input" type="number" id="edit-latitude" name="latitude" readonly>
     <input class="event-input" type="number" id="edit-longitude" name="longitude" readonly>
     <input class="event-input" type="text" id="edit-event-link" name="event_link_url" placeholder="event link">
     <input class="event-input" type="text" id="edit-event-thumbnail" name="event_thumbnail_url" placeholder="add event image or flyer">
     <button class ="edit-event-btn" type="submit">Edit Event</button>
     <button class ="cancel-edit" type="button">Undo</button>
   </form>
   `);

  $('.edit-event-section').hide();

  // EDIT events
  $(document).on('click', '.edit-event', function(e) {
    e.preventDefault();
    //show form
    $('.edit-event-section').show(500);
    //access event to prepopulate form fields
    let eventItem = $(this).closest('.dropdown-item');
    let event = eventItem.data('event');
    // convert store date to proper format
    let startDate = dayjs(event.start_date).format('YYYY-MM-DD');
    let endDate = dayjs(event.end_date).format('YYYY-MM-DD');

    // set form fields from event object
    $('#edit-name').val(event.name);
    $('#edit-description').val(event.description);
    $('#edit-start-date').val(startDate);
    $('#edit-end-date').val(endDate);
    $('#edit-venue').val(event.venue);
    $('#edit-city').val(event.city);
    $('#edit-latitude').val(event.latitude);
    $('#edit-longitude').val(event.longitude);
    $('#edit-event-link').val(event.event_link_url);
    $('#edit-event-thumbnail').val(event.event_thumbnail_url); // this isn't filling ??

    // to clear and close form when 'cancel' button is clicked
    $('.cancel-edit').click(function() {
      if ($('.edit-event-section').is(":visible")) {
        $('#edit-event-form').trigger("reset");
        $('.edit-event-section').hide(500);
      };
    });
    //when edit event button is clicked
    $('#edit-event-form').on('submit', function(e) {
      console.log('Button clicked, performing ajax call...');
      e.preventDefault();
      console.log("when is this called?");
      const form = $(this);
      const data = $(this).serialize();
      console.log('form and date', data);
      //edit request
      $.ajax({
        url: '/api/events/' + event.id,
        method: 'POST',
        data: data,
        success: function(response) {
          console.log('Line 535 Sending form data to server');
          // clear form
          form.trigger('reset');
          // form.hide(500);
          $('.edit-event-section').slideToggle(); 
          console.log(response);
          loadEvents();
          loadCreatedEvents(userId);
          addCreatedEventToList();
        },
        error: function(xhr, status, error) {
          // Handle the error response
          console.error('Error editing event:', error);
        }
      });
    });
  });
  // Handle DETELE event click
  $(document).on('click', '.delete-event', function(e) {
    e.preventDefault();
    let eventItem = $(this).closest('.dropdown-item');
    let event = eventItem.data('event');
    // Perform delete event action with the event data
    console.log('Delete event:', event);

    // Prompt the user for confirmation before deleting the event
    if (confirm('Are you sure you want to delete this event?')) {
      e.stopPropagation();
      // Send an AJAX request to delete the event
      $.ajax({
        url: '/api/events/' + event.id,
        method: 'DELETE',
        success: function(response) {
          // Handle the success response
          //remove event from db and list
          eventItem.remove();

          //REMOVE MARKER
          markers[event.id].remove();
        },
        error: function(xhr, status, error) {
          // Handle the error response
          console.error('Error deleting event:', error);
        }
      });
    }
  });
  //  addCreatedEventToList();
});







