var Future = Npm.require( 'fibers/future' ); 
var Twit = Meteor.npmRequire('twit');
var human = Npm.require('humanlike');
var Random = Npm.require("random-js")(); // uses the nativeMath engine


 profileScreenName = "anecdotalUK";
 scrapeScreenName = "jar4d";
 scrapeResults = 100;
 var loopvar = 0;

T = new Twit({
  consumer_key:         'YJE9JnQyd4phMYoCr6rBRYSza', // API key
  consumer_secret:      'k9EMbE3Ka6tVLIVn1Gdp59WpaQAdvfNTTwHrJ0UL4B4wXb6Xfn', // API secret
  access_token:         '719959002831069186-ahsWSj5gb6PdRkesvF31corRTwTpdus', 
  access_token_secret:  'naRAwhfSboyfGdHwPlGadFvIHQSprlaCGz4NpxHGp0whR'
});

Meteor.startup(function(){
  TimeDB.remove({});
  Profile.remove({}); //purge
  Tweets.remove({}); //purge
  UnfollowDB.remove({});
  console.log("moment: ", moment().format('YYYY-MM-DDTHH:mm:ssTZD'));

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

  //refresh profile every 60 mins
  //Meteor.setInterval(function(){getProfile(profileScreenName);}, 1000*60*60); //refreshes everything... 
  //Meteor.call('createTime');

});

Meteor.methods({
  scrapeContactsMethod: function(scrapeScreenName, scrapeResults){
   scrapeContacts(scrapeScreenName, scrapeResults);
  },

  createTime: function(){
      console.log("createTime");

      human(200).forEach(

        function(t) { 
          //console.log(t);

          var dayStart = moment().set('hour', 0).set('minutes', 0).utcOffset(0);
          var humanVar = moment(dayStart).add(t, 'seconds'); 
          var humanVarFormatted = humanVar.format('YYYY-MM-DDTHH:mm:ssTZD');
          var parsedData = {
            'time':humanVarFormatted
          }
          TimeDB.insert(parsedData);
          console.log(humanVarFormatted);
        }
      );
    },

    clearTime: function(){
      TimeDB.remove({});
    },

  go: function(){
      console.log("running scripts...");      

     actionInterval = Meteor.setInterval(function(){
        var randomValue = Random.integer(1, 4);
        console.log(randomValue);
        switch(randomValue) {
            case 1:
                randomTime();
                console.log("Calling a favourite"); //favourites a random post from our special list. 
                addScrapedFriendToList();
                break;
            case 2:
                randomTime();
                console.log("Calling an unfollow"); //compares followers and non, removes non.
                addScrapedFriendToList();
                break;
            case 3:
                randomTime();            
                console.log("Calling addScrapedFriend"); // follows scraped users
                addScrapedFriend();
                break;            
            case 4:
                randomTime();
                console.log("Calling addScrapedFriendToList"); //takes scraped users, and adds them to our list 'creative leaders'
                addScrapedFriendToList();
                break;
               

        }
    },randomTime());


  },

  stop: function(){
      console.log("running clear interval scripts...");    
      Meteor.clearTimeout(actionInterval);
  }
});


function randomTime(){
  randomValue = Random.integer(300000, 900000); //between 5 and 15 minutes (100,000s)  
  console.log("random time generated: ", randomValue);
  return randomValue;

}



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

function addScrapedFriend(){
var scrapeId = Scraped.findOne({},{scrapeId: {$exists:true}}).scrapeId;

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


function addScrapedFriendToList(){
var scrapeId = Scraped.findOne({},{scrapeId: {$exists:true}}).scrapeId;
console.log("running addScrapedFriendToList");

var future = new Future();

T.post('lists/members/create', {slug:'creative-influencers-ii', owner_screen_name:'anecdotalUK', user_id: scrapeId},  
    Meteor.bindEnvironment(function(error, data, response ) {
      if(error){
        future.return( error );
        console.log("for user_id: ", scrapeId);
        console.log("couldnt add to list", error);
        Scraped.remove({'scrapeId':scrapeId});

      } else if(!error && 200 == response.statusCode){
       //console.log(data);
       future.return( response );
        console.log(data);

        console.log("Added someone to creative-influencers: ", scrapeId);
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

