function checkOnStart() {
    if( $( window ).width() <= 736){
      $( "#desktop-m" ).hide();  
      $( "#mobile-m" ).show(); 
    } else if($( window ).width() >= 736){
      $( "#mobile-m" ).hide();
      $( "#desktop-m" ).show();
    }
}

checkOnStart();

$(".show-d").on("click", function(event){
    $(".ui.red.button.delete-b").fadeToggle(500);
});
$('.ui.dropdown.icon.item')
   .dropdown({
    on: 'hover'
  })
;
$( window ).resize(function() {
  checkOnStart();
});