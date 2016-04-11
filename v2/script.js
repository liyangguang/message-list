var messagesApp = {
  thisToken: '',
  nextToken: '',
  screenWidth: $(window).width(),
  startPoint: {x: 0, y: 0},
  distance: {x: 0, y: 0},
  touchStatus: 'released',
  isScrolling: false,
  isAnimating: false,
  cardDOM: {},
  debug: function() {
    var debug = '<div id="debug" style="position:fixed;z-index:100;bottom:0;background:black;color:white;width:100%;"></div>';
    $('body').append(debug);
    var debugMsg = messagesApp.touchStatus + messagesApp.isScrolling;
    setInterval(function(){
      $('#debug').html(debugMsg);
    }, 100);
  },
  init: function() {
    // debug();
    messagesApp.loadMessages();

    // event listeners
    $('.js-container').scroll(this.infiniteScroll);
    $('.js-container').on('scrollstart', this.scrollStart);
    $('.js-container').on('scrollstop', this.scrollStop);
    $('.js-container').on('vmousedown', '.js-message', this.touchStart);
    $('.js-container').on('vmousemove', '.js-message', this.touchMove);
    $('.js-container').on('vmouseup', '.js-message', this.touchRelease);
  },
  loadMessages: function(token) {
    var url = 'http://message-list.appspot.com/messages' + (token ? ('?pageToken=' + token) : '');
    console.log('Loading new messages from ' + url);
    
    $.getJSON(url).done(function(json) {
        var msgDOM = Handlebars.templates.msg(json);
        $('.js-message-list').append(msgDOM);
        messagesApp.nextToken = json['pageToken'];
      })
      .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ', ' + error;
        console.log('Request Failed: ' + err);
      });
  },
  infiniteScroll: function() {
    if (($('.js-container').scrollTop() + $('.js-container').height() > $('.js-message-list').height() - 600) &&
        messagesApp.nextToken != messagesApp.thisToken) {
      messagesApp.thisToken = messagesApp.nextToken; // avoid load multiple times
      messagesApp.loadMessages(messagesApp.nextToken);
    }
  },
  scrollStart: function() {messagesApp.isScrolling = true;},
  scrollStop: function() {messagesApp.isScrolling = false;},
  touchStart: function(event) {
    if (!messagesApp.isScrolling && !messagesApp.isAnimating) {
      messagesApp.touchStatus = 'started';
      messagesApp.startPoint['x'] = event.pageX;
      messagesApp.startPoint['y'] = event.pageY;
      messagesApp.cardDOM = $(event.target).hasClass('js-message') ? $(event.target) : $(event.target).parent('.js-message');
      // debug
      messagesApp.cardDOM.css('height', messagesApp.cardDOM.height());
    }
  },
  touchMove: function(event) {
    messagesApp.distance['x'] = event.pageX - messagesApp.startPoint['x'];
    messagesApp.distance['y'] = event.pageY - messagesApp.startPoint['y'];
    
    if (messagesApp.touchStatus == 'started') {
      messagesApp.swipeDirection();
    } else if (messagesApp.touchStatus == 'horizontal') {
      event.preventDefault();
      messagesApp.swipeCard();
    }
  },
  swipeDirection: function() {
    if (Math.abs(messagesApp.distance['x']) > Math.abs(messagesApp.distance['y'])) {
      messagesApp.touchStatus = 'horizontal';
    } else {
      messagesApp.touchStatus = 'vertical';
    }
  },
  swipeCard: function() {
    messagesApp.cardDOM.removeClass('transition');
    if (messagesApp.distance['x'] > 0){ // swipe right
      messagesApp.cardDOM.css({
        'opacity': 1 - messagesApp.distance['x'] / messagesApp.screenWidth,
        '-webkit-transform': 'translate3d(' + messagesApp.distance['x'] + 'px, 0, 0)',
        'transform': 'translate3d(' + messagesApp.distance['x'] + 'px, 0, 0)'
      });
    }
  },
  touchRelease: function() {
    if (messagesApp.touchStatus == 'horizontal') {
      messagesApp.touchStatus = 'released';
      messagesApp.cardDOM.addClass('transition');
      if (messagesApp.distance['x'] > messagesApp.screenWidth * .3) {
        messagesApp.deleteCard();
      } else {
        messagesApp.releaseCard();
      }
    }
  },
  deleteCard: function() {
    messagesApp.isAnimating = true;
    messagesApp.cardDOM.css({ // swipe out animation
      opacity: '0',
      transform: 'translateX('+ messagesApp.screenWidth +'px)'
    })
    .delay(200).queue(function() { // move following card up
      $(this).html('').css({
       'margin': '-30px', // counter the 25px padding and total of 10px margin collapse
       'height': '0'
      }).dequeue();
    })
    .delay(200).queue(function() { // remove DOM
      $(this).remove().dequeue();
    });
    messagesApp.isAnimating = false;
    messagesApp.infiniteScroll(); // load new message if near bottom after deleting this card
  },
  releaseCard: function() {
    messagesApp.cardDOM.css({
      'opacity': '1',
      '-webkit-transform': 'translate3d(0, 0, 0)',
      'transform': 'translate3d(0, 0, 0)'
    });
  }
};

$(document).ready(function() {
  messagesApp.init();
});

// Handlebars Helper for timeago
Handlebars.registerHelper('timeago', function(updated) {
  var timestamp = Date.parse(updated);
  var units = [
    { name: 'second', limit: 60, inSeconds: 1 },
    { name: 'minute', limit: 3600, inSeconds: 60 },
    { name: 'hour', limit: 86400, inSeconds: 3600  },
    { name: 'day', limit: 604800, inSeconds: 86400 },
    { name: 'week', limit: 2629743, inSeconds: 604800  },
    { name: 'month', limit: 31556926, inSeconds: 2629743 },
    { name: 'year', limit: null, inSeconds: 31556926 }
  ];
  var now = new Date();
  var diff = (Date.now - timestamp) / 1000;
  if (diff < 5) return 'now';
  
  var i = 0, unit;
  while (unit = units[i++]) {
    if (diff < unit.limit || !unit.limit) {
      var diff =  Math.floor(diff / unit.inSeconds);
      return diff + ' ' + unit.name + (diff>1 ? 's' : '') + ' ago';
    }
  };
});

// Precompiled Handlebars template for messages
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['msg'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing;

  return "<li class=\"message js-message mdl-shadow--3dp\"><img class=\"user-pic\" src=\"http://message-list.appspot.com"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.author : depth0)) != null ? stack1.photoUrl : stack1), depth0))
    + "\" alt=\"Profile picture\"><p class=\"user-name\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.author : depth0)) != null ? stack1.name : stack1), depth0))
    + "</p><p class=\"post-time\">"
    + alias2((helpers.timeago || (depth0 && depth0.timeago) || alias4).call(alias3,(depth0 != null ? depth0.updated : depth0),{"name":"timeago","hash":{},"data":data}))
    + "</p><p class=\"post-content\">"
    + alias2(((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias4),(typeof helper === "function" ? helper.call(alias3,{"name":"content","hash":{},"data":data}) : helper)))
    + "</p></li>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.messages : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();