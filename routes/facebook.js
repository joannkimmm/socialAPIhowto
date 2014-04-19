//var graph = require('fbgraph');
var app = require('../app');
var auth = require('../auth');

exports.view = function (req, res) {
	res.render('facebookapp');
}

exports.profile = function (req, res) {
	var query = '/';
		query += req.user.profile.username;
	// 	query += '/picture';

	// var queryMe = '/me';

	app.graph.get(query, function(err, json) {
		res.render('facebookapp', {
			userProfile: req.user.profile,
			active: true,
			profPic: json.location
		});
	});
}