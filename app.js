//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();


var graph = require('fbgraph');

var conf = {
    client_id:      '433125933498263'
  , client_secret:  '51956c86a09a2a79c4b4b3363812551a'
  , scope:          'email, user_about_me, user_birthday, user_location, publish_stream, read_stream'
  //, redirect_uri:   'http://localhost:3000/auth/facebook'
  , redirect_uri:   'http://assignment1-cogs121.herokuapp.com/auth/facebook'
};

app.get('/auth/facebook', function(req, res) {
	  if (!req.query.code) {
    	var authUrl = graph.getOauthUrl({
	        "client_id":     conf.client_id
	      , "redirect_uri":  conf.redirect_uri
	      , "scope":         conf.scope
    	});

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

	graph.authorize({
	        "client_id":      conf.client_id
	      , "redirect_uri":   conf.redirect_uri
	      , "client_secret":  conf.client_secret
	      , "code":           req.query.code
	    }, function (err, facebookRes) {
	    res.redirect('/UserHasLoggedIn');
  });

  var accessToken = graph.getAccessToken();
  console.log(accessToken);

	// graph
	// // .setAccessToken(req.session.access_token)
 //  .get("/me", function(err, data) {
 //      console.log(data);
 //  });
});

app.get('/UserHasLoggedIn', function(req, res) {
  res.render("index", { title: "Logged In!" });
});


var searchOptions = {
    q:     "brogramming"
  , type:  "post"
};

graph.search(searchOptions, function(err, res) {
  console.log(res); // {data: [{id: xxx, from: ...}, {id: xxx, from: ...}]}
});

// var Twit = require('twit');
// var T = new Twit({
//     consumer_key:         ''
//     , consumer_secret:      ''
//     , access_token:         ''
//     , access_token_secret:  ''
// });

//route files to load
var index = require('./routes/index');

//database setup - uncomment to set up your database
//var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/DATABASE1);

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

//routes
app.get('/', index.view);
// app.get('/', index.);
//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});