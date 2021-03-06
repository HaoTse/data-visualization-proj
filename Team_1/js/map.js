var map;
var markerOn = false;
getLocation();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (p) {
        	var lat = p.coords.latitude;
        	var lon = p.coords.longitude;

			// not in Taipei
			if (lat < 24.813281 || lat > 25.299873 || lon < 121.281991 || lon > 122.012727) {
				document.getElementById("info").innerHTML = "<h5 style='color: red;' align='middle'>安安你不在台北</h5>";
				init(25.047238, 121.516777);
			}
			else
        		init(p.coords.latitude, p.coords.longitude);
        });
    }
    else {
        alert("Geolocation is not supported by this browser.");
        init(25.047238, 121.516777);
    }
}

function deleteMarkers(markers) {
	markers.eachLayer(function (layer) {
		markers.removeLayer(layer);
	});
}

function checkboxCtrl(checkboxes) {
	checkboxes[0].checkbox({
		// youbike
		onChecked: function() {
			console.log("1 c");
			deleteMarkers(busMarkers);
			deleteMarkers(parkMarkers);
			deleteMarkers(mrtMarkers);
			markYoubike();
		},
		onUnchecked: function() {
			console.log("1 u");
			if (markerOn) {
				deleteMarkers(youbikeMarkers);
				markerOn = false;
			}
		}
	});

	checkboxes[1].checkbox({
		// mrt
		onChecked: function() {
			console.log("2 c");
			deleteMarkers(youbikeMarkers);
			deleteMarkers(busMarkers);
			deleteMarkers(parkMarkers);
			markMrt();
		},
		onUnchecked: function() {
			console.log("2 u");
			if (markerOn) {
				deleteMarkers(mrtMarkers);
				markerOn = false;
			}
		}
	});

	checkboxes[2].checkbox({
		// bus
		onChecked: function() {
			console.log("3 c");
			deleteMarkers(youbikeMarkers);
			deleteMarkers(parkMarkers);
			deleteMarkers(mrtMarkers);
			if (busMarkersLoaded) {
				busMarkAll();
			}
			else {
				loadStop();
			}

		},
		onUnchecked: function() {
			console.log("3 u");
			if (markerOn) {
				deleteMarkers(busMarkers);
				markerOn = false;
			}
		}
	});

	checkboxes[3].checkbox({
		// parking
		onChecked: function() {
			console.log("4 c");
			deleteMarkers(youbikeMarkers);
			deleteMarkers(busMarkers);
			deleteMarkers(mrtMarkers);
			if (parkMarkersLoaded) {
				markParking();
			}
			else {
				parkingAVAILABLE();
			}
		},
		onUnchecked: function() {
			console.log("4 u");
			if (markerOn) {
				deleteMarkers(parkMarkers);
				markerOn = false;
			}
		}
	});
}

// 現在loading只有在load data才會出現
function init(lat, lon) {
	map = L.map('map').setView([lat, lon], 17);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
		maxZoom: 22,
		minZoom: 11,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(map);

	var checkboxes = [];
	$('.ui.checkbox').each(function() {
		checkboxes.push($(this));
	});
	checkboxCtrl(checkboxes);
}

function twd97_to_latlng($x, $y) {
	var pow = Math.pow, M_PI = Math.PI;
	var sin = Math.sin, cos = Math.cos, tan = Math.tan;
	var $a = 6378137.0, $b = 6356752.314245;
	var $lng0 = 121 * M_PI / 180, $k0 = 0.9999, $dx = 250000, $dy = 0;
	var $e = pow((1 - pow($b, 2) / pow($a, 2)), 0.5);

	$x -= $dx;
	$y -= $dy;

	var $M = $y / $k0;

	var $mu = $M / ($a * (1.0 - pow($e, 2) / 4.0 - 3 * pow($e, 4) / 64.0 - 5 * pow($e, 6) / 256.0));
	var $e1 = (1.0 - pow((1.0 - pow($e, 2)), 0.5)) / (1.0 + pow((1.0 - pow($e, 2)), 0.5));

	var $J1 = (3 * $e1 / 2 - 27 * pow($e1, 3) / 32.0);
	var $J2 = (21 * pow($e1, 2) / 16 - 55 * pow($e1, 4) / 32.0);
	var $J3 = (151 * pow($e1, 3) / 96.0);
	var $J4 = (1097 * pow($e1, 4) / 512.0);

	var $fp = $mu + $J1 * sin(2 * $mu) + $J2 * sin(4 * $mu) + $J3 * sin(6 * $mu) + $J4 * sin(8 * $mu);

	var $e2 = pow(($e * $a / $b), 2);
	var $C1 = pow($e2 * cos($fp), 2);
	var $T1 = pow(tan($fp), 2);
	var $R1 = $a * (1 - pow($e, 2)) / pow((1 - pow($e, 2) * pow(sin($fp), 2)), (3.0 / 2.0));
	var $N1 = $a / pow((1 - pow($e, 2) * pow(sin($fp), 2)), 0.5);

	var $D = $x / ($N1 * $k0);

	var $Q1 = $N1 * tan($fp) / $R1;
	var $Q2 = (pow($D, 2) / 2.0);
	var $Q3 = (5 + 3 * $T1 + 10 * $C1 - 4 * pow($C1, 2) - 9 * $e2) * pow($D, 4) / 24.0;
	var $Q4 = (61 + 90 * $T1 + 298 * $C1 + 45 * pow($T1, 2) - 3 * pow($C1, 2) - 252 * $e2) * pow($D, 6) / 720.0;
	var $lat = $fp - $Q1 * ($Q2 - $Q3 + $Q4);

	var $Q5 = $D;
	var $Q6 = (1 + 2 * $T1 + $C1) * pow($D, 3) / 6;
	var $Q7 = (5 - 2 * $C1 + 28 * $T1 - 3 * pow($C1, 2) + 8 * $e2 + 24 * pow($T1, 2)) * pow($D, 5) / 120.0;
	var $lng = $lng0 + ($Q5 - $Q6 + $Q7) / cos($fp);

	$lat = ($lat * 180) / M_PI;
	$lng = ($lng * 180) / M_PI;

	return {
		lat: $lat,
		lng: $lng
	};
}