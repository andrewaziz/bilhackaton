	jQuery(document).ready(function($) {
		var inputWrapper = $('#input-wrapper');
		var autocomplete = $('.autocomplete');
		var logo = $('#logo');
		var brandInput = inputWrapper.find('input');
		var inputAutoComplete = inputWrapper.find('.autocomplete .suggestion');
		var submit = $('#submit');
		var results = $('.results');	

		socket = io.connect('/');
		$('.test').on('click', function(){ 
			console.log("test");
			socket.emit('event:test', "this is a socket test");
		});

		$('body').keydown(function(e) {
		    var code = e.keyCode || e.which;
		    if (code == '9') {
		    	e.preventDefault();
		    }
		 });

		brandInput.on('keyup', function(e) {
			var query = $(this).val().toLowerCase();
			console.log(query);
			if(e.keyCode == 9) {
				e.preventDefault();
				$(this).val(inputAutoComplete.val());
			}
			else if(e.keyCode == 8) {
				inputAutoComplete.text("");
				autocomplete.removeClass('show');
			} else if(query.length > 2) {
				socket.emit('event:getAutocomplete', query);
				autocomplete.addClass('show');
			}
		});

		socket.on('event:returnAutocomplete', function(data) {
			var suggestedName = (data.brands && data.brands.length > 0 ? data.brands[0].name : '');
			var suggestedSlug = (data.brands && data.brands.length > 0 ? data.brands[0].slug : '');
			inputAutoComplete.text(suggestedName);
			inputAutoComplete.val(suggestedSlug);
		});

		submit.on('click', function(e) {
			e.preventDefault();
			var query = brandInput.val();
			console.log(query);
			socket.emit('event:getStats', query);
			inputAutoComplete.parent().removeClass('show');
			inputAutoComplete.text("");
			logo.addClass('loading');
		});

		socket.on('event:returnStats', function(data) {
			console.log("got result: ", data);
			renderStats(data.brand);
		});

		socket.on("event:returnStatsInterval", function(data) {
			views = [];
			for(d of data.body) {
				console.log(d.brand.view_count);
				views.push(d.brand.view_count);
			}
			var tester = document.getElementById('tester');
			var trace1 = {
				x: data.months	,
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
			logo.removeClass('loading');
			var wHeight = $(window).height() + "px";
			console.log(wHeight);
			$("html, body").animate({ scrollTop: wHeight });
		}
	});