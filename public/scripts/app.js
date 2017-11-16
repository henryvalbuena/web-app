function checkOnStart() {
    if( $( window ).width() <= 768){
      $( "#desktop-m" ).hide(); 
      $( "#mobile-m" ).show(); 
    } else if($( window ).width() >= 768){
      $( "#mobile-m" ).hide();
      $( "#desktop-m" ).show();
    }
}

checkOnStart();

$('.ui.dropdown.icon.item')
   .dropdown({
    on: 'hover'
  });

$( window ).resize(function() {
  checkOnStart();
});

$('.ui.form')
  .form({
      on:'blur',
    fields: {
      username: {
        identifier: 'username',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a valid username'
          }
        ]
      },
      password: {
        identifier: 'password',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a valid password'
          },
          {
            type   : 'minLength[3]',
            prompt : 'Your password must be at least {ruleValue} characters'
          }
        ]
      },
      match: {
        identifier: 'match',
        rules: [
          {
            type   : 'match[password]',
            prompt : 'Password does not match'
          }
        ]
      }
    }
 });
 
$('.delete-todo').popup({
  html: "<a class='ui red tag label'>Delete</a>",
  position: 'right center',
  variation: 'basic',
  inline: true
});
