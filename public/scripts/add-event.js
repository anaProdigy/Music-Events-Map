
$(document).ready(function () {

  $('#event-form').submit(function (e) {
    console.log('Button clicked, performing ajax call...');
    e.preventDefault();

    const form = $(this);
    const data = $(this).serialize();
    // console.log('data: ', data);

    $.post('/api/events/', data, function() {
      console.log('Sending form data to server');
      // clear form
      form.trigger('reset');
      form.hide(500);
      // load events here
    });

    // $.ajax({
    //   url: $(this).attr('action'),
    //   type: "POST",
    //   data: $(this).serialize(),
    //   success: function () {
    //     //empty form
    //     $('#event-form').trigger("reset");
    //     $('#event-form').hide(500);
    //     // loadEvents(); // load events once completed to repopulate map with markers?
    //   },
    //   error: function (jqXHR, textStatus, errorThrown) {
    //     console.log('error: ', errorThrown);
    //   },
    // });
  });
});
