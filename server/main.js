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
scrapeContacts();
});

function scrapeContacts(scrapeId) {
var future = new Future();
T.get('friends/ids', { user_id:'scrapeId', count: 100},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve user timeline :-(", error);

      } else if(!error && 200 == response.statusCode){
        future.return( response );
        var dataLength = data.length;
        console.log("Got ", dataLength, "items");

            for(var i=0; i<dataLength; i++){ 
	           var parsedData = ({       
	            'scrapeId': data.ids[i]     
	            });
	            Tweets.insert(parsedData);
	            console.log("inserted new target", i);  
              }
            }
      }
    })
    )
}