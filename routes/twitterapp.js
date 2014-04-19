var twit = require('twit');
var followers;
var array;
var id;
var app = require('../app');

// var T = new twit({
//     consumer_key:        process.env.twitter_consumer_key 
//   , consumer_secret:     process.env.twitter_consumer_secret
//   , access_token:        process.env.token
//   , access_token_secret: process.env.tokenSecret
// });

exports.view = function(req, res) {
  res.render('twitterapp');
}

exports.profile = function(req, res) {
  var profilepic = req.user.profile.photos.value;
  res.render('twitterapp', { userProfile: req.user.profile,
                profilepic: profilepic });
}

exports.printStatuses = function(req, res) {
app.T.get('statuses/user_timeline',  function (err, reply) {
var jsonArray = [];
function increment(i) { 
  if (i < 8) {
    var tempJSON = {};
    tempJSON.text = reply[i].text;
    jsonArray.push(tempJSON);
    increment(i+1);
   }
}
increment(0);

 var data = {statuses: jsonArray};

 function myFunction(field, data){
  if (typeof document.getElementsByName("+field+")[0] != 'undefined'){
  document.getElementsByName("+field+")[0].value=data;
 }
}

res.render('twitterapp', data);
});
}

// exports.T = T;