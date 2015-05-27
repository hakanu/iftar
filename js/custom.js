var clock = $('.your-clock').FlipClock({
  // ... your options here
  countdown: true
});

jQuery( document ).ready(function( $ ) {
  console.log('   ____                     __              __    __     ');
  console.log('  / __ \_______  _______   / /_  __  ______/ /___/ /_  __');
  console.log(' / / / / ___/ / / / ___/  / __ \/ / / / __  / __  / / / /');
  console.log('/ /_/ / /  / /_/ / /__   / /_/ / /_/ / /_/ / /_/ / /_/ / ');
  console.log('\____/_/   \__,_/\___/  /_.___/\__,_/\__,_/\__,_/\__, /  ');
  console.log('                 /_)                            /____/   ');
  if(window.location.href.indexOf('/iftar/') == -1) {
    getLocation();
  }
});

String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

var reverseGeoYql = 'select * from geo.placefinder where text="{lat},{lon}" and gflags="R"';
var reverseGeoYqlUrl = 'https://query.yahooapis.com/v1/public/yql?q='
                       + '{reverseGeoYql}'
                       + '&format=json&diagnostics=false&callback=';
var firebaseUrl = 'https://blistering-fire-9964.firebaseio.com/prayer_times/{date}/{country}/cities/{city}/prayer_time.json';

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    console.log("xhr with credentials is created.");
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  console.log("Latitude: " + lat + " | " +
              "Longitude: " + lon);
  var xhr = new XMLHttpRequest();
  reverseGeoYqlUrl = reverseGeoYqlUrl.supplant(
      {'reverseGeoYql': reverseGeoYql.supplant({'lat': lat, 'lon': lon})});
  xhr.open("GET", reverseGeoYqlUrl, true);
  xhr.onload = function() {
    console.log(xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    var city = response.query.results.Result.city;
    var country = response.query.results.Result.country;
    console.log('city: ' + city);
    console.log('country: ' + country);
    var trCountry = countryNamesMapping[country.toUpperCase()];
    console.log('Turkish country: ' + trCountry);
    getIftarTime(trCountry, city);
  };
  xhr.send();
}

function getIftarTime(country, city) {
  console.log('Getting iftar time for ' + country + ' city: ' + city);
  var xhr = new XMLHttpRequest();
  // Example url change it with country city representation.
  var iftarUrl = firebaseUrl.supplant({'date': '150528', 'country': country.toUpperCase(), 'city': city.toUpperCase()});
  //var iftarUrl = 'https://blistering-fire-9964.firebaseio.com/prayer_times/T%C3%9CRK%C4%B0YE/cities/0/prayer_time.json';
  xhr.open("GET", iftarUrl, true);
  xhr.onload = function() {
    console.log(xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    var iftarHours = response.Aksam.split(':')[0];
    var iftarMinutes = response.Aksam.split(':')[1];

    var sahurHours = response.Imsak.split(':')[0];
    var sahurMinutes = response.Imsak.split(':')[1];

    console.log('Setting timer now...');
    setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes);
  };
  xhr.send();   
}

function setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes) {
  console.log("iftar hour: " + iftarHours + " | minute: " + iftarMinutes);
  console.log("sahur hour: " + sahurHours + " | minute: " + sahurMinutes);

  var currentdate = new Date();

  var currentDay = currentdate.getDay();
  var currentMonth = currentdate.getMonth();
  var currentYear = currentdate.getYear();

  var currentHours = currentdate.getHours();
  var currentMinutes = currentdate.getMinutes();

  console.log("current hour: " + currentHours + " | minute: " + currentMinutes);

  var iftarRemainingMs = (
      new Date(new Date).setHours(iftarHours, iftarMinutes, 0) - new Date());
  var sahurRemainingMs = (
      new Date(new Date).setHours(sahurHours + 24, sahurMinutes, 0) - new Date());

  console.log("remaining iftar ms: " + iftarRemainingMs);
  console.log("remaining sahur ms: " + sahurRemainingMs);

  if (iftarRemainingMs > 0) {
    clock.setTime(iftarRemainingMs / 1000);
    $('#description').text($('#description').text().replace('sahur', 'iftar'));
    $('#tagline').text($('#tagline').text().replace('sahur', 'iftar'));
  } else {
    clock.setTime(sahurRemainingMs / 1000);
    $('#description').text($('#description').text().replace('iftar', 'sahur'));
    $('#tagline').text($('#tagline').text().replace('iftar', 'sahur'));
  }

  clock.start();
}