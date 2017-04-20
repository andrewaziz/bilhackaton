var request = require('request');


var express = require('express');
var router = express.Router();


module.exports = {
	io: {},
	init: function(server) {
		var self = this;
		self.io = require('socket.io')(server);
		var io = this.io;
		io.on('connection', function (socket) {
			socket.on('event:test', function (data) {
				console.log("test event",data);
			});
			requestExample(socket);

		});
	}
}

function requestExample(socket) {
	console.log("requestExample");
	var options = {
		url: 'https://api.plick.se/api/v2/brands/by_slug/hm/statistics.json'
	};
	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);
			socket.emit("event:hmstats", body);
		}
	});
}

function callback(error, response, body) {
	console.log("resp: ", response.statusCode);
	if (!error && response.statusCode == 200) {
		console.log(body);
	}
}
