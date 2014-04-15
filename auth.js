//load environment variables
var dotenv = require('dotenv');
dotenv.load();

// var fb = require('fbgraph');
// fb.set('fb_app_id', process.env.Facebook_app_id);
// fb.set('fb_app_secret', process.env.Facebook_app_secret);

// var twitter = requre('twit');
// twitter.get('twitter_app_key', process.env.Twitter_app_key);
// twitter.get('twitter_app_secret', process.env.twitter_app_secret);

// exports.fb = fb;
// exports.twitter = twitter;

/**
* Add your authentication apis here with example like the bottom
*/
/**
//add instagram api setup
var ig = require('instagram-node-lib');
ig.set('client_id', process.env.instagram_client_id);
ig.set('client_secret', process.env.instagram_client_secret);

//export ig as a parameter to be used by other methods that require it.
exports.ig = ig;
**/