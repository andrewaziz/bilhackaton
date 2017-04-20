jQuery(document).ready(function($) {
	var tester = document.getElementById('tester');
	var trace1 = {
		x: ['Jan', 'Feb', 'Mar', 'Apr'],
		y: [Math.round(Math.random() * 30),Math.round(Math.random() * 30), Math.round(Math.random() * 30), Math.round(Math.random() * 30)],
		type: 'scatter'
	};

	var trace2 = {
		x: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'],
		y: [Math.round(Math.random() * 30),Math.round(Math.random() * 30), Math.round(Math.random() * 30), Math.round(Math.random() * 30)],
		type: 'scatter'
	};

	var data = [trace1, trace2];

	Plotly.newPlot(tester, data);
});