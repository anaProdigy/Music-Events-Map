
$(document).ready(function () {
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

  //convert Timestamp to YYYY-MM-DD format
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  // Handle edit event click
  $(document).on('click', '.edit-event', function (e) {
    // open event form
    $('.add-event-section').slideToggle();
    e.preventDefault();
    let eventItem = $(this).closest('.dropdown-item');
    let event = eventItem.data('event');
    let startDate = formatDate(event.start_date);
    let endDate = formatDate(event.end_date);
    console.log(event);
    // set fields from event object
    $('#id').val(event.id);
    $('#creator_id').val(event.creator_id);
    $('#name').val(event.name);
    $('#description').val(event.description);
    $('#start_date').val(startDate);
    $('#end_date').val(endDate);
    $('#venue').val(event.venue);
    $('#city').val(event.city);
    $('#latitude').val(event.latitude);
    $('#longitude').val(event.longitude);
    $('#event_link_url').val(event.event_link_url);
    $('#event_thumbnail_url').val(event.event_thumbnail_url);

    // to remove marker and close form when 'cancel' button is clicked
    $('.cancel-event').click(function () {
      if ($('.add-event-section').is(":visible")) {
        $('#event-form').trigger("reset");
        $('.add-event-section').hide(500);
      };
    });
    // Send an AJAX request to edit the event
    $.ajax({
      url: '/api/events/' + event.id,
      method: 'PUT',
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
          });
        });
      },
      error: function (xhr, status, error) {
        // Handle the error response
        console.error('Error deleting event:', error);
      }
    });
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
