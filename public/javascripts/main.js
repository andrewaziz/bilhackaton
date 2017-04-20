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

		socket.on("event:returnStatsInterval", function(data) {
			var views = []
			for(d of data) {
				console.log(d);
				views.push(d.brand.view_count);
			}
			var tester = document.getElementById('tester');
			var trace1 = {
				x: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
				y: views,
				type: 'scatter'
			};

			var data = [trace1];

			Plotly.newPlot(tester, data);
		});

		function renderStats(brandData) {
			results.addClass('has-result');
			results.find('#brand-name').text(brandData.name);
			results.find('#brand-image').attr('src', brandData.logo);
		}
	});