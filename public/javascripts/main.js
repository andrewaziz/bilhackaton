jQuery(document).ready(function($) {
	socket = io.connect('/');
	$('.test').on('click', function(){ 
		console.log("test");
		socket.emit('event:test', "this is a socket test");
	});
});