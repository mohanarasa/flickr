function initialize(searchLat, searchLon) {
  var mapOptions = {
    center: new google.maps.LatLng(searchLat, searchLon),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  var marker = new google.maps.Marker();
  google.maps.event.addListener(marker, "mouseover", function(event) {
    // to get the geographical position:
    var pos = marker.getPosition();
    var lat = pos.lat();
    var lng = pos.lng();
    console.log('you are at ', lat, ' and ', lng);
  });
  return map;
}

function getFlickrPhotos(map, searchLat, searchLon) {

  var FLICKR_API_KEY = '40c7bbee397489819102220a79091248';
//https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=2c2fe03cc43d41864febfadedd03d4ec&tags=cat&format=json&nojsoncallback=1&auth_token=72157676246246226-d3f121527800875d&api_sig=ee4f657aba3e2aa9752afb78b55b9edb
  var searchUrl = "https://api.flickr.com/services/feeds/photos_public.gne";

  var searchReqParams = {
    'api_key': FLICKR_API_KEY,
    'tags': 'monument,statue,historical',
    'has_geo': true,
    'lat': searchLat,
    'lon': searchLon,
    //'place_id': place.place_id,
    'accuracy': 11,
    'format': 'json',
    'safe_search': 1,
    'privacy_filter': 1,
    'per_page': 10
  }

  $.ajax({
    type: 'GET',
    url : searchUrl,
    dataType:'jsonp',
    jsonp : 'jsoncallback',
    data: searchReqParams
  }).done(function(data){
    $('#lat').val('');
    $('#lon').val('');

    if (data.items.length > 0) {
      getAndMarkPhotos(data.items);
      $('#warning').hide();
    } else {
      console.log(data.items);
      $('#warning').show();
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown) {

    console.log(jqXHR);
    console.log('textStatus: ', textStatus, ' code: ', jqXHR.status);
  });
}

  function getAndMarkPhotos(photos) {
    //console.log(photos)
    var numPhotos = photos.length;
    for(var i=0; i<numPhotos; i++) {
      var photo = photos[i];
      console.log(photo)
      $('#photo').append("<img src="+photo.media.m+">");
      //getPhotoLocation(photo.id);
    }
  }

  function getPhotoLocation(photoId) {
    var photoLocUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&";

    var photoParams = {
      'api_key': FLICKR_API_KEY,
      'photo_id': photoId
    }

    $.ajax({
      type: 'GET',
      url : photoLocUrl,
      async: false,
      cache : true,
      crossDomain : true,
      dataType: 'xml',
      data: photoParams
    })
    .done(function(){
      console.log(data);
      var location = $(data).find('location')[0];
      var photoLat = $(location).attr('latitude');
      var photoLon = $(location).attr('longitude');
      addOverlay(photoLat, photoLon, 'Flick Photo '+photoId, map);

    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log('req failed ', jqXHR);
      console.log('textStatus: ', textStatus, ' code: ', jqXHR.status);
    });

  }

  function addOverlay(lat, lon, text, map) {
    var myLatlng = new google.maps.LatLng(lat,lon);

    var marker = new google.maps.Marker({
      position: myLatlng,
      title:text
    });

    marker.setMap(map);
    //map.setCenter(myLatLng);
  }

$(document).ready(function() {
  $('#warning').hide();
  $('#search').on('click', function() {
    $('#images').empty();
    var searchLat = $('#lat').val();
    var searchLon = $('#lon').val();
    var googleMap = initialize(searchLat, searchLon);
    getFlickrPhotos(googleMap, searchLat, searchLon);
  });

  $('#search').trigger('click');

});
