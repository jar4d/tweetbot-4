Tweets = new Mongo.Collection('tweets'); // use a mongoDB to store stuff...

if(Meteor.isClient){

  Template.buttons.events({
    'click #get': function(){
      Meteor.call('getNewTweetsFunction');
    },
    'click #clear': function(){
      Meteor.call('clear');
    },
    'click #retweetAndFriend': function(){
      Meteor.call('retweetAndFriend');
    },
    'click #cleanRetweets': function(){
      Meteor.call('cleanRetweets');
    },    
    'click #go': function(){
      Meteor.call('runSequence');

    //Meteor.setTimeOut(Meteor.call('cleanRetweets'),10000);
    //Meteor.setTimeOut(Meteor.call('retweetAndFriend'),10000);



    }
  });

  Template.twitterData.helpers({
    twitterDataDump: function(){
      var dataDump = Tweets.find({},{}).fetch();
      return dataDump;
    }

  });


}






if (Meteor.isServer) {
  var Future = Npm.require( 'fibers/future' ); 
  var Twit = Meteor.npmRequire('twit');

    T = new Twit({
      consumer_key:         'ZH49pQkvs4g8MvGxKO3n2A8Hl', // API key
      consumer_secret:      'h604NrlRB19KbPvSRwGCSTD85jn7S3iqJMpnwhF7cT8R5BQCYV', // API secret
      access_token:         '4490350223-LnzFwqy6xb3QvuwD7cteSzGnAolm3801vAcAgLh', 
      access_token_secret:  'fPRWWkqrwaXbvk33TLNPhnWela9BB3ZhIBTBYF1h7NWZA'
    });

Meteor.methods({
  runSequence: function(){
    for(var i=0; i<5; i++){
      Meteor.setTimeout(
        goFunction()

          ,5000);
    }


  },



  clear: function(){
    console.log("cleared DB...");
    return Tweets.remove({});
  },
//USE MAX_ID 
  getNewTweetsFunction: function( ) {
    console.log("getNewTweetsFunction function called...");
      //get new stuff
    var future = new Future();


    //var max_id: 0;
      T.get('search/tweets', { q:'"RT to win"' , result_type:'mixed', count: 100},  
          Meteor.bindEnvironment(function(error, data, response ) {
          if ( error ) {
            future.return( error );
            console.log("couldnt retrieve search :-(", error);
          } else if(!error && 200 == response.statusCode){
            future.return( response );
            console.log("got ", data.statuses.length, " tweets");

            for(var i=0; i<data.statuses.length; i++){ 
            //maybe use a try here to catch RT problem
            try{
            var parsedData = ({       
            'createdAt': Date.now(),     
            'tweetID': data.statuses[i].id_str,
            'tweetIDnum': data.statuses[i].id,
            'tweetUN': data.statuses[i].name,            
            'tweetMessage': data.statuses[i].text,
            'originalTweetID':  data.statuses[i].retweeted_status.id_str, //or id?
            'tweetOriginatorID':data.statuses[i].retweeted_status.user.id,
            'tweetOriginatorUN':data.statuses[i].retweeted_status.user.name
            });
            Tweets.insert(parsedData);
            console.log("inserted tweet", i);     
            }
            catch(e){
              console.log("couldnt insert tweet ", i);
              console.log("Error message: ", e);
            }
 
            }
          }
        })
        );
        //this makes the future wait for a proper response...
        return future.wait();

  },

  cleanRetweets: function() {
    var futureCleanRetweets = new Future();
    T.get('statuses/user_timeline', { screen_name:'betarogan', count: 100},  
        Meteor.bindEnvironment(function(error, data, response ) {
          if(error){
            futureCleanRetweets.return( error );
            console.log("couldnt retrieve user timeline :-(", error);
          } else if(!error && 200 == response.statusCode){
            //console.log(data);
            futureCleanRetweets.return( response );
            var dataLength = data.length;
            console.log("Got ", dataLength, "items");

                    for(var i=0; i<dataLength; i++){ 
                        var tweetID = data[i].retweeted_status.id_str;
                        tweetSearch = Tweets.find({'originalTweetID': tweetID}, {'tweetID': tweetID}).fetch();
                        //console.log("there are ", tweetSearch.length, "matching items...");

                        if(tweetSearch.length > 0){
                      //user 'data' status IDs to search mongodb Tweets:
                        Tweets.remove({'originalTweetID': tweetID});
                        Tweets.remove({'tweetID': tweetID});

                        console.log("removed a duplicate tweet #", i, "ID:", tweetID);
                      }
                        else{
                                console.log("not a duplicate. #", i, "ID:", tweetID);
                              }
                    }
          }
        })
        )
  },




  retweetAndFriend: function() {
  var future = new Future();
  var selectedTweet = Tweets.findOne({}, {sort: {date_created: 1}});

  //if have, delete tweet from DB
  if(selectedTweet){
    T.post('statuses/retweet/' + selectedTweet.tweetID, { },
      Meteor.bindEnvironment(function(error,data,response ){
        if(error){
          future.return( error );
          console.log("couldn't retweet", selectedTweet.originalTweetID, error);
        }else if(!error){
          future.return (response);
          console.log("retweeted ", selectedTweet.tweetOriginatorUN);
          //Friend
          T.post('/friendships/create', {user_id: selectedTweet.tweetOriginatorID, follow: 'false'}, 
            function(error, data, response){ 
              if(!error){
                console.log("Success friending ", selectedTweet.tweetOriginatorUN);
              }else{
                console.log("Add friend error: ", error);
              }
            })
          //remove from DB...
          Tweets.remove(selectedTweet._id);
          console.log("removed tweet from DB..")
        }
      })
      );
    return future.wait();
  
  }
  }



});

function getNewTweets() {
    console.log("getNewTweets function called...");
      //get new stuff
    var future = new Future();


    //var max_id: 0;
      T.get('search/tweets', { q:'"RT to win"' , result_type:'mixed', count: 100},  
          Meteor.bindEnvironment(function(error, data, response ) {
          if ( error ) {
            future.return( error );
            console.log("couldnt retrieve search :-(", error);
          } else if(!error && 200 == response.statusCode){
            future.return( response );
            console.log("got ", data.statuses.length, " tweets");

            for(var i=0; i<data.statuses.length; i++){ 
            //maybe use a try here to catch RT problem
            try{
            var parsedData = ({       
            'createdAt': Date.now(),     
            'tweetID': data.statuses[i].id_str,
            'tweetIDnum': data.statuses[i].id,
            'tweetUN': data.statuses[i].name,            
            'tweetMessage': data.statuses[i].text,
            'originalTweetID':  data.statuses[i].retweeted_status.id_str, //or id?
            'tweetOriginatorID':data.statuses[i].retweeted_status.user.id,
            'tweetOriginatorUN':data.statuses[i].retweeted_status.user.name
            });
            Tweets.insert(parsedData);
            console.log("inserted tweet", i);     
            }
            catch(e){
              console.log("couldnt insert tweet ", i);
              console.log("Error message: ", e);
            }
 
            }
          }
        })
        );
        //this makes the future wait for a proper response...
        return future.wait();

  }


function retweetAndFriend() {
  var future = new Future();
  var selectedTweet = Tweets.findOne({}, {sort: {date_created: 1}});

  //if have, delete tweet from DB
  if(selectedTweet){
    T.post('statuses/retweet/' + selectedTweet.tweetID, { },
      Meteor.bindEnvironment(function(error,data,response ){
        if(error){
          future.return( error );
          console.log("couldn't retweet", selectedTweet.originalTweetID, error);
        }else if(!error){
          future.return (response);
          console.log("retweeted ", selectedTweet.tweetOriginatorUN);
          //Friend
          T.post('/friendships/create', {user_id: selectedTweet.tweetOriginatorID, follow: 'false'}, 
            function(error, data, response){ 
              if(!error){
                console.log("Success friending ", selectedTweet.tweetOriginatorUN);
              }else{
                console.log("Add friend error: ", error);
              }
            })
          //remove from DB...
          Tweets.remove(selectedTweet._id);
          console.log("removed tweet from DB..")
        }
      })
      );
    return future.wait();
  
  }
  }

  function cleanRetweets() {
    var futureCleanRetweets = new Future();
    T.get('statuses/user_timeline', { screen_name:'betarogan', count: 100},  
        Meteor.bindEnvironment(function(error, data, response ) {
          if(error){
            futureCleanRetweets.return( error );
            console.log("couldnt retrieve user timeline :-(", error);
          } else if(!error && 200 == response.statusCode){
            //console.log(data);
            futureCleanRetweets.return( response );
            var dataLength = data.length;
            console.log("Got ", dataLength, "items");

                    for(var i=0; i<dataLength; i++){ 
                        var tweetID = data[i].retweeted_status.id_str;
                        tweetSearch = Tweets.find({'originalTweetID': tweetID}, {'tweetID': tweetID}).fetch();
                        //console.log("there are ", tweetSearch.length, "matching items...");

                        if(tweetSearch.length > 0){
                      //user 'data' status IDs to search mongodb Tweets:
                        Tweets.remove({'originalTweetID': tweetID});
                        Tweets.remove({'tweetID': tweetID});

                        console.log("removed a duplicate tweet #", i, "ID:", tweetID);
                      }
                        else{
                                console.log("not a duplicate. #", i, "ID:", tweetID);
                              }
                    }
          }
        })
        )
  }

function goFunction(){
          Meteor.call('clear');
          Meteor.setTimeout(getNewTweets,5000);
          Meteor.setTimeout(cleanRetweets,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(cleanRetweets,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(cleanRetweets,5000);          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(cleanRetweets,5000);          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(retweetAndFriend,5000);
          Meteor.setTimeout(cleanRetweets,5000);


}


}
