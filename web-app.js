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

              $('form').on('submit', function (e) {
                  query = $('#search').val();
                  console.log('enter pressed');
                  console.log(query);

                  var url = ("https://api.foursquare.com/v2/venues/search?ll=35.673343,139.710388" +
                      "&client_id=LCSTXUE4XPRG4JQJEDSCXAE0JSHOFN0A4GGEPNCURBI0CG4U" +
                      "&client_secret=XF1YNPHMTAPL0JIJDJKA25YEHCXDUTVKF2O4V441FBBIIXML" +
                      "&v=20150515&query=" + query);
                  $.ajax( url )
                      .done(function (data) {
                          for(var i = 0; i < data.response.venues.length; i++) {
                              newMarker(data.response.venues[i].location.lat, data.response.venues[i].location.lng);
                              //console.log(i + 1 + ') ' + data.response.venues[i].name);
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

              //Add a markers to the map
              function newMarker(lat, lng) {
                  var marker = new google.maps.Marker({
                      position: {lat: lat, lng: lng} ,
                      map: map.instance
                  });
              }
          });
    });

    //console.log(i + 1 + ') ' + data.response.venues[i].name);
    //console.log('lat: ' + data.response.venues[i].location.lat + ', ' + ' lng: ' + data.response.venues[i].location.lng);
    //console.log('\n');

}

if(Meteor.isServer) {
    WebApp.connectHandlers.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
}