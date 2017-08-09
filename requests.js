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
			socket.on('event:getCompareStats', function(data) {				
				compareBrandStats(socket, data);
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

function orderResults(unordered) {
	var order = [];
	order = unordered.sort(function (a, b) {
		var first = moment(a.brand.start_date).format("YYYYMMDD");
		var second = moment(b.brand.start_date).format("YYYYMMDD");
		if(moment(first).isBefore(second)) {
			return -1;
		} else {
			return 1;
		}
	});
	return Object.values(order);
}

function brandStatsInterval(socket, brand) {
	var curr = moment();
	var last = curr.format("YYYYMMDD")
	var first = curr.format("YYYYMM01");
	var months = [];
	var unorderedResults = [];
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
				unorderedResults.push(JSON.parse(body));
				if(unorderedResults.length == 12) {
					//results = orderResults(unorderedResults);
					socket.emit("event:returnStatsInterval", {months: months, body: orderResults(unorderedResults), compare: false});
				}
			}
		});

	}
}

function compareBrandStatsInterval(socket, brands) {
	var curr = moment();
	var last = curr.format("YYYYMMDD")
	var first = curr.format("YYYYMM01");
	var totalResults = [];
	for(var x = 0; x <= 1; x++) {
		var months = [];
		var unorderedResults = [];
		for(var i = 0; i < 12; i++) {
			curr = curr.subtract(1, 'month').endOf('month');
			last = curr.format("YYYYMMDD")
			first = curr.format("YYYYMM01");
			monthName = curr.format('MMM');
			months.push(monthName);
			var queries = {from_date: first, to_date: last};
			var options = {
				url: 'https://api.plick.se/api/v2/brands/by_slug/' + brands[x] + '/statistics.json',
				qs: queries,
			};
			request(options, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					unorderedResults.push(JSON.parse(body));
					if(unorderedResults.length == 12) {
						//results = orderResults(unorderedResults);
						totalResults.push(orderResults(unorderedResults));
						if(totalResults.length == 2) {
							socket.emit("event:returnStatsInterval", {months: months, body: totalResults, compare: true});
						}						
					}
				}
			});

		}
	}
}

function compareBrandStats(socket, brands) {
	var optionsFirst = {
		url: 'https://api.plick.se/api/v2/brands/by_slug/' + brands[0] +  '/statistics.json'
	};
	var optionsSecond = {
		url: 'https://api.plick.se/api/v2/brands/by_slug/' + brands[1] +  '/statistics.json'
	};
	var results = [];
	request(optionsFirst, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			results.push(JSON.parse(body));
			if(results.length > 1) {
				socket.emit("event:returnStats", JSON.parse(body));
				compareBrandStatsInterval(socket, brands);
			}
		}
	});
	request(optionsSecond, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			results.push(JSON.parse(body));
			if(results.length > 1) {
				socket.emit("event:returnStats", JSON.parse(body));
				compareBrandStatsInterval(socket, brands);
			}
		}
	});
}

Object.values = function(object) {
  var values = [];
  for(var property in object) {
    values.push(object[property]);
  }
  return values;
}


