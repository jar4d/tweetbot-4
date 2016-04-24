var Future = Npm.require( 'fibers/future' ); 
var Twit = Meteor.npmRequire('twit');
//var randomTime = 5000;


 profileScreenName = "anecdotalUK";
 scrapeScreenName = "jar4d";
 scrapeResults = 100;
 stopped = true;

T = new Twit({
  consumer_key:         'comYuF8iiRr3MP8L3sDejdh3E', // API key
  consumer_secret:      'C4UjNhK3Lqlhoc7ivz7BlPG11ABXaorNXPYJsGvuXiPat9EHSX', // API secret
  access_token:         '719959002831069186-xKH9fEjKRQiJRoSMIfAURyhRnFfkxdm', 
  access_token_secret:  'yIRPcoovPNHcfOG8Q1NEhnIV9sZfYrvLBWg82ggDsDcFq'
});

Meteor.startup(function(){

  Profile.remove({}); //purge
  Tweets.remove({}); //purge
  UnfollowDB.remove({});

         var parsedData = ({   
          'profileID':"1",
          'stopped':"stopped",
          'screen_name': null,
          'id': null,
          'description': null,
          'favourites_count': null,
          'followers_count': null,
        'friends_count': null,
        'listed_count': null,
        'profile_banner_url': null,
        'profile_image_url': null,
        });
        Profile.insert(parsedData);

  getProfile(profileScreenName);

/*
  Meteor.setTimeout(function(){getProfile(profileScreenName)},1000);
  Meteor.setTimeout(function(){getFriends(profileScreenName)},5000);
  Meteor.setTimeout(function(){getFollowers(profileScreenName)},10000);
  Meteor.setTimeout(function(){  compareFriendsFollowers()},15000);
*/      


  


  //refresh profile every 60 mins
  Meteor.setInterval(function(){getProfile(profileScreenName);}, 1000*60*60);


});

Meteor.methods({
	scrapeContactsMethod: function(scrapeScreenName, scrapeResults){
	 scrapeContacts(scrapeScreenName, scrapeResults);
	},
  go: function(){
      console.log("running scripts...");      
      
      //while (0){

        //}


      var randomTime = (1000 * 60 * 4) + (Math.random()* 1000 * 60 * 2) + (Math.random() * 100);


      createInterval = Meteor.setInterval(function(){
                                                      create();
                                                    }, randomTime);
      cleanInterval = Meteor.setInterval(function(){
                                                    cleanFriends();
                                                  }, 1000 * 60 * 4);
      cleanInterval = Meteor.setInterval(function(){
                                                    cleanFriends();
                                                  }, 1000 * 60 * 4);
  },
  stop: function(){
      console.log("running clear interval scripts...");    
      Meteor.clearTimeout(createInterval);
      Meteor.clearTimeout(cleanInterval);
  }
});


function compareFriendsFollowers(){
console.log("4/4 RUNNING compareFriendsFollowers");
//find all following
// friends we follow, followers follow us
var followers = Tweets.find({},{followers: {$exists:true}}, {$sort:{$natural:1}}).fetch();
var friends = Tweets.find({},{friends: {$exists:true}}, {$sort:{$natural:1}}).fetch();
//console.log("followers: ", followers);
//console.log("friends: ", friends);
  for(var i = 0; i < friends.length; i++){
    //console.log("CleanFriends", [i]);
    var compare = Tweets.find({followers:friends[i]}).fetch();
    //finds whether a friend is also a follower.
      if(compare.length === 0){//no match, not a follower
        var destroyId = friends[i];
        console.log("added destroyId to UnfollowDB: ", destroyId);
        //not a follower, so we add to the unfollow database
         var parsedData = ({       
              'destroyId':destroyId.friends    
            });
         UnfollowDB.insert(parsedData);
      }else{//is a follower. 
        console.log("follower");
      }
  }
}
             

function create(){
  console.log("running create loop");
	var scrapeId = Scraped.findOne({},{scrapeId: {$exists:true}}).scrapeId;

	if(scrapeId.length === 0){//we need new friends. Alert!
    console.log("run out of scrapeIds. Reload please.");
	}else
	{
	addScrapedFriend(scrapeId);
	}
	//check if there are friends available...
}

function getProfile(profileScreenName){
    console.log("1/4 RUNNING GETPROFILE");

var future = new Future();
T.get('users/show', { screen_name:profileScreenName},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt retrieve profile", error);

      } else if(!error && 200 == response.statusCode){
       future.return( response );

       var parsedData = ({   
       	'screen_name': data.screen_name,
        'id': data.id,
		    'description': data.description,    
        'favourites_count': data.favourites_count,
        'followers_count': data.followers_count,
        'friends_count': data.friends_count,
        'listed_count': data.listed_count,
        'profile_banner_url': data.profile_banner_url,
        'profile_image_url': data.profile_image_url,
        });
        Profile.update({profileID:"1"}, parsedData);
        console.log("updated profile");  
       console.log(parsedData);
          
        getFriends();

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
	            Scraped.insert(parsedData);
	            console.log("inserted new target", data.ids[i] );  
              }
        }
      
    })

)
    return future.wait();
}

function getFriends(profileScreenName){ //will only work up to 5000
console.log("2/4 RUNNING GETFRIENDS");

var future = new Future();
T.get('friends/ids', { screen_name:profileScreenName},  
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
          getFollowers();

        }
      
    })
)
	return future.wait();	
}

function getFollowers(profileScreenName){ //will only work up to 5000
console.log("3/4 RUNNING GETFOLLOWERS");
var future = new Future();
T.get('followers/ids', { screen_name:profileScreenName},  
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
	            console.log("retrieved follower", data.ids[i] );  
              }

              compareFriendsFollowers();

        }
      
    })
)
    return future.wait();
}

function addScrapedFriend(scrapeId){
console.log("running addScrapedFriend");

var future = new Future();

T.post('friendships/create', {user_id: scrapeId, follow: true},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("for user_id: ", scrapeId);
        console.log("couldnt retrieve friends", error);
        Scraped.remove({'scrapeId':scrapeId});

      } else if(!error && 200 == response.statusCode){
       //console.log(data);
       future.return( response );
        console.log("Got a new friend ", data.screen_name);
        Scraped.remove({'scrapeId':scrapeId});
        }
      
    })
)
return future.wait();
}

function cleanFriends(){
var future = new Future();
console.log("cleanFriends");
var UnfollowDBId = UnfollowDB.findOne({},{$sort:{$natural:1}}); //{sort: {date_created: -1}}
//Tweets.find({},{followers: {$exists:true}}, {$sort:{$natural:1}}).fetch();

T.post('friendships/destroy', {user_id: UnfollowDBId.destroyId},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("couldnt remove friend", error);
        UnfollowDB.remove({'destroyId':UnfollowDBId.destroyId});


      } else if(!error && 200 == response.statusCode){
       console.log(data);
       future.return( response );
        console.log("Removed a friend", data.screen_name);
        UnfollowDB.remove({'destroyId':UnfollowDBId.destroyId});
        }
      
    })
)
return future.wait();
}

//getFriends
//getFollowers

/*
if (followers == 0){
  //import followers
  console.log("running getFollowers");
  getFollowers(profileScreenName);
}
else if (friends == 0){
  //import friends
  console.log("running getFriends");
  getFriends(profileScreenName);
}else{//iterate through them
  console.log("asking to run cleanFriends");
  for(var i = 0; i < friends; i++){
    console.log("CleanFriends", [i]);

    var compare = Tweets.find({followers:friends[i]});
    //finds whether a friend is also a follower.
      if(compare.length === 0){//no match, not a follower
        var destroyId = friends[i];
        console.log("asking to run cleanFriends to destroy ", destroyId);

        cleanFriends(destroyId);
      }else{//is a follower. 

      }
  }
}
*/

