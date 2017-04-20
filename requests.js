var request = require('request');
var querystring = require('querystring')

var express = require('express');
var router = express.Router();


module.exports = {
	io: {},
	init: function(server) {
		var self = this;
		self.io = require('socket.io')(server);
		var io = this.io;
		io.on('connection', function (socket) {
			socket.on('event:getAutocomple', function (data) {
				autocompleteStats(socket, data);
			});
			socket.on('event:getStats', function(data) {
				brandStats(socket, data);
			});
			autocompleteStats(socket, "hm");
		});
	}
}

function brandStats(socket, brand) {
	var options = {
		url: 'https://api.plick.se/api/v2/brands/by_slug/' + brand +  '/statistics.json'
	};
	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			socket.emit("event:returnStats", JSON.parse(body));
		}
	});
}

function autocompleteStats(socket, brand) {
	var propertiesObject = {query: brand};
	var options = {
		url: 'https://api.plick.se/api/v2/brands/autocomplete.json',
		qs: {query: brand},
	};
	request.get(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			socket.emit("event:returnAutocomplete", JSON.parse(body));
		}
	});
}
