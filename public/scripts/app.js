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
 

  function showLoadingMessage() {
     alert("Loading...");
    $("#loadingMessage").html("Loading...").show();
    setTimeout(function() {
      hideLoadingMessage();
    }, 3000);
  }

  function hideLoadingMessage() {
   
    $("#loadingMessage").hide();
  }

  const markersMax = 2000;

  // map tile layers
  // openstreetmaps map
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright%22%3EOpenStreetMap</a> contributors'
  });

  // google streets map
  const googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });

  // google hybrid map
  const googleHybrid = L.tileLayer('http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });


  // display the map on the page
  let map = L.map('map', {
    center: [54.36263970537757, -110.03906250000001],
    zoom: 5,
    layers: [osm]
  });

  //create layers for all events and created events
  const allEventsLayerGroup = L.layerGroup().addTo(map);
  const createdEventsLayerGroup = L.layerGroup().addTo(map);

  // base layer options we want to switch between in layers control
  const baseMaps = {
    "OpenStreetMap": osm,
    "Google Streets": googleStreets,
    "Google Hybrid": googleHybrid
  };

  // filter options for events, user created and all events
  const overlayMaps = {
    "All Events": allEventsLayerGroup,
    "My events": createdEventsLayerGroup
  };

  // map marker icon for all events
  const allEventsIcon = L.icon({
    iconUrl: '../icons/musicPurple.png',
    iconSize: [65, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60]
  });

  // map marker icon for user created events
  const createdIcon = L.icon({
    iconUrl: '../icons/musicBlue.png',
    iconSize: [65, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60]
  });

  // if there is a logged in user, display "My Events" and "Favourites" drop down menus
  let userId = parseInt(getCookie("user_id"));
  if(userId) {
    $('.container-dropdowns').show();
  }

  // display layers control and make it always visible in the top right corner, allowing us to switch map tiles and filter events created or all
  const layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

  //display leaflet-geosearch on map to search for events by city or address
  const provider = new window.GeoSearch.OpenStreetMapProvider();
  const search = new GeoSearch.GeoSearchControl({
    provider: provider,
    style: 'bar',
    updateMap: true,
    autoClose: true,
  });
  map.addControl(search);


  let markersGroup = L.layerGroup();

  map.addLayer(markersGroup);

  // helper function that determines if a date is before current date
  const isInThePast = function(date) {
    const today = new Date().toISOString().slice(0, 10);
    if (date < today && date !== today) {
      return true;
    }
    return false;
  };

  // function that renders markers from events from the db
  const renderMarkers = function (events, isCreatedByCurrentUser) {


    // loop through events
    for (const event of events) {
      // if event.end_date is before today's date, don't display the event
      if (!isInThePast(event.end_date)) {

        const markerOptions = {
          icon: isCreatedByCurrentUser ? createdIcon : allEventsIcon,
        };

        const marker = L.marker([event.latitude, event.longitude], markerOptions).addTo(markersGroup);
        //add marker to markers object with event id as a key, need to handle deliting them
        markers[event.id] = marker;

        //event.music_event_id is for checking favourite
        const popupContent =`
        <h3><b>${event.name}</b></h3>
        <p>${dayjs(event.start_date).format('MMMM D, YYYY')}</p>
        <p>${event.description}<p id="collapsible"><strong>. . .</strong>
        <div class="favourite-icon ${event.music_event_id ? 'favourited' : ''}" id=${event.id}>
        <i class="fa fa-heart fa-2x"></i>
        </div></p>
        `;
        const popupExpansion = `
        <div id="expand">
          <p><b>Venue:</b> ${event.venue}<br><b>City:</b> ${event.city}<br>
          <b>Until:</b> ${dayjs(event.end_date).format('MMMM D, YYYY')}<br>
          <b>Link:</b> <a target="_blank" href=${event.event_link_url}>${event.event_link_url}</a><br>
          <b>More information:</b><a target="_blank" href=${event.event_thumbnail_url}>${event.event_thumbnail_url}</a></p>
        </div>
        `;

        // expand/collapse popup accordion on click
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

        // bounds.extend([event.latitude, event.longitude]);
        if (isCreatedByCurrentUser) {
          createdEventsLayerGroup.addLayer(marker);
        } else {
          allEventsLayerGroup.addLayer(marker);
        }
      }
    }
  };

  // load events from API CHANGE NAME!!!!!!!!!!!!!!!!!!!!!
  const loadEvents = function () {
    showLoadingMessage();
    // setTimeout(() => {
    //   $.ajax({
    //     url: '/api/someEndpoint',
    //     method: 'GET',
    //     success: function(data) {
    //       console.log(data);
    //     },
    //     error: function(error) {
    //       console.log('Error:', error);
    //     },
    //     complete: function() {
    //       hideLoadingMessage();
    //     }
    //   });
    // }, 2000);  

    $.ajax({
      url: '/api/events',
      method: 'GET',
      success: function (data) {
        renderMarkers(data.events, false);
        hideLoadingMessage();
      },
      error: function (error) {
        console.log('Error:', error);
        hideLoadingMessage();
      }
    });
  };



  // a function that loads events created by the user
  const loadCreatedEvents = function (userId) {
    if (!userId) return;
    $.ajax({
      url: `/api/events/created/${userId}`,
      method: 'GET',
      success: function (data) {
        renderMarkers(data.createdEvents, true);
      },
      error: function (error) {
        console.log('Error:', error);
      }
    });
  };

  loadEvents();
  loadCreatedEvents(userId);

  // display Name when logged in
  const displayName = function(userId) {
    if (!userId) return;
    $.ajax({
      url: `/login/name/` + userId,
      method: 'GET',
      success: function(data) {
        let name = data.userName[0]['name'];
        // show logged-in
        $('.logged-in').show();
        // set nav bar to display userName
        $('.first-name').text(`Hi, ${name}!`);
        // hide registration buttons
        $('.new-user').hide();
      },
      error: function(error) {
        console.log('Error:', error);
      }
    });
  };

  displayName(userId);
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
      $('.marker-submit-button:visible').click(function (e) {
        if (!userId) {
          alert ('You must be logged in to add an event!');
          return;
        }
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

    //CUSTOM ICON
    const markerOptions = {
      icon: createdIcon
    };

    if (markersCount < markersMax) {
      marker = L.marker(e.latlng, markerOptions).addTo(map)
        .bindPopup(`<b>Add event to this location?</b><br><button type='submit' class='marker-submit-button'>Yes</button>
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

  // Helper function to create a dropdown item for an event
  const createDropdownItem = (event, dropdownMenu) => {
    let eventItem = $('<a class="dropdown-item" href="#">')
      .text(event.name)
      .append(`
      <div class="float-right">
        <button class="edit-event">Edit</button>
        <button class="delete-event">Delete</button>
      </div>
    `);

    // Add event data as data attributes to the event item
    eventItem.data('event', event);

    // Add the event item to the dropdown menu
    dropdownMenu.append(eventItem);
  }
  // Fetch user's CREATED EVENTS LIST DROPDOWN
  const addCreatedEventToList = () => {
    $.ajax({
      url: '/api/events',
      method: 'GET',
      success: function (response) {
        // Handle the success response and filter the events by the user ID
        let events = response.events.filter(function (event) {
          return event.creator_id === userId;
        });
        
        //reference to html
        let dropdownMenu = $('#created-events');
        // Separate past and current events
        const pastEvents = events.filter(function(event) {
          return isInThePast(event.end_date);
        });
        const currentEvents = events.filter(function(event) {
          return !isInThePast(event.end_date);
        });

        // Clear the dropdown menu
        dropdownMenu.empty();

        // Add "Current events" label to the dropdown menu
        let currentEventsLabel = $('<div class="dropdown-header">').text('Current Events');
        dropdownMenu.append(currentEventsLabel);
        //check if there are current events
        if (currentEvents.length > 0) {
          currentEvents.forEach(function(event) {
            createDropdownItem(event, dropdownMenu);
            // markers[event.id] = marker;
          });
        } else {
          let noCurrentEventsLabel = $('<a class="dropdown-item disabled">').text('No Current Events');
          dropdownMenu.append(noCurrentEventsLabel);
        }

        // Add past events to the dropdown menu
        let pastEventsLabel = $('<div class="dropdown-header">').text('Past Events');
        dropdownMenu.append(pastEventsLabel);

        if (pastEvents.length > 0) {
          pastEvents.forEach(function(event) {
            createDropdownItem(event, dropdownMenu);
            // markers[event.id] = marker;
          });
        } else {
          let noPastEventsLabel = $('<a class="dropdown-item disabled">').text('No Past Events');
          dropdownMenu.append(noPastEventsLabel);
        }

        // Add event click event listener
        $('.dropdown-item', dropdownMenu).on('click', function() {
          // Retrieve the event data from the data attributes
          let eventData = $(this).data('event');

          // Retrieve latitude and longitude of the event
          let lat = eventData.latitude;
          let lng = eventData.longitude;

          // Center the map on the event marker and zoom in
          map.setView([lat, lng], 15); // Adjust the zoom level as needed
        });

       
      },
      error: function (xhr, status, error) {
        // Handle the error response
        console.error('Error fetching events:', error);
      }
    });
  };




  $('#event-form').submit(function (e) {
    e.stopPropagation();
    console.log('Button clicked, performing ajax call...');
    e.preventDefault();

    const form = $(this);
    const data = $(this).serialize();

    $.post('/api/events/', data, function (response) {
      console.log('Sending form data to server');
      // clear form
      form.trigger('reset');
      // console.log(response);
      $('.add-event-section').slideToggle();
      //load all events plus newly added event
      //loadEvents(); 
      loadCreatedEvents(userId);
      //ajax
      addCreatedEventToList();
    });
  });
  //adds all created events to the dropdowm list CREATED
  addCreatedEventToList();

  //FETCH FAVOURITE EVENTS TO THE LIST
  const fetchFavouriteEvents = (userId) => {
    $.ajax({
      url: `/api/events/favourites/${userId}`,
      method: 'GET',
      success: function(response) {
        // console.log("line413", response)
        let favouriteEvents = response.favouriteEvents;
        let dropdownMenu = $('#favourite-events');
        
        // Check if any favourite events exist
        if (favouriteEvents.length > 0) {
          // Clear the dropdown menu
          dropdownMenu.empty();
          // Iterate over each favourite event and create dropdown items
          favouriteEvents.forEach(function(event) {
         
            
             //$(`[id="${event.id}"] i`).addClass('favourited');
            let eventItem = $('<a class="dropdown-item" href="#">')
              .text(event.name)
              .append(`
            <div class="float-right">
              <button class="remove-favourite-event" id=${event.id}>Remove</button>
            </div>
          `);
            // Add event data as data attributes to the event item
            eventItem.data('event', event);
            dropdownMenu.append(eventItem);
            //console.log("event", event)

            // Add a click event listener to the event item
            eventItem.on('click', function() {
              console.log("eventItem", eventItem);
              // Retrieve the event data from the data attributes
              let eventData = $(this).data('event');

              // Retrieve latitude and longitude of the event
              let lat = eventData.latitude;
              let lng = eventData.longitude
                ;

              // Center the map on the event marker and zoom in
              map.setView([lat, lng], 15); // Adjust the zoom level as needed
            });


            
            if (event.id) {
              $(`#${event.id} .fa-heart`).addClass('favourited');
            } else {
              $(`#${event.id} .fa-heart`).removeClass('favourited');
            }
            // $(`#${event.id} i`).addClass('favourited');
          });
        } else {
          // If no favourite events exist, display a message or placeholder item
          dropdownMenu.html('<span class="dropdown-item">No favourite events found</span>');
        }
        // Update the heart icon in the popup based on the favourite status
       

      },
      error: function(xhr, status, error) {
        // Handle the error response
        console.error('Error fetching favourite events:', error);
      }
    });
  };
  fetchFavouriteEvents(userId);
 

  //ADD FAVOURITE EVENTS
  const addToFavouritesList = (userId, eventId) => {
    return $.ajax({
      url: `/api/events/favourites`,
      method: 'POST',
      data: { userId, eventId },
      success: function(response) {

        return response;
      },
      error: function(xhr, status, error) {
        throw error;
      }
    });
  };

  //REMOVE FAVOURITE EVENTS
  const removeFavouriteEvent = (userId, eventId) => {
    return $.ajax({
      url: `/api/events/favourites/${eventId}`,
      method: 'DELETE',
      success: function(response) {
        // Reload the favourite events dropdown or update the UI accordingly
        fetchFavouriteEvents(userId);
      },
      error: function(xhr, status, error) {
        // Handle the error response
        console.error('Error removing event from favourites:', error);
      }
    });
  };

  //HANDLE CLICK ON REMOVE FAV BUTTON
  $(document).on('click', '.remove-favourite-event', function() {
    // Get the event ID from the data attribute
    const eventId = $(this).attr("id");
    //console.log("line ", this)
    // Call a function to remove the event from favourites
    removeFavouriteEvent(userId, eventId)
      .then(() => {
        fetchFavouriteEvents(userId);
        //loadEvents();
      });
  });

    //HANDLE CLICK ON REMOVE FAV HEART ICON
  $(document).on('click', '.favourite-icon', function() {
    const eventId = $(this).attr("id");
    const heartIcon = $(this);

    if (heartIcon.hasClass('favourited')) {
      // Event is already favourited, remove it from favourites
      removeFavouriteEvent(userId, eventId)
        .then(() => {
          console.log('Event removed from favourites:', eventId);
          heartIcon.removeClass('favourited');
          
          fetchFavouriteEvents(userId);
          loadCreatedEvents(userId);
        
        })
        .catch((error) => {
          console.error('Error removing event from favourites:', error);
        });
    } else {
      // Event is not favourited, add it to favourites
      addToFavouritesList(userId, eventId)
        .then(() => {
          console.log('Event added to favourites:', eventId);
          heartIcon.addClass('favourited');
          
       
          fetchFavouriteEvents(userId);
          loadCreatedEvents(userId);
        })
        .catch((error) => {
          console.error('Error adding event to favourites:', error);
        });
    }
  });

  

  userId && fetchFavouriteEvents(userId);


  // EDIT events
  $(document).on('click', '.edit-event', function (e) {
    e.preventDefault();
    //move event form here so it it is called every time when the button is clicked and new value populate it, then saving edit will save info with current values 
    $('.edit-event-section')
      .html(`
   <form id="edit-event-form" autocomplete="off">
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
     <div class="edit-event-btns">
        <button class ="edit-event-btn" type="submit"><strong>Edit</strong></button>
        <button class ="cancel-edit" type="button"><strong>Undo</strong></button>
      </div>
   </form>
   `);

    $('.edit-event-section').slideToggle();
    $('#edit-name').focus();
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
    $('.cancel-edit').click(function () {
      if ($('.edit-event-section').is(":visible")) {
        $('#edit-event-form').trigger("reset");
        $('.edit-event-section').hide(500);
      };
    });
    //when edit event button is clicked
    $('#edit-event-form').on('submit', function (e) {
      //console.log('Button clicked, performing ajax call...');
      e.preventDefault();
      
      const form = $(this);
      const data = $(this).serialize();
      
      //edit request
      $.ajax({
        url: '/api/events/' + event.id,

        method: 'POST',
        data: data,
        success: function (response) {
          //console.log('Sending form data to server');
          // clear form
          form.trigger('reset');
          // form.hide(500);
          // $('.edit-event-section').hide();

          //edit event form
          $('.edit-event-section').hide(500);
          userId && fetchFavouriteEvents(userId);

      
          //loadEvents();
          loadCreatedEvents(userId);
          addCreatedEventToList();
        },
        error: function (xhr, status, error) {
          // Handle the error response
          console.error('Error editing event:', error);
        }
      });
    });
  });
  
  // Handle DETELE event click
  $(document).on('click', '.delete-event', function (e) {
    e.preventDefault();
    let eventItem = $(this).closest('.dropdown-item');
    let event = eventItem.data('event');
   
    // Perform delete event action with the event data
    // Prompt the user for confirmation before deleting the event
    if (confirm('Are you sure you want to delete this event?')) {
      e.stopPropagation();
      // Send an AJAX request to delete the event
      $.ajax({
        url: '/api/events/' + event.id,
        method: 'DELETE',
        success: function (response) {
          // Handle the success response
          //remove event from db and list
          eventItem.remove();
          // Remove marker from the map
          if (markers[event.id]) {
            markers[event.id].remove();
            delete markers[event.id];
          }

          //loadEvents();
          loadCreatedEvents(userId);
          addCreatedEventToList();
          userId && fetchFavouriteEvents(userId);
        },
        error: function (xhr, status, error) {
          // Handle the error response
          console.error('Error deleting event:', error);
        }
      });
    }
  });
});
