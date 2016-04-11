var template = Handlebars.compile($("#msgs-template").html() );

var messagesApp = {
  nextPage : "",
  loadMsg : function( token ) {
    app = this;
    // set URL and get JSON data
    var url = 'http://message-list.appspot.com/messages' + ( token ? ( "?pageToken=" + token ) : "" );
    console.log( "Loading new messages from " + url );
    
    $.getJSON( url )
      .done(function( json ) {
        // render template and append
        var msgDOM = template( json );
        $(".page-content").append( msgDOM );
        // save pageToken in the main app
        app.nextPage = json[ "pageToken" ];
      })
      .fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
    });
  }
};



$(document).ready(function() {
  messagesApp.loadMsg();
  var screenWidth = $(window).width();


var gnStartX = 0;
var gnStartY = 0;
var gnEndX = 0;
var gnEndY = 0;
var drag = false;

$(document).on('vmousedown', "main", function(event){
    gnStartX = event.pageX;
    gnStartY = event.pageY;
    drag = true;
    // event.preventDefault();
});

$(document).on('vmousemove', "main", function(event){

  if (drag){
    gnNowX = event.pageX;
    gnNowY = event.pageY;
    var distance = gnNowX - gnStartX;

    var cardDom = $(event.target);
    if (!cardDom.hasClass('card-msg')) {
      cardDom = cardDom.parent(".card-msg");
    }
    cardDom.css({
  "-webkit-transition": "none",
     "-moz-transition": "none",
      "-ms-transition": "none",
       "-o-transition": "none",
          "transition": "none",
      opacity: 1- distance / 500,
      transform: "translateX("+distance+"px)"
    });

    // event.preventDefault();
  }
});

$(document).on('vmouseup', "main", function(event){
  gnEndX = event.pageX;
  gnEndY = event.pageY;

// find the card
  var cardDom = $(event.target);
  if (!cardDom.hasClass('card-msg')) {
    cardDom = cardDom.parent(".card-msg");
  }
  cardDom.css({
    "-webkit-transition": "all .5s ease", // todo animation class
       "-moz-transition": "all .5s ease",
        "-ms-transition": "all .5s ease",
         "-o-transition": "all .5s ease",
            "transition": "all .5s ease"
    });

// release: delete TODO: function
  if (gnEndX > screenWidth * .95 || gnEndX-gnStartX > screenWidth*.2) {
    // cardDom.css('opacity', '0');
    cardDom.remove();
console.log('delete');
  }
// release: go back
  else{
    cardDom.css({
      opacity: 1,
      transform: "translateX(0px)"
    });
  }
  
  drag = false;
  // event.preventDefault();      
});

 
  $("main").scroll(function() { 
    if($("main").scrollTop() + $("main").height() > $(".page-content").height() - 200) {
      messagesApp.loadMsg( messagesApp.nextPage );
    }
  });

});




// Handlebars Helper for timeago
Handlebars.registerHelper('timeago', function(updated) {
  var timestamp = Date.parse( updated );
  var units = [
    { name: "second", limit: 60, in_seconds: 1 },
    { name: "minute", limit: 3600, in_seconds: 60 },
    { name: "hour", limit: 86400, in_seconds: 3600  },
    { name: "day", limit: 604800, in_seconds: 86400 },
    { name: "week", limit: 2629743, in_seconds: 604800  },
    { name: "month", limit: 31556926, in_seconds: 2629743 },
    { name: "year", limit: null, in_seconds: 31556926 }
  ];
  var now = new Date();
  now = Date.parse( "2015-02-02T07:46:23Z" );
  var diff = ( now - timestamp) / 1000;
  if (diff < 5) return "now";
  
  var i = 0, unit;
  while (unit = units[i++]) {
    if (diff < unit.limit || !unit.limit){
      var diff =  Math.floor(diff / unit.in_seconds);
      return diff + " " + unit.name + (diff>1 ? "s" : "") + " ago";
    }
  };
});


// Precompiled Handlebars template for messages
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['msg'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing, alias5="function";

  return "<section class=\"card-msg mdl-shadow--3dp\">\n  <img class=\"user-pic\" src=\"http://message-list.appspot.com"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.author : depth0)) != null ? stack1.photoUrl : stack1), depth0))
    + "\" alt=\"user-pic\">\n  <p class=\"user-name\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.author : depth0)) != null ? stack1.name : stack1), depth0))
    + "</p>\n  <p class=\"post-time\">"
    + alias2(((helper = (helper = helpers.updated || (depth0 != null ? depth0.updated : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"updated","hash":{},"data":data}) : helper)))
    + "</p>\n  <p class=\"post-content\">"
    + alias2(((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"content","hash":{},"data":data}) : helper)))
    + "</p>\n</section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.messages : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();
