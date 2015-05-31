var clock = $('.your-clock').FlipClock({
  countdown: true,
  defaultLanguage: 'turkish'
});

jQuery( document ).ready(function( $ ) {
  console.log('   ____                     __              __    __     ');
  console.log('  / __ \_______  _______   / /_  __  ______/ /___/ /_  __');
  console.log(' / / / / ___/ / / / ___/  / __ \/ / / / __  / __  / / / /');
  console.log('/ /_/ / /  / /_/ / /__   / /_/ / /_/ / /_/ / /_/ / /_/ / ');
  console.log('\____/_/   \__,_/\___/  /_.___/\__,_/\__,_/\__,_/\__, /  ');
  console.log('                 /_)                            /____/   ');
  var currentUrl = window.location.href;
  if(currentUrl.indexOf('/iftar/') == -1 &&
     currentUrl.indexOf('/iftar.html') == -1 &&
     currentUrl.indexOf('/ulkeler.html') == -1 &&
     currentUrl.indexOf('/bilgi/') == -1) {
    $('.subtitle')[0].innerHTML = 'Bulunduğun yer tespit ediliyor, bitmek üzere...';
    getLocation();
    $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);
  } else {
    console.log('not getting the location because url is ' + currentUrl);
    console.log('get url parameters: ' + JSON.stringify(getJsonFromUrl(currentUrl)));
    var params = getJsonFromUrl(currentUrl);
    if (params && params['ulke'] && params['sehir']) {
      getIftarTime(params['ulke'], params['sehir']);
      $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);
    } else {
      console.log('Wrong url params');
    }
  }

  if ($('#span-ramazan-days-left')) {
    var ramazanDaysLeft = parseInt(
        (new Date(RAMAZAN_DATE_) - new Date()) / 1000 / 3600 / 24);
    $('#span-ramazan-days-left')[0].innerHTML = ramazanDaysLeft;
  }

  if (currentUrl.indexOf('/bilgi/') != -1) {
    console.log('Bilgi page');    
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

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
}

function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
var RAMAZAN_DATE_ = '2015-06-15';
var reverseGeoYql = 'select * from geo.placefinder where text="{lat},{lon}" and gflags="R"';
var reverseGeoYqlUrl = 'https://query.yahooapis.com/v1/public/yql?q='
                       + '{reverseGeoYql}'
                       + '&format=json&diagnostics=false&callback=';
var firebaseUrl = 'https://blistering-fire-9964.firebaseio.com/prayer_times/{date}/{country}/cities/{city}/prayer_time.json';

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    console.log("xhr with credentials is created.");
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {
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
        $('.subtitle')[0].innerHTML = 'Bulunduğun yeri tespit edemedik :(';
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

    var imsak = response.Imsak;
    var gunes = response.Gunes;
    var ogle = response.Ogle;
    var ikindi = response.Ikindi;
    var aksam = response.Aksam
    var yatsi = response.Yatsi;

    var hicriTarih = response.HicriTarih;

    console.log('Setting timer now...');
    setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes, city, country);
    setNamazVakitleri(imsak, gunes, ogle, ikindi, aksam, yatsi);
    setHicriTarih(hicriTarih);
  };
  xhr.send();   
}

function setNamazVakitleri(imsak, gunes, ogle, ikindi, aksam, yatsi) {
  $('#p-imsak')[0].innerHTML = imsak;
  $('#p-gunes')[0].innerHTML = gunes;
  $('#p-ogle')[0].innerHTML = ogle;
  $('#p-ikindi')[0].innerHTML = ikindi;
  $('#p-aksam')[0].innerHTML = aksam;
  $('#p-yatsi')[0].innerHTML = yatsi;
}

function setHicriTarih(hicriTarih) {
  $('#today-date-hicri')[0].innerHTML = (
      $('#today-date-hicri')[0].innerHTML + hicriTarih);
}

function setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes, city,
                  country) {
  console.log("iftar hour: " + iftarHours + " | minute: " + iftarMinutes);
  console.log("sahur hour: " + sahurHours + " | minute: " + sahurMinutes);
  
  sahurHours = parseInt(sahurHours);
  sahurMinutes = parseInt(sahurMinutes);
  
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
    $('.subtitle')[0].innerHTML = (
        city.capitalize() + ' (' + country.capitalize() +
        ') için iftara kalan süre');
  } else {
    clock.setTime(sahurRemainingMs / 1000);
    $('#description').text($('#description').text().replace('iftar', 'sahur'));
    $('#tagline').text($('#tagline').text().replace('iftar', 'sahur'));
    $('.subtitle')[0].innerHTML = (
        city.capitalize() + ' (' + country.capitalize() +
        ') için sahura kalan süre');
  }

  clock.start();
}