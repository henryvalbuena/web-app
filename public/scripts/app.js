
var uiState       = true,
    clearTyping   = false,
    objName       = [];

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

function time (){
  console.log("time time")
  clearTyping = true;
  users(objName, true);
}

function users(arr, status){
  $('ul#users').children('li').remove();
  if(arr && !status && !clearTyping){
    arr.forEach(function(name){
      $('#users').append($('<li>').text(name));
    });
  } else if(arr && status && !clearTyping){
      console.log("Is typing");
      arr.forEach(function(name){
        if(name == status) {
          $('#users').append($('<li>').text(name+" is typing..."));
        } else {
          $('#users').append($('<li>').text(name));
        }
      });
  } else if(arr && status && clearTyping){
    console.log("Executing timer");
    arr.forEach(function(name){
      $('#users').append($('<li>').text(name));
    });
    clearTyping = false;
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
        socket.emit('chat message', $('#chat-name').val());
    });
    $('#chat-form').submit(function(){
      socket.emit('chat message', null, $('#m').val());
      time();
      $('#m').val('');
      return false;
    });
    $('#m').keypress(function(event){
      // console.log("keypressed: "+event.charCode);
      if(event.which != 13){
      socket.emit('chat message', null, null, true);
      }
    });
    socket.on('chat message', function(name, msg, status){
      if(name && msg && !status) {
        // console.log("if #1");
        $('#messages').append($('<li>').text(name+": "+msg));
        $('.chat-content')[0].scrollTop = $('.chat-content')[0].scrollHeight;
      } else if(name && !msg && !status) {
        // console.log("if #2");
        users(name, null);
      } else if(status){
        console.log("Is typing: "+name);
        objName = name;
        setTimeout(time, 3000);
        console.log("timer called");
        users(name, status);
      }
    });
    socket.on('offline user', function(objOnline){
      users(objOnline);
    });
});
