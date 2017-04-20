var request = require('request');
var moment = require('moment');

var express = require('express');
var router = express.Router();


module.exports = {
	io: {},
	init: function(server) {
		var self = this;
		self.io = require('socket.io')(server);
		var io = this.io;
		io.on('connection', function (socket) {
			socket.on('event:getAutocomplete', function (data) {
				autocompleteStats(socket, data);
			});
			socket.on('event:getStats', function(data) {
				brandStats(socket, data);
			});
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
			brandStatsInterval(socket, brand);
		}
	});
}


function autocompleteStats(socket, brand) {
	var options = {
		url: 'https://api.plick.se/api/v2/brands/autocomplete.json',
		qs: {query: brand},
	};
	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			socket.emit("event:returnAutocomplete", JSON.parse(body));
		}
	});
}

function brandStatsInterval(socket, brand) {
	var curr = moment();
	var last = curr.format("YYYYMMDD")
	var first = curr.format("YYYYMM01");
	var months = [];
	var results = [];
	for(var i = 0; i < 12; i++) {
		curr = curr.subtract(1, 'month').endOf('month');
		last = curr.format("YYYYMMDD")
		first = curr.format("YYYYMM01");
		monthName = curr.format('MMM');
		months.push(monthName);
		var queries = {from_date: first, to_date: last};
		var options = {
			url: 'https://api.plick.se/api/v2/brands/by_slug/' + brand + '/statistics.json',
			qs: queries,
		};
		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				results.push(JSON.parse(body));
				if(results.length == 12) {
					socket.emit("event:returnStatsInterval", {months: months, body: results});
				}
			}
		});

	}
}

