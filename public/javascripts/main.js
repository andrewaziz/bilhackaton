jQuery(document).ready(function($) {
	var inputWrapper = $('#input-wrapper');
	var brandInput = inputWrapper.find('input');
	var inputAutoComplete = inputWrapper.find('.autocomplete');
	var submit = $('#submit');
	var results = $('.results');	

	socket = io.connect('/');
	$('.test').on('click', function(){ 
		console.log("test");
		socket.emit('event:test', "this is a socket test");
	});

	brandInput.on('keyup', function(e) {
		var query = $(this).val();
		if(e.keyCode == 9) {
			e.preventDefault();
			$(this).val(inputAutoComplete.text());
		}
		else if(e.keyCode == 8) {
			inputAutoComplete.text("");
		} else if(query.length > 2) {
			socket.emit('event:getAutocomplete', query);
		}
	});

	socket.on('event:returnAutocomplete', function(data) {
		var suggested = (data.brands && data.brands.length > 0 ? data.brands[0].name : '');
		inputAutoComplete.text(suggested);
	});

	submit.on('click', function(e) {
		e.preventDefault();
		var query = brandInput.val();
		socket.emit('event:getStats', query);
	});

	socket.on('event:returnStats', function(data) {
		console.log("got result: ", data);
		renderStats(data.brand);
	});

	function renderStats(brandData) {
		results.addClass('has-result');
		results.find('#brand-name').text(brandData.name);
		results.find('#brand-image').attr('src', brandData.logo);
	}
});