
$(document).ready(function () {

  $('#event-form').submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: $(this).attr('action'),
      type: "POST",
      data: $(this).serialize(),
      success: function () {
        //empty form
        $('#event-form').trigger("reset");
        $('#event-form').hide(500);
        // loadEvents(); // load events once completed to repopulate map with markers?
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('error: ', errorThrown);
      },
    });
  });
});
