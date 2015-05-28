Meteor.startup(function () {
	GoogleMaps.load({v: '3'});
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

Template.map.created = function() {
	//The `ready` callback to interact with the map API once the map is ready.
	GoogleMaps.ready('map', function(map) {
		var lat, lng, radius, centralMarker, venues = [], markersArray = [];
        //changing center coordinates when drag or pan and zoom map
		google.maps.event.addListener(map.instance, 'center_changed', function (e) {
			if(centralMarker != null) { centralMarker.setMap(null); }
			venueLatLng(map.instance.getCenter());
			centerMarker();
		});
        //changing radius in km when zoom change
		google.maps.event.addListener(map.instance, 'zoom_changed', function (e) {
			var zoomLevel = map.instance.getZoom();
			radius = Math.pow(2, (8 - zoomLevel)) * 276890;
		});
        //create CSV file and download it to client's computer when button clicked
		$('#exportCSV').on('click', function (e) {
            if(venues.length === 0) {
                alert('No data to export');
                return false;
            }
			var csv = '';
			for(var i = 0; i < venues.length; i++) {
				csv += venues[i].join(',') + '\n';
			}
			$("#dataLink").attr("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))[0].click();
		});

		$('form').on('submit', function (e) {
			var query = $('#search').val();
			var url = "https://api.foursquare.com/v2/venues/search?ll=" + lat + ', ' + lng +
			"&client_id=LCSTXUE4XPRG4JQJEDSCXAE0JSHOFN0A4GGEPNCURBI0CG4U" +
			"&client_secret=XF1YNPHMTAPL0JIJDJKA25YEHCXDUTVKF2O4V441FBBIIXML" +
			"&v=20150515&radius=" + radius +
			"&locale=en" + "&query=" + query;
			$.ajax( url )
				.done(function (data) {
					clearMarker();
					$('#venues').empty();
					$('.count').empty();

					var _radius= parseFloat((radius / 1000).toFixed(3));
					var date = new Date().toLocaleString();

					var venuesCount = data.response.venues.length;
					$('.count').append(venuesCount);
                    //insert queries to database for each user
					var user = Meteor.user();
                    Queries.insert({ userId: user._id, query: query, lat: lat, lng: lng, radius: _radius + 'km', date: date });

					for(var i = 0; i < venuesCount; i++) {
                        //creates markers of each venues, by using latLng coordinates from foursquare api
						venuesMarker(data.response.venues[i].location.lat, data.response.venues[i].location.lng);
                        //get data from foursquare api
						var name = data.response.venues[i].name;
						var city = data.response.venues[i].location.city || '';
						var address = data.response.venues[i].location.address || '';
						var latitude = data.response.venues[i].location.lat;
						var longitude = data.response.venues[i].location.lng;
                        //add data to array, that uses for export CSV
						venues.push([name, city, address, latitude, longitude]);
                        //add data to table
						$('#venues').append('<tr>' +
											'<td class="venue-name">' + name + '</td>' +
											'<td class="venue-city">' + city + '</td>' +
											'<td class="venue-address">' + address+ '</td>' +
											'<td class="venue-lat">' + latitude + '</td>' +
											'<td class="venue-lng">' + longitude + '</td>' +
											'</tr>');
					}
				})
				.fail(function(error) {
					alert(error);
				});
			return false;
		});
		//function, that stores latitude and longitude coordinates
		function venueLatLng(location) {
			lat = location.lat();
			lng = location.lng();
		}
		//Add a marker for each venue to the map
		function venuesMarker(lat, lng) {
			var venueMarker = new google.maps.Marker({
				position: {lat: lat, lng: lng} ,
				map: map.instance
			});
            markersArray.push(venueMarker);
		}
        //delete venue's marker from map
		function clearMarker() {
			for(var i = 0, marker; marker = markersArray[i]; i++) {
				marker.setMap(null);
			}
            markersArray = [];
		}
		//Add a marker which serves as a center coordinates on the map
		function centerMarker() {
			var image = {
				url:  'http://maps.google.com/mapfiles/kml/shapes/man.png',
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(30, 30)
			};
			centralMarker = new google.maps.Marker({
				position: map.instance.getCenter(),
				map: map.instance,
				icon: image
			});
		}
	});
};