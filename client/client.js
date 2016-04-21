  //key: 'AIzaSyC3H26C2RdRAtczTYqlLariqlDbFscfkyY'
var goStop = stop;

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.grow.events({
  'submit .addScrape'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const scrapeScreenName = target.scrapeScreenName.value;
    const scrapeResults = target.scrapeResults.value;
    // Insert a task into the collection
    Meteor.call("scrapeContactsMethod", scrapeScreenName, scrapeResults);
    // Clear form
    target.scrapeScreenName.value = '';
  },
});

Template.profile.helpers({
  profileDetails: function(){
    return Profile.findOne();
  } 
});

Template.grow.helpers({
  scrapeIdQuantity: function(){
     var scrapes = Scraped.find({scrapeId: {$exists:true}},{}).fetch();
     return scrapes.length;
  }
});

Template.track.helpers({
  scrapedDetails: function(){
     var databaseDetails = Scraped.find({scrapeId: {$exists:true}},{}).count();
     return databaseDetails;
  },
    friendsDBDetails: function(){
     var databaseDetails = Tweets.find({friends: {$exists:true}},{}).count();
     return databaseDetails;
  },
    followersDBDetails: function(){
     var databaseDetails = Tweets.find({followers: {$exists:true}},{}).count();
     return databaseDetails;
  },
});


'change .runScriptSwitch': function(event) {
  console.log("switch");
  var x = event.target.checked;
  Session.set("statevalue", x);
  console.log(Session.get("statevalue"));
  if(x==true){
    Meteor.call('go');
  }else{
    Meteor.call('stop');    
  }
 }



});

Template.navTemplate.helpers({
  runninghighlight: function(){
    var goStop = !goStop;
    Session.set('goStop', goStop);
    if(Session.get('goStop')){
      return "no-hover pink accent-2";
    }else{
      return "no-hover"
    }
  },
  stoppedhighlight: function(){
    if(!Session.get('goStop')){
      return "no-hover pink accent-2";
    }else{
      return "no-hover"
    }
  }

});









Template.map.helpers({
  exampleMapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(51.5074, 0.1278),
        zoom: 2
      };
    }
  }
});





Template.map.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('exampleMap', function(map) {
    map.instance.setOptions({styles: [
    {
        "featureType": "all",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.government",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.medical",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.school",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.sports_complex",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#15bcff"
            },
            {
                "visibility": "on"
            },
            {
                "weight": "1.53"
            },
            {
                "invert_lightness": true
            }
        ]
    }
]});

    // Add a marker to the map once it's ready
    var marker = new google.maps.Marker({
      position: map.options.center,
      map: map.instance
    });
  });
});