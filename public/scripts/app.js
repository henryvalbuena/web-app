
var    uiState     = true;

function checkOnStart() {
    $( "#mobile-m" ).removeClass().addClass('init-menu-class');
    $( "#desktop-m" ).removeClass().addClass('init-menu-class');
    if( $( window ).width() <= 736){
      $( "#mobile-m" ).removeClass().addClass('ui top fixed menu tiny inverted');
      $('h2.ui.inverted.center.aligned.header').css('font-size', '0');
      $('h2.ui.inverted.center.aligned.header div i').css('font-size', '1.7rem');
      $('.chat-content').css('height', '250px');
    } else if($( window ).width() >= 736){
      $( "#desktop-m" ).removeClass().addClass('ui top fixed menu tiny inverted');
      $('h2.ui.inverted.center.aligned.header').css('font-size', '1.7rem');
      $('.chat-content').css('height', '400px');
    }
    $(".menu.m-menu").css('width', $( window ).width()+2);
}

function users(arr){
  $('ul#users').children('li').remove();
  if(arr){
    arr.forEach(function(name){
      $('#users').append($('<li>').text(name));
    });
  }
}

checkOnStart();

$( window ).resize(function() {
  checkOnStart();
});

$('.ui.dropdown.icon.item')
   .dropdown({
    on: 'click'
  });
 
$('.delete-todo').popup({
  html: "<a class='ui red tag label'>Delete</a>",
  position: 'right center',
  variation: 'basic',
  inline: true
});

$('.ui.big.form')
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
            type   : 'minLength[6]',
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
          },
          {
            type   : 'empty',
            prompt : 'Please enter a valid password'
          },
        ]
      }
    }
 });
$('.ui.message .close')
  .on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade')
    ;
  })
;
$('.negative.floating.message')
  .transition({
    animation: 'shake',
    duration: '1s'
  })
;
$('#multi-select')
  .dropdown()
;

$('div.content span:nth-child(1)').on('click', function(){
  $('#toggleHide').transition('fade', '0s');
   if(uiState){
     $('#change-grid').removeClass('ui one column stackable grid');
     $('#change-grid').addClass('ui two column stackable grid');
    uiState = false;
   } else {
    $('#change-grid').removeClass('ui two column stackable grid');
    $('#change-grid').addClass('ui one column stackable grid');
    uiState = true;
   }
});

$('.ui.modal')
  .modal({
    closable: false,
    approve: '.approve'
  })
  .modal('show')
;

// SOCKET.IO


$(function () {
var socket = io();
    $('#chat-name-add').on('click', function() {
        socket.emit('chat message', $('#chat-name').val(), null);
    });
    $('#chat-form').submit(function(){
      socket.emit('chat message', null, $('#m').val());
      $('#m').val('');
      return false;
    });
    socket.on('chat message', function(name, msg){
      if(name && msg) {
        $('#messages').append($('<li>').text(name+": "+msg));
        $('.chat-content')[0].scrollTop = $('.chat-content')[0].scrollHeight;
      } else if(name && !msg) {
        users(name);
      }
    });
    socket.on('offline user', function(objOnline){
      users(objOnline);
    });
});