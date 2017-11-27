
var uiState       = true,
    type          = false,
    userPane      = true,
    timerStop     = 0;

function checkOnStart() {
    $( "#mobile-m" ).removeClass().addClass('init-menu-class');
    $( "#desktop-m" ).removeClass().addClass('init-menu-class');
    if( $( window ).width() <= 736){
      $( "#mobile-m" ).removeClass().addClass('ui top fixed menu tiny inverted');
      $('h2.ui.inverted.center.aligned.header').css('font-size', '0');
      $('h2.ui.inverted.center.aligned.header div i').css({'font-size': '1.7rem', 'padding-top': '10px'});
      $('.chat-content').css('height', '250px');
      $('.chat-content').css('font-size', '1em');
    } else if($( window ).width() >= 736){
      $( "#desktop-m" ).removeClass().addClass('ui top fixed menu tiny inverted');
      $('h2.ui.inverted.center.aligned.header').css('font-size', '1.7rem');
      $('.chat-content').css('height', '400px');
      $('.chat-content').css('font-size', '1.5em');
    }
    $(".menu.m-menu").css('width', $( window ).width()+2);
}

function clearMe(socket){
  if(!type){
    type = true;
    timerStop = setTimeout(timer, 5000);
  }
  function timer (){
      type = false;
      timerStop = 0;
      return socket.emit('chat message', null, null, [socket.id, false]);
    }
    return;
}


function users(arr, status){
  $('ul#users').children('li').remove();
  if(arr && !status){
    arr.forEach(function(name){
      $('#users').append($('<li><i class="checkmark icon"></i>'+name+'</li>'));
    });
  } else if (arr && status) {
    arr.forEach(function(name){
      if((status[0].indexOf(name) != -1) && (status[1][status[0].indexOf(name)])){
        // $('#users').append($('<li>').text(name+" is typing..."));
        $('#users').append($('<li><i class="checkmark icon"></i>'+name+' <i class="spinner loading icon"></i></li>'));
      } else {
        $('#users').append($('<li><i class="checkmark icon"></i>'+name+'</li>'));
      }
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

$('.show-users').popup({
  content: " Show online users ",
  variation: 'inverted'
});

$('.show-users').on('click', function() {
    $('.ui.six.wide.column').fadeToggle();
    if(userPane){
      $('#chat-showHide').delay(380).queue(function(){
        $(this).removeClass('ui ten wide column').addClass('ui sixteen wide column').dequeue();
      });
      userPane = false;
  } else {
    $('#chat-showHide').removeClass('ui sixteen wide column').addClass('ui ten wide column');
    userPane = true;
  }
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
      $('#m').val('');
      return false;
    });
    $('#m').keypress(function(event){
      if(event.which != 13 && socket.id){
        if(timerStop == 0){
          socket.emit('chat message', null, null, [socket.id, true]);
        }
        clearMe(socket);
      } else {
        socket.emit('chat message', null, null, [socket.id, false]);
        clearTimeout(timerStop);
        timerStop = 0;
        type = false;
      }
    });
    socket.on('chat message', function(name, msg, status, sender){
      if(name && msg && !status && sender) {
        if(sender == socket.id){
          $('#messages').append($('<li><i class="user icon"></i>'+name+'</li>'));
          $('#messages').append($('<p>').text(msg));
          $('.chat-content')[0].scrollTop = $('.chat-content')[0].scrollHeight;
        } else {
          $('#messages').append($('<li style="text-align: right">'+name+' <i class="user outline icon"></i></li>'));
          $('#messages').append($('<p>').text(msg));
          $('.chat-content')[0].scrollTop = $('.chat-content')[0].scrollHeight;
        }
      } else if(name && !msg && !status) {
        users(name, null);
      } else if(status){
        users(name, status);
      } else {
        alert("Season has ended, page will reload...");
        window.location.href = 'https://init-project-roydev.c9users.io/webchat';
      }
    });
    socket.on('offline user', function(objOnline){
      users(objOnline);
    });
});