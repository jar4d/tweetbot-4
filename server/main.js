Tweets = new Mongo.Collection('tweets'); // use a mongoDB to store stuff...
var Future = Npm.require( 'fibers/future' ); 
var Twit = Meteor.npmRequire('twit');

T = new Twit({
  consumer_key:         'WRIK81ClYsbHpNk6hApkzaEBm', // API key
  consumer_secret:      '9W0LZcRJJjoieQFxRrnEeqsMzmNz2jCZNOkxDYwdpd941T1Qm2', // API secret
  access_token:         '719959002831069186-jQnxT4nei7lfU571LIgbeZQ9hueVWlW', 
  access_token_secret:  'ssBkvwpUHSfxLG8m5SGUdWU48egvaD417S9JEq98U65kB'
});

Meteor.methods({

});

Meteor.startup(function(){
	var profileScreenName = "annecdotalUK";
	var scrapeScreenName = "jar4d";
	scrapeContacts(scrapeScreenName);
	getProfile(profileScreenName);
});


function getProfile(){
var future = new Future();
T.get('users/show', { screen_name:'profileScreenName'},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve profile", error);

      } else if(!error && 200 == response.statusCode){
       console.log(data);
       future.return( response );

       var parsedData = ({   
        'id': data.id,
		'description': data.description,    
        'favourites_count': data.favourites_count,
        'followers_count': data.followers_count,
        'friends_count': data.friends_count,
        'listed_count': data.listed_count,
        'profile_background_image_url': data.profile_background_image_url,
        'profile_image_url': data.profile_image_url,
        });
        Tweets.insert(parsedData);
        console.log("updated profile");  
              
        }
      
    })
)	
}

function scrapeContacts(scrapeScreenName) {
var future = new Future();
T.get('friends/ids', { screen_name:'scrapeScreenName', count: 100},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve scrape", error);

      } else if(!error && 200 == response.statusCode){
       console.log(data);
       future.return( response );
        var dataLength = data.ids.length;
        //console.log("Got ", dataLength, "items");

            for(var i=0; i<dataLength; i++){ 
	           var parsedData = ({       
	            'scrapeId': data.ids[i]     
	            });
	            Tweets.insert(parsedData);
	            console.log("inserted new target", data.ids[i] );  
              }
        }
      
    })
)
}

function getFriends(profileScreenName){ //will only work up to 5000
var future = new Future();
T.get('friends/ids', { screen_name:'profileScreenName'},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve friends", error);

      } else if(!error && 200 == response.statusCode){
       console.log(data);
       future.return( response );
        var dataLength = data.ids.length;
        //console.log("Got ", dataLength, "items");

            for(var i=0; i<dataLength; i++){ 
	           var parsedData = ({       
	            'friends': data.ids[i]     
	            });
	            Tweets.insert(parsedData);
	            console.log("inserted new friend", data.ids[i] );  
              }
        }
      
    })
)
}

function getFollowers(profileScreenName){ //will only work up to 5000
var future = new Future();
T.get('followers/ids', { screen_name:'profileScreenName'},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve friends", error);

      } else if(!error && 200 == response.statusCode){
       console.log(data);
       future.return( response );
        var dataLength = data.ids.length;
        //console.log("Got ", dataLength, "items");

            for(var i=0; i<dataLength; i++){ 
	           var parsedData = ({       
	            'friends': data.ids[i]     
	            });
	            Tweets.insert(parsedData);
	            console.log("inserted new friend", data.ids[i] );  
              }
        }
      
    })
)
}

function addContacts(){
var future = new Future();
T.get('followers/ids', { screen_name:'profileScreenName'},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve friends", error);

      } else if(!error && 200 == response.statusCode){
       console.log(data);
       future.return( response );
        var dataLength = data.ids.length;
        //console.log("Got ", dataLength, "items");

            for(var i=0; i<dataLength; i++){ 
	           var parsedData = ({       
	            'friends': data.ids[i]     
	            });
	            Tweets.insert(parsedData);
	            console.log("inserted new friend", data.ids[i] );  
              }
        }
      
    })
)
}




