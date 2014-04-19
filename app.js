//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();
var dotenv = require('dotenv');
dotenv.load();
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var util = require('util');
var twit = require('twit');

var graph = require('fbgraph');
var FB_ACCESS_TOKEN = "";
var FB_APP_ID = process.env.Facebook_app_id;
var FB_APP_SECRET = process.env.Facebook_app_secret;


//route files to load
var index = require('./routes/index');
var facebook = require('./routes/facebook');
var twitterapp = require('./routes/twitterapp');

var conf = {
    client_id:      FB_APP_ID
  , client_secret:  FB_APP_SECRET
  , scope:          'read_stream, email, user_about_me, user_birthday, user_location, publish_stream, user_likes, user_photos, user_relationships, user_status, user_work_history'
  , redirect_uri:   'http://localhost:3000/auth/facebook/callback'
  // , redirect_uri:   'http://assignment1-cogs121.herokuapp.com/auth/facebook/callback'
};

var T = new twit({
    consumer_key:        process.env.twitter_consumer_key 
  , consumer_secret:     process.env.twitter_consumer_secret
  , access_token:        process.env.token
  , access_token_secret: process.env.tokenSecret
});

exports.T = T;

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// //twitter routes
// app.get('/twitterapp', twitterapp.view);
// app.get('/twitterLoggedIn', twitterapp.profile);

//Twitter Authentication
passport.use(new TwitterStrategy({
    consumerKey: process.env.twitter_consumer_key,
    consumerSecret: process.env.twitter_consumer_secret,
    //callbackURL: "http://letsgetsocial.herokuapp.com/auth/twitter/callback"
    //callbackURL: "http://assignment1-cogs121.herokuapp.com/twitterapp"
    callbackURL: "http://localhost:3000/twitterapp"
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile.id);
    User.findOrCreate({ twitterId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

//twitter routes
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/twitterLoggedIn',
                                     failureRedirect: '/' }),
   function (err, twitterRes) {
                exports.T=T;
        res.redirect('/twitterLoggedIn')});

//twitter routes
app.get('/twitterapp', twitterapp.view);
app.get('/twitterLoggedIn', twitterapp.profile);
app.get('/statuses', twitterapp.printStatuses);

// app.get('/twitterapp', function(req, res){
//   res.render('twitterapp', { user: "Hello," });
// });s




//Facebook Authentication
var FacebookStrategy = require('passport-facebook').Strategy;
var user = {};

passport.use(new FacebookStrategy({
    clientID: FB_APP_ID,
    clientSecret: FB_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
    // callbackURL: "http://assignment1-cogs121.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //console.log("derp herp derp " + accessToken);
      FB_ACCESS_TOKEN = accessToken;
          user.token = accessToken;
    user.refreshToken = refreshToken;
    user.profile = profile;

    graph.setAccessToken(user.token);
      return done(null, user);
    });
  }));
//routes
app.get('/', index.view);
app.post('/', function(req, res) {
  res.json('YES');
});

//fb routes
app.get('/facebook', facebook.view);
app.get('/UserHasLoggedIn', facebook.profile);
// app.get('/facebook/randPic', facebook.getPic)
// app.get('/facebook/testAPI', facebook.graphAPI);
// app.get('/facebook/json', function(req, res) {
//   res.json(req.user);
// });

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

//Facebook Canvas authentication
var FacebookCanvasStrategy = require('passport-facebook-canvas');
passport.use(new FacebookCanvasStrategy({
    clientID: FB_APP_ID,
    clientSecret: FB_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
    // callbackURL: "http://assignment1-cogs121.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //console.log("derp herp derp " + accessToken);
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
  passport.authenticate('facebook-canvas', { successRedirect: '/UserHasLoggedIn',
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


// app.get('/UserHasLoggedIn')
app.get('/UserHasLoggedIn', function(req, res) {
  res.render("facebookapp", { title: "Hello!" });
});


exports.graph = graph;
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
app.get('/twitterapp', twitterapp.view);

//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});