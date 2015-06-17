var clock = $('.your-clock').FlipClock({
  countdown: true,
  defaultLanguage: 'tr',
  language: 'tr',
});

jQuery( document ).ready(function( $ ) {
  console.log('  _[]    __   _                         _                    ');
  console.log(' |_ _|  / _| | |_    __ _   _ __       / \     _ __    _ __  ');
  console.log('  | |  | |_  | __|  / _` | |  __|     / _ \   |  _ \  |  _ \ ');
  console.log('  | |  |  _| | |_  | (_| | | |       / ___ \  | |_) | | |_) |');
  console.log(' |___| |_|    \__|  \__,_| |_|      /_/   \_\ | .__/  | .__/ ');
  console.log('                                              |_|     |_|    ');
  var currentUrl = window.location.href;
  var hicriTarih = getHicriDate();

  // If it's home page.
  if(currentUrl.indexOf('/iftar/') == -1 &&
     currentUrl.indexOf('/iftar.html') == -1 &&
     currentUrl.indexOf('/ulkeler.html') == -1 &&
     currentUrl.indexOf('/bilgi/') == -1) {
    $('.subtitle')[0].innerHTML = 'Bulunduğun yer tespit ediliyor, bitmek üzere...';
    $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);
    setHicriTarih(hicriTarih);
    showTodayBelirliGun();
    getLocation();
  } else {
    // If it's not home page but location is coming from GET.
    console.log('not getting the location because url is ' + currentUrl);
    var params = getJsonFromUrl(currentUrl);
    console.log('get url parameters: ' + JSON.stringify(params));
    if (params && params['ulke'] && params['sehir']) {
      $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);
      setIftarTitle(params['ulke'], params['sehir']);
      getIftarTimeP(params['ulke'], params['sehir']);
      setHicriTarih(hicriTarih);
    } else {
      console.log('Wrong url params');
    }
  }

  // If I can show ramazan days left, I show.
  if ($('#span-ramazan-days-left')) {
    var ramazanDaysLeft = parseInt(
        (new Date(RAMAZAN_DATE_) - new Date()) / 1000 / 3600 / 24);
    $('#span-ramazan-days-left')[0].innerHTML = ramazanDaysLeft;
  }

  // If it's bilgi page.
  if (currentUrl.indexOf('/bilgi/') != -1) {
    console.log('Bilgi page');
    showTodayBelirliGun();
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
var RAMAZAN_DATE_ = '2015-06-18';
var reverseGeoYql = 'select * from geo.placefinder where text="{lat},{lon}" and gflags="R"';
var reverseGeoYqlUrl = 'https://query.yahooapis.com/v1/public/yql?q='
                       + '{reverseGeoYql}'
                       + '&format=json&diagnostics=false&callback=';
var firebaseUrl = 'https://blistering-fire-9964.firebaseio.com/prayer_times/{date}/{country}/cities/{city}/prayer_time.json';
var belirliGunler = {
    "2015-1-2": {
      "content": "Mevlid Kandili"
    },
    "2015-4-20": {
      "content": "Üç Aylar'ın Başlangıcı"
    },
    "2015-4-23": {
      "content": "Regaib Kandili"
    },
    "2015-5-15": {
      "content": "Mirac Kandili"
    },
    "2015-6-1": {
      "content": "Berat Kandili"
    },
    "2015-6-18": {
      "content": "Ramazan'ın Başlangıcı"
    },
    "2015-7-13": {
      "content": "Kadir Gecesi"
    },
    "2015-7-16": {
      "content": "Arefe (Ramazan)"
    },
    "2015-7-17": {
      "content": "Ramazan Bayramı"
    },
    "2015-9-23": {
      "content": "Arefe (Kurban)"
    },
    "2015-9-24": {
      "content": "Kurban Bayramı"
    },
    "2015-10-14": {
      "content": "Hicri Yılbaşı"
    },
    "2015-10-23": {
      "content": "Aşure Günü"
    }
};

var hicriAyDefinition = {
    "Muharrem": "Haram kılınmış.  Haram ayların ilkidir.",
    "Safer": "Sefer, yolculuk. Gıda için `sefere` gidilen aydır.",
    "Rebiülevvel": "İlk bahar.",
    "Rebiülahir": "Son bahar.",
    "Cemaziyelevvel": "İlk çorak toprak.",
    "Cemaziyelahir": "Son çorak toprak.",
    "Recep": "Saygı, onur. Haram ayların ikincisidir.",
    "Şaban": "Dağılmış, yayılmış.  Su bulmak için 'dağılınan' aydır.",
    "Ramazan": "Yanma, sıcak olma. Kuran'a göre oruç ayıdır.",
    "Şevval": "Yükselmiş.",
    "Zilkade": "Barışa sahiplik eden. Üçüncü haram aydır.",
    "Zilhicce": "Hacca sahiplik eden.  Hac ayıdır. Son haram aydır."
}


function getTodayBelirliGun() {
  var d = new Date();
  var dateStr = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  if (belirliGunler[dateStr]) {
    return belirliGunler[dateStr]['content'];
  } else {
    return null;
  }
}

function showTodayBelirliGun() {
  var belirliGun = getTodayBelirliGun();
  if (belirliGun) {
    $('#p-belirli-gun')[0].innerHTML = 'Bugün: ' + belirliGun;
  } else {
    $('#p-belirli-gun')[0].innerHTML = '';
  }
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
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
  console.log("Latitude: " + lat + " | " + "Longitude: " + lon);
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
    if (cityNamesMapping[city]) {
      city = cityNamesMapping[city];
    }
    console.log('Turkish country: ' + trCountry);
    console.log('Turkish city: ' + city);
    //getIftarTime(trCountry, city);
    setIftarTitle(trCountry, city);
    getIftarTimeP(trCountry, city);
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

    console.log('Setting timer now...');
    setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes, city, country);
    setNamazVakitleri(imsak, gunes, ogle, ikindi, aksam, yatsi);
  };
  xhr.send();   
}

function getIftarTimeP(country, city) {
  var d = new Date();
  var currentMonth = (
      d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1));
  var currentDay = d.getDate() >= 10 ? d.getDate() : '0' + (d.getDate());
  var dateStr = (d.getFullYear().toString().slice(2) + "-" + currentMonth + "-"
                 + currentDay);
  console.log('Getting iftar time for ' + country + ' city: ' + city + ' date: ' + dateStr);
  var xhr = new XMLHttpRequest();

  var url = ('https://api.parse.com/1/classes/prayer_times'
             + '?where={"date":"' + dateStr + '","country":"'
             + country + '' + '","city":"' + city + '"}&limit=3');
             // + '","state":"' + city.capitalize() + '"}&limit=3');
  console.log(url);
  xhr.open("GET", url, true);
  xhr.setRequestHeader(
      "X-Parse-Application-Id", "7TDd2oVVnLZNSGS9swhFIPCEf0P49fi1IKPp7svx");
  xhr.setRequestHeader(
      "X-Parse-REST-API-Key", "jnEGjyKpSk3PqHFWxN4T5ejVe7WHY6aK27O3zNOr");
  xhr.onload = function() {
    console.log(xhr.responseText);
    if (xhr.responseText && xhr.responseText.indexOf('aksam') > -1) {
      var response = JSON.parse(xhr.responseText);
      doStuffWithNamazVakitleri(response, city, country);
    } else {
      console.log("Bir hata oluştu.");
      console.log("Fallback");
      var xhrFallback = new XMLHttpRequest();

      var url = ('https://api.parse.com/1/classes/prayer_times'
                 + '?where={"date":"' + dateStr + '","country":"'
                 + country + '' + '","state":"' + city + '"}&limit=3');
      
      console.log(url);
      xhrFallback.open("GET", url, true);
      xhrFallback.setRequestHeader(
          "X-Parse-Application-Id", "7TDd2oVVnLZNSGS9swhFIPCEf0P49fi1IKPp7svx");
      xhrFallback.setRequestHeader(
          "X-Parse-REST-API-Key", "jnEGjyKpSk3PqHFWxN4T5ejVe7WHY6aK27O3zNOr");

      xhrFallback.onload = function() {
        console.log(xhrFallback.responseText);
        if (xhrFallback.responseText && xhrFallback.responseText.indexOf('aksam') > -1) {
          var response = JSON.parse(xhrFallback.responseText);
          doStuffWithNamazVakitleri(response, city, country);
        } else {
          console.log("Bir hata oluştu - son");
        }
      }
      xhrFallback.send();
    } // End of fallback mechanism
  };
  xhr.send();
}

function doStuffWithNamazVakitleri(response, city, country) {
  response = response['results'][0];
  var iftarHours = parseInt(response.aksam.split(':')[0]);
  var iftarMinutes = parseInt(response.aksam.split(':')[1]);

  var sahurHours = parseInt(response.imsak.split(':')[0]);
  var sahurMinutes = parseInt(response.imsak.split(':')[1]);

  var imsak = response.imsak;
  var gunes = response.gunes;
  var ogle = response.ogle;
  var ikindi = response.ikindi;
  var aksam = response.aksam
  var yatsi = response.yatsi;

  //console.log('Setting timer now...');
  setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes, city, country);
  setNamazVakitleri(imsak, gunes, ogle, ikindi, aksam, yatsi);
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

function setIftarTitle(country, city) {
  document.title = (
      country + ' / ' + city + ' için iftar ve namaz vakitleri, '
      + 'ramazana ne kadar kaldı?, Ankara, İstanbul, İzmir, Bursa, Bakü '
      + 'iftar 2015, ramazan, uluslararası namaz ve iftar zamanları.');
}

function setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes, city,
                  country) {
  console.log("iftar hour: " + iftarHours + " | minute: " + iftarMinutes);
  console.log("sahur hour: " + sahurHours + " | minute: " + sahurMinutes);
  
  sahurHours = parseInt(sahurHours);
  sahurMinutes = parseInt(sahurMinutes);
  
  var currentdate = new Date();

  var currentDay = currentdate.getDate();
  var currentMonth = currentdate.getMonth();
  var currentYear = currentdate.getYear();

  var currentHours = currentdate.getHours();
  var currentMinutes = currentdate.getMinutes();

  console.log("current hour: " + currentHours + " | minute: " + currentMinutes);

  var iftarRemainingMs = (
      new Date(new Date).setHours(iftarHours, iftarMinutes, 0) - new Date());
  var sahurRemainingMs = (
      new Date(new Date).setHours(sahurHours + 24, sahurMinutes, 0) - new Date());

  if (currentHours < sahurHours) {
    sahurRemainingMs = (
        new Date(new Date).setHours(sahurHours, sahurMinutes, 0) - new Date());    
  }

  console.log("remaining iftar ms: " + iftarRemainingMs);
  console.log("remaining sahur ms: " + sahurRemainingMs);

  if (iftarRemainingMs > 0 && currentHours > sahurHours) {
    clock.setTime(iftarRemainingMs / 1000);
    $('#description').text($('#description').text().replace('sahur', 'iftar'));
    $('#tagline').text($('#tagline').text().replace('sahur', 'iftar'));
    $('.subtitle')[0].innerHTML = (
        city + ' (' + country +
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