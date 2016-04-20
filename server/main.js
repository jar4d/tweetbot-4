var Future = Npm.require( 'fibers/future' ); 
var Twit = Meteor.npmRequire('twit');
var randomTime = (1000 * 60 * 3) + (Math.random()* 1000 * 60 * 2) + (Math.random() * 100);

var profileScreenName = "anecdotalUK";
var scrapeScreenName = "jar4d";
var scrapeResults = 10;

T = new Twit({
  consumer_key:         'WRIK81ClYsbHpNk6hApkzaEBm', // API key
  consumer_secret:      '9W0LZcRJJjoieQFxRrnEeqsMzmNz2jCZNOkxDYwdpd941T1Qm2', // API secret
  access_token:         '719959002831069186-j20omPs6bpFXlAfuoINZl8WTQgp1T18', 
  access_token_secret:  'sIPy4O6lT1bEnhu4rFVPiJwmHx9Ry1f6wktBlLzR2pPdB'
});

Meteor.methods({

});

Meteor.startup(function(){

	//scrapeContacts(scrapeScreenName, scrapeResults);
	//getProfile(profileScreenName);
	create();
});





function create(){
	var scrapeId = Tweets.findOne({},{scrapeId: {$exists:true}}).scrapeId;

	if(scrapeId.length === 0){//we need new friends. Alert!

	}else
	{
	addScrapedFriend(scrapeId);

	}





	//check if there are friends available...
}


function cleanFriendsLoop(){ //destroyId
//find all following
// friends we follow, followers follow us
var followers = Tweets.find({},{followers: {$exists:true}}).followers;
var friends = Tweets.find({friends:{$exists:true}}).friends;

for(var i = 0; i < friends.length; i++){
	var compare = Tweets.find({followers:friends[i]});
	//finds whether a friend is also a follower.
	if(compare.length === 0){//no match

	}


}

}






function getProfile(profileScreenName){
var future = new Future();
T.get('users/show', { screen_name:profileScreenName},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve profile", error);

      } else if(!error && 200 == response.statusCode){
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
       console.log(parsedData);
      
        }
      
    })
)	
    return future.wait();
}

function scrapeContacts(scrapeScreenName, scrapeResults) {
var future = new Future();
T.get('followers/ids', { screen_name:scrapeScreenName, count: scrapeResults},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve scrape", error);

      } else if(!error && 200 == response.statusCode){
       console.log(data);
       future.return( response );
        var dataLength = data.ids.length;
        console.log("Got ", dataLength, "items");

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
    return future.wait();
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
	return future.wait();	
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
	            Tweets.insert({       
	            'followers': data.ids[i]     
	            });
	            console.log("inserted new friend", data.ids[i] );  
              }
        }
      
    })
)
    return future.wait();

}

function addScrapedFriend(scrapeId){
var future = new Future();

T.post('friendships/create', {user_id: scrapeId},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve friends", error);

      } else if(!error && 200 == response.statusCode){
       //console.log(data);
       future.return( response );
        console.log("Got a new friend ", data.screen_name);
        Tweets.remove({'scrapeId':scrapeId});
        }
      
    })
)
return future.wait();
}

function cleanFriends(destroyId){
var future = new Future();

T.post('friendships/destroy', {user_id: destroyId},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt remove friend", error);

      } else if(!error && 200 == response.statusCode){
       //console.log(data);
       future.return( response );
        console.log("Removed a friend", data.screen_name);
        Tweets.remove({'friends':destroyId});
        }
      
    })
)
return future.wait();
}

//getFriends
//getFollowers

