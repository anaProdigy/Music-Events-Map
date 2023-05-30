$(document).ready(function () {

  // // Handle edit event click
  // $('.edit-event').on('click', '#edit-but', function () {
  //   // open event form
  //   $('.add-event-section').slideToggle();
  //   // e.preventDefault();
  //   let eventItem = $(this).closest('.dropdown-item');
  //   let event = eventItem.data('event');
  //   // set fields from event object
  //   // $('#id').val(event.id);
  //   // $('#creator_id').val(event.creator_id);
  //   // $('#name').val(event.name);
  //   // $('#description').val(event.description);
  //   // $('#start_date').val(event.start_date);
  //   // $('#end_date').val(event.end_date);
  //   // $('#venue').val(event.venue);
  //   // $('#city').val(event.city);
  //   // $('#latitude').val(event.latitude);
  //   // $('#longitude').val(event.longitude);
  //   // $('#event_link_url').val(event.event_link_url);
  //   // $('#event_thumbnail_url').val(event.event_thumbnail_url);
  //   // Send an AJAX request to edit the event
  //   $.ajax({
  //     url: '/api/events/' + event.id,
  //     method: 'POST',
  //     success: function (response) {
  //       // submit new
  //       $('#event-form').submit(function (e) {
  //         console.log('Button clicked, performing ajax call...');
  //         e.preventDefault();

  //         const form = $(this);
  //         const data = $(this).serialize();
  //         // console.log('data: ', data);

  //         $.post('/api/events/', data, function () {
  //           console.log('Sending form data to server');
  //           // clear form
  //           form.trigger('reset');
  //           form.hide(500);
  //           // load events here
  //         });
  //       });
  //     },
  //     error: function (xhr, status, error) {
  //       // Handle the error response
  //       console.error('Error deleting event:', error);
  //     }
  //   });
  // });
});

