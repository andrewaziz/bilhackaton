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
			logo.removeClass('loading');
			var wHeight = $(window).height() + "px";
			$("html, body").animate({ scrollTop: wHeight });
					var views = [];
					var likes = [];
					var sold = [];
					var count = [];
					for(d of data.body) {
						console.log(d.brand);
						views.push(d.brand.view_count);
						likes.push(d.brand.likes_count);
						sold.push(d.brand.sold_count);
						count.push(d.brand.count);
					}	
					var tester = document.getElementById('tester');
					var viewsTrace = {
						x: data.months	,
						y: views,
						type: 'scatter'
					};

					var likesTrace = {
						x: data.months	,
						y: likes,
						type: 'scatter'
					};

					var soldTrace = {
						x: data.months	,
						y: sold,
						type: 'scatter',
						name: 'Sålda artiklar',
					};

					var countTrace = {
						x: data.months	,
						y: count,
						type: 'scatter',
						name: 'Alla upplagda artiklar',
					};

					var viewsData = [viewsTrace];

					var viewsLayout = {
						title: 'SYNLIGHET'
					};

					var likesData = [likesTrace];
					

					var likesLayout = {
						title: 'LIKES'
					};

					var soldData = [soldTrace, countTrace];


					var soldLayout = {
						title: 'SÅLDA ARTIKLAR'
					};

					var viewsPlot = document.getElementById('views-plot');
					var likesPlot = document.getElementById('likes-plot');
					var soldPlot = document.getElementById('sold-plot');

					Plotly.newPlot(viewsPlot, viewsData, viewsLayout);
					Plotly.newPlot(likesPlot, likesData, likesLayout);
					Plotly.newPlot(soldPlot, soldData, soldLayout);
				});

		function renderStats(brandData) {
			results.addClass('has-result');
			results.find('#brand-name').text(brandData.name);
			results.find('#brand-image').attr('src', brandData.logo);			
		}
	});