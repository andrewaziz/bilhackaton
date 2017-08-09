	jQuery(document).ready(function($) {
		var inputWrapper = $('#input-wrapper');
		var autocomplete = $('.autocomplete');
		var logo = $('#logo');
		var body = $('body');
		var inputs = inputWrapper.find('input');
		var brandInput = inputWrapper.find('#brand-input');
		var inputAutoComplete = inputWrapper.find('.suggestion');
		var submit = $('#submit');
		var results = $('.results');
		var compareButton = $('#compare-toggle');
		var regularButton = $('#regular-toggle');
		var compareInput = $('#compare-input');
		var compare = false;

		socket = io.connect('/');
		$('.test').on('click', function(){ 
			socket.emit('event:test', "this is a socket test");
		});

		$('body').keydown(function(e) {
		    var code = e.keyCode || e.which;
		    if (code == '9') {
		    	e.preventDefault();
		    }
		 });

		inputs.on('keyup', function(e) {
			var query = $(this).val().toLowerCase();
			if(e.keyCode == 9) {
				e.preventDefault();
				$(this).attr('slug', inputAutoComplete.attr('slug'));
				$(this).val(inputAutoComplete.text());
				inputAutoComplete.text("");
				autocomplete.removeClass('show');
			}
			else if(e.keyCode == 8 && query.length < 3) {
				inputAutoComplete.text("");
				autocomplete.removeClass('show');
			} else if(e.keyCode == 13) {
				submit.click();
			} else if(query.length > 2) {
				socket.emit('event:getAutocomplete', query);
				autocomplete.addClass('show');
			}
		});

		socket.on('event:returnAutocomplete', function(data) {
			var suggestedName = (data.brands && data.brands.length > 0 ? data.brands[0].name : '');
			var suggestedSlug = (data.brands && data.brands.length > 0 ? data.brands[0].slug : '');
			inputAutoComplete.text(suggestedName);
			inputAutoComplete.attr('slug', suggestedSlug);
		});

		submit.on('click', function(e) {
			e.preventDefault();
			var slug = brandInput.attr('slug');			
			var query = slug != '' && slug.length != 0 ? slug : brandInput.val();
			if(compare) {
				var slug = brandInput.attr('slug');			
				var query = slug != '' && slug.length != 0 ? slug : brandInput.val();
				var compareSlug = compareInput.attr('slug');
				var compareQuery = compareSlug != '' && compareSlug.length != 0 ? compareSlug : compareInput.val();
				socket.emit('event:getCompareStats', [query, compareQuery]);
			} else {
				var slug = brandInput.attr('slug');			
				var query = slug != '' && slug.length != 0 ? slug : brandInput.val();
				socket.emit('event:getStats', query);
			}
			inputAutoComplete.parent().removeClass('show');
			inputAutoComplete.text("");
			body.addClass('loading');
			brandInput.attr('slug', '');
			compareInput.attr('slug', '');
		});

		compareButton.on('click', function(e) {
			compare = true;
			$(this).fadeOut(120);
			setTimeout(function() { 
				inputWrapper.addClass('compare');
				compareInput.fadeIn(125); 
				regularButton.fadeIn(120);
			}, 115);
		});

		regularButton.on('click', function(e) {
			compare = false;
			$(this).fadeOut(120);
			setTimeout(function() {				
				compareInput.fadeOut(120); 
				compareButton.fadeIn(120);
				setTimeout(function() {
					inputWrapper.removeClass('compare');
				}, 125);
			}, 125);
		});

		socket.on('event:returnStats', function(data) {
			console.log("got result: ", data);
			renderStats(data.brand);
		});

		socket.on("event:returnStatsInterval", function(data) {
			body.removeClass('loading');
			var wHeight = $(window).height() + "px";
			console.log("stats", data);
			$("html, body").animate({ scrollTop: wHeight });
			if(!data.compare) {
				var views = [];
				var likes = [];
				var sold = [];
				var count = [];
				var convos = [];
				for(d of data.body) {
					views.push(d.brand.view_count);
					likes.push(d.brand.likes_count);
					sold.push(d.brand.sold_count);
					count.push(d.brand.count);
					convos.push(d.brand.conversations_count);
				}	
				var tester = document.getElementById('tester');
				var reversedMonths = data.months.reverse();
				var viewsTrace = {
					x: reversedMonths,
					y: views,
					type: 'scatter'
				};

				var likesTrace = {
					x: reversedMonths,
					y: likes,
					type: 'scatter'
				};

				var soldTrace = {
					x: reversedMonths,
					y: sold,
					type: 'scatter',
					name: 'Sålda artiklar',
				};

				var countTrace = {
					x: reversedMonths,
					y: count,
					type: 'scatter',
					name: 'Alla upplagda artiklar',
				};

				var convosTrace = {
					x: reversedMonths,
					y: convos,
					type: 'scatter',
					name: 'Konversationer',
				};

				var convosData = [convosTrace];

				var convosLayout = {
					title: 'KONVERSATIONER'
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
				var convosPlot = document.getElementById('convos-plot');

				Plotly.newPlot(viewsPlot, viewsData, viewsLayout);
				Plotly.newPlot(likesPlot, likesData, likesLayout);
				Plotly.newPlot(soldPlot, soldData, soldLayout);
				Plotly.newPlot(convosPlot, convosData, convosLayout);
			} else {
				var views = [[],[]];
				var likes = [[],[]];
				var sold = [[],[]];
				var count = [[],[]];
				var convos = [[],[]];
				for(d of data.body[0]) {
					views[0].push(d.brand.view_count);
					likes[0].push(d.brand.likes_count);
					sold[0].push(d.brand.sold_count);
					count[0].push(d.brand.count);
					convos[0].push(d.brand.conversations_count);
					views[1].push(d.brand.view_count);
					likes[1].push(d.brand.likes_count);
					sold[1].push(d.brand.sold_count);
					count[1].push(d.brand.count);
					convos[1].push(d.brand.conversations_count);
				}	
				var tester = document.getElementById('tester');
				var reversedMonths = data.months.reverse();
				var viewsTrace = {
					x: reversedMonths,
					y: views,
					type: 'scatter'
				};

				var likesTrace = {
					x: reversedMonths,
					y: likes,
					type: 'scatter'
				};

				var soldTrace = {
					x: reversedMonths,
					y: sold,
					type: 'scatter',
					name: 'Sålda artiklar',
				};

				var countTrace = {
					x: reversedMonths,
					y: count,
					type: 'scatter',
					name: 'Alla upplagda artiklar',
				};

				var convosTrace = {
					x: reversedMonths,
					y: convos,
					type: 'scatter',
					name: 'Konversationer',
				};

				var convosData = [convosTrace];

				var convosLayout = {
					title: 'KONVERSATIONER'
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
				var convosPlot = document.getElementById('convos-plot');

				Plotly.newPlot(viewsPlot, viewsData, viewsLayout);
				Plotly.newPlot(likesPlot, likesData, likesLayout);
				Plotly.newPlot(soldPlot, soldData, soldLayout);
				Plotly.newPlot(convosPlot, convosData, convosLayout);
			}
		});

		function renderStats(brandData) {
			results.addClass('has-result');
			results.find('#brand-image').attr('src', brandData.logo);			
		}
	});