var graph = require('fbgraph');

exports.view = function(req, res) {
	 res.render('facebook', data);

}

exports.printName = function(req, res) {
	// graph.get('/me', function(err, res) {
	// 	console.log(response);
	// 	var data = JSON.stringify(res);
	// 	var jsonArray = [];
	// 	var tempJSON = {};
	// 	tempJSON.first_name = res.first_name;
	// 	console.log(res.first_name);
	// 	jsonArray.push(tempJSON);
	// 	var data = {info: jsonArray};
	//  res.render('facebook', data);
	 //res.redirect("/UserHasLoggedIn", data);
	// });
}