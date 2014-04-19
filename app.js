//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();
var dotenv = require('dotenv');
dotenv.load();

var graph = require('fbgraph');
var FB_ACCESS_TOKEN = "";
var FB_APP_ID = process.env.Facebook_app_id;
var FB_APP_SECRET = process.env.Facebook_app_secret;

var conf = {
    client_id:      FB_APP_ID
  , client_secret:  FB_APP_SECRET
  , scope:          'read_stream, email, user_about_me, user_birthday, user_location, publish_stream, user_likes, user_photos, user_relationships, user_status, user_work_history'
  , redirect_uri:   'http://localhost:3000/auth/facebook/callback'
  //, redirect_uri:   'http://assignment1-cogs121.herokuapp.com/auth/facebook'
};

var passport = require('passport')
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


// app.use(app.router);

// app.get('/auth/facebook', function(req, res) {
// 	  if (!req.query.code) {
//     	var authUrl = graph.getOauthUrl({
// 	        "client_id":     conf.client_id
// 	      , "redirect_uri":  conf.redirect_uri
// 	      , "scope":         conf.scope
//     	});

//     if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
//       res.redirect(authUrl);
//     } else {  //req.query.error == 'access_denied'
//       res.send('access denied');
//     }
//     return;
//   }

// 	graph.authorize({
// 	        "client_id":      conf.client_id
// 	      , "redirect_uri":   conf.redirect_uri
// 	      , "client_secret":  conf.client_secret
// 	      , "code":           req.query.code
// 	    }, function (err, facebookRes) {
// 	    res.redirect('/UserHasLoggedIn');
//   });

//   var accessToken = graph.getAccessToken();
//   console.log(accessToken);

	// graph
 //  .get("/me", function(err, data) {
 //      console.log(data);
 //  });
// });

// app.get('/UserHasLoggedIn', function(req, res) {
//   res.render("index", { title: "Logged In!" });
// });


// var searchOptions = {
//     q:     "brogramming"
//   , type:  "post"
// };

// graph.search(searchOptions, function(err, res) {
//   console.log(res); // {data: [{id: xxx, from: ...}, {id: xxx, from: ...}]}
// });

//Facebook Authentication
var FacebookStrategy = require('passport-facebook').Strategy;
var user = {};

passport.use(new FacebookStrategy({
    clientID: FB_APP_ID,
    clientSecret: FB_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      console.log("derp herp derp " + accessToken);
      FB_ACCESS_TOKEN = accessToken;
          user.token = accessToken;
    user.refreshToken = refreshToken;
    user.profile = profile;

    graph.setAccessToken(user.token);
      return done(null, user);
    });
  }));

//facebook login
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email, user_about_me, user_birthday, user_location',
                                                                        'publish_stream, read_stream, user_likes, user_photos', 
                                                                        'user_relationships, user_status, user_work_history']}));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/UserHasLoggedIn',
                                           failureRedirect: '/error',
                                          }),
    function(req,res){
    graph.setAccessToken(FB_ACCESS_TOKEN);
    graph.authorize({
        "client_id":      conf.client_id
      , "redirect_uri":   conf.redirect_uri
      , "client_secret":  conf.client_secret
      , "code":           req.query.code
    }, function (err, facebookRes) {
              exports.graph = graph;
      res.redirect('/UserHasLoggedIn');
  });
});

// app.get('/auth/facebook', passport.authenticate('facebook'));
// app.get('/auth/facebook/callback', 
//    // passport.authenticate('facebook-canvas', { successRedirect: '/',
//    //                                           failureRedirect: '/error' }),
//   passport.authenticate('facebook', { scope: ['email, user_about_me, user_birthday, user_location, publish_stream, read_stream, user_likes, user_photos, user_relationships, user_status, user_work_history'] }, 
//     { failureRedirect: '/' }),
//   function(req,res){
//     graph.setAccessToken(FB_ACCESS_TOKEN);
//     graph.authorize({
//         "client_id":      conf.client_id
//       , "redirect_uri":   conf.redirect_uri
//       , "client_secret":  conf.client_secret
//       , "code":           req.query.code
//     }, function (err, facebookRes) {
//               exports.graph = graph;
//       res.redirect('/UserHasLoggedIn');
//   });
// });

//Facebook Canvas authentication
var FacebookCanvasStrategy = require('passport-facebook-canvas');
passport.use(new FacebookCanvasStrategy({
    clientID: FB_APP_ID,
    clientSecret: FB_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      console.log("derp herp derp " + accessToken);
      FB_ACCESS_TOKEN = accessToken;
          user.token = accessToken;
    user.refreshToken = refreshToken;
    user.profile = profile;

    graph.setAccessToken(user.token);
      return done(null, user);
    });
  }));


app.get('/auth/facebook', passport.authenticate('facebook-canvas', { scope: ['email, user_about_me, user_birthday, user_location', 
                                                                              'publish_stream, read_stream, user_likes, user_photos', 
                                                                              'user_relationships, user_status, user_work_history']}));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook-canvas', { successRedirect: '/',
                                             failureRedirect: '/error' }),
    function(req,res){
      graph.setAccessToken(FB_ACCESS_TOKEN);
      graph.authorize({
          "client_id":      conf.client_id
        , "redirect_uri":   conf.redirect_uri
        , "client_secret":  conf.client_secret
        , "code":           req.query.code
      }, function (err, facebookRes) {
                exports.graph = graph;
        res.redirect('/UserHasLoggedIn');
    });
  });

app.post('/auth/facebook/canvas', 
  passport.authenticate('facebook-canvas', { successRedirect: '/',
                                             failureRedirect: '/auth/facebook/canvas/autologin' }));

app.get('/auth/facebook/canvas/autologin', function( req, res ){
  res.send( '<!DOCTYPE html>' +
              '<body>' +
                '<script type="text/javascript">' +
                  'top.location.href = "/auth/facebook";' +
                '</script>' +
              '</body>' +
            '</html>' );
});

app.get('/UserHasLoggedIn', function(req, res) {
    graph
  .get("/me", function(err, data) {
      console.log(data);
  });
  res.render("index", { title: "Logged In!" });
});


//FACEBOOK CANVAS
// app.post('/auth/facebook/canvas', 
//   passport.authenticate('facebook-canvas', { scope: ['email, user_about_me, user_birthday, user_location, publish_stream, read_stream, user_likes, user_photos, user_relationships, user_status, user_work_history'] }, 
//     { failureRedirect: '/auth/facebook/canvas/autologin' }),
//   function(req, res) {
//     graph.setAccessToken(FB_ACCESS_TOKEN);
//     // code is set
//     // we'll send that and get the access token
//     graph.authorize({
//         "client_id":      conf.client_id
//       , "redirect_uri":   conf.redirect_uri
//       , "client_secret":  conf.client_secret
//       , "code":           req.query.code
//     }, function (err, facebookRes) {
//         exports.graph = graph;
//         res.redirect('/UserHasLoggedIn');
//     });
//   });


  // graph
  // .get("/me", function(err, data) {
  //     console.log(data);
  // });

//routes
// app.get('/auth/facebook',
//   passport.authenticate('facebook', { scope: 'read_stream, email, user_about_me, user_birthday, user_location, publish_stream, user_likes, user_photos, user_relationships, user_status, user_work_history' })
// );

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