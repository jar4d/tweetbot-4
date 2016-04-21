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