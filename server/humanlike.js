     
//fuck. This won't work, as it needs to 
//look up the whole DB for the nearest time. 

/*
    while(loopvar = 1 || TimeDB.find().fetch().length > 0){
      var nextTime = TimeDB.findOne();
      var now = moment();
      if(moment().isSame(nextTime.time,'HH:mm')){
        console.log("Moment triggered, selecting random function...");

        var randomValue = random.integer(1, 4);
        console.log(randomValue);
        switch(randomValue) {
            case 1:
                console.log("Calling a favourite");
                break;
            case 2:
                console.log("Calling an unfollow");
                cleanFriends();                
                break;
            case 3:
                console.log("Calling a follow");
                create();
                break;            
            case 4:
                console.log("Calling a list");
                break;

        }

        var nextTimeID = TimeDB.findOne()._id;
        TimeDB.remove({nextTimeID});
      }
  }
*/