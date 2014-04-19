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
var fb = require('./routes/facebook');
var twitterapp = require('./routes/twitterapp');

var conf = {
    client_id:      FB_APP_ID
  , client_secret:  FB_APP_SECRET
  , scope:          'read_stream, email, user_about_me, user_birthday, user_location, publish_stream, user_likes, user_photos, user_relationships, user_status, user_work_history'
  //, redirect_uri:   'http://localhost:3000/auth/facebook/callback'
  , redirect_uri:   'http://assignment1-cogs121.herokuapp.com/auth/facebook/callback'
};

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

//Twitter Authentication
passport.use(new TwitterStrategy({
    consumerKey: process.env.twitter_consumer_key,
    consumerSecret: process.env.twitter_consumer_secret,
    //callbackURL: "http://letsgetsocial.herokuapp.com/auth/twitter/callback"
    callbackURL: "http://assignment1-cogs121.herokuapp.com/twitterapp"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ twitterId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

//twitter routes
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/' }));

app.get('/statuses', twitterapp.printStatuses);

app.get('/twitterapp', function(req, res){
  res.render('twitterapp', { user: "hello" });
});


//Facebook Authentication
var FacebookStrategy = require('passport-facebook').Strategy;
var user = {};

passport.use(new FacebookStrategy({
    clientID: FB_APP_ID,
    clientSecret: FB_APP_SECRET,
    callbackURL: "http://assignment1-cogs121.herokuapp.com/auth/facebook/callback"
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
    callbackURL: "http://assignment1-cogs121.herokuapp.com/auth/facebook/callback"
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


// app.get('/UserHasLoggedIn')
app.get('/UserHasLoggedIn', function(req, res) {

//res.render("index", {name: fb.printName});

  res.render("facebookapp", { title: "Hello!" });
  // res.render("index", { attr: graph.get("/me", function(err, data) {})});
});




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