if (Meteor.isClient) {
	Meteor.startup(function () {
		GoogleMaps.load({v: '3', key: 'AIzaSyBWDrJ1Xx8weNZ2QtgptSpb09wveVLMySI' });
	});

	Template.map.helpers({
		mapOptions: function () {
			if (GoogleMaps.loaded()) {
				return {
					center: new google.maps.LatLng(35.673343, 139.710388),
					zoom: 9
				}
			}
		}
	});

	Template.map.onCreated(function() {
		//The `ready` callback to interact with the map API once the map is ready.
		GoogleMaps.ready('map', function(map) {

			var lat, lng, radius;
			google.maps.event.addListener(map.instance, 'center_changed', function (e) {
				//console.log(map.instance.getCenter());
				//console.log(map.instance.getZoom());
				placeLatLng(map.instance.getCenter());
			});

			google.maps.event.addListener(map.instance, 'zoom_changed', function (e) {
				var zoomLevel = map.instance.getZoom();
				console.log(zoomLevel);
				radius = Math.pow(2, (8 - zoomLevel)) * 276890;
				console.log(radius);
			});

			$('form').on('submit', function (e) {
				query = $('#search').val();
				console.log('enter pressed');
				console.log(query);

				var url = ("https://api.foursquare.com/v2/venues/search?ll=" + lat + ', ' + lng +
					"&client_id=LCSTXUE4XPRG4JQJEDSCXAE0JSHOFN0A4GGEPNCURBI0CG4U" +
					"&client_secret=XF1YNPHMTAPL0JIJDJKA25YEHCXDUTVKF2O4V441FBBIIXML" +
					"&v=20150515&radius=" + radius +
					"&query=" + query);
				$.ajax( url )
					.done(function (data) {
						for(var i = 0; i < data.response.venues.length; i++) {
							newMarker(data.response.venues[i].location.lat, data.response.venues[i].location.lng);
							console.log(i + 1 + ') ' + data.response.venues[i].name);
							console.log(data.response.venues[i].location.distance);
						}
					})
					.fail(function(error) {
						console.log(error);
					})
					.always(function() {
						console.log( "complete" );
					});

				return false;
			});

			function placeLatLng(location) {
				lat = location.lat();
				lng = location.lng();
				console.log(lat + ', ' + lng);
				//coordinates = new google.maps.LatLng(location.lat(), location.lng()).toString();
				//console.log(center);
			}
			//Add a markers to the map
			function newMarker(lat, lng) {
				var marker = new google.maps.Marker({
					position: {lat: lat, lng: lng} ,
					map: map.instance
				});
			}
		});
	});
}

if(Meteor.isServer) {
	WebApp.connectHandlers.use(function(req, res, next) {
		res.setHeader("Access-Control-Allow-Origin", "*");
		return next();
	});
}