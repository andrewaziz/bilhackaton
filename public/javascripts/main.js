jQuery(document).ready(function($) {
	var brandInput = $('#brand-input');
	var submit = $('#submit');
	var results = $('#results');

	socket = io.connect('/');
	$('.test').on('click', function(){ 
		console.log("test");
		socket.emit('event:test', "this is a socket test");
	});

	socket.on('event:hmstats', function(data) {
		console.log(data);
	});

	brandInput.on('keydown', function(e) {
		var query = $(this).val();
		socket.emit('event:getAutocomplete', query);
	});

	socket.on('event:returnAutocomplete', function(data) {
		var suggested = data.brands[0].name;
		console.log(suggested);
	});

	submit.on('click', function(e) {
		e.preventDefault();
		var query = brandInput.val();
		socket.emit('event:getStats', query);
	});

	socket.on('event:returnStats', function(data) {
		results.text(data);
	});
});