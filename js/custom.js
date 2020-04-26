// var console = {};
// console.log = function(){};

var clock = $('.your-clock').FlipClock({
  countdown: true,
  defaultLanguage: 'tr',
  language: 'tr',
});
var _DEFAULT_COUNTRY = 'TÜRKİYE';
var _DEFAULT_CITY = 'İSTANBUL';
var _PROXY_SERVER_URL = 'https://warm-citadel-93183.herokuapp.com/proxy/{url}';

var _OPEN_WEATHER_API_KEY = 'd0985731af499fa7eab5fa9e2238550e';
var _OPEN_WEATHER_API_LAT_LON_URL = 'http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&lang=tr&units=metric';
var _OPEN_WEATHER_API_CITY_URL = 'http://api.openweathermap.org/data/2.5/forecast?q={city},{country_code}&mode=json&appid={api_key}&lang=tr&units=metric';
var _OPEN_WEATHER_API_CITY_ONLY_URL = 'http://api.openweathermap.org/data/2.5/forecast?q={city}&mode=json&appid={api_key}&lang=tr&units=metric';
var _OPEN_WEATHER_ICON_URL = 'http://openweathermap.org/img/w/{icon_code}.png';

var _DARK_SKY_API_KEY = 'a03645f9fff26b6189d43c83992211df';
var _DARK_SKY_API_LAT_LON_URL = 'https://api.darksky.net/forecast/a03645f9fff26b6189d43c83992211df/{lat},{lon}?lang=tr&units=si';
var _WEATHER_ICON_URL = '/img/ow/{icon_code}';

var _FB_ROOT_URL = 'https://prayer-times-3d4fb.firebaseio.com/'
var _RAMAZAN_DATES = {
    '2017': {
        'start': '2017-05-27',
        'end': '2017-06-25'
    },
    '2018': {
        'start': '2018-05-16',
        'end': '2018-06-14'
    },
    '2019': {
        'start': '2019-05-06',
        'end': '2019-06-04'
    },
    '2020': {
        'start': '2020-04-24',
        'end': '2020-05-23'
    },
    '2021': {
        'start': '2021-04-13',
        'end': '2021-05-12'
    }
};


jQuery( document ).ready(function( $ ) {
  console.log('  _[]    __   _                         _                    ');
  console.log(' |_ _|  / _| | |_    __ _   _ __       / \     _ __    _ __  ');
  console.log('  | |  | |_  | __|  / _` | |  __|     / _ \   |  _ \  |  _ \ ');
  console.log('  | |  |  _| | |_  | (_| | | |       / ___ \  | |_) | | |_) |');
  console.log(' |___| |_|    \__|  \__,_| |_|      /_/   \_\ | .__/  | .__/ ');
  console.log('                                              |_|     |_|    ');
  var currentUrl = window.location.href;
  var hicriTarih = getHicriDate();

  // console.log(city_names_to_diyanet_ids);

  // Auto complete stuff.
  $( "#location-ids" ).autocomplete({
    source: function(request, response) {
        var filteredArray = $.map(Object.keys(city_names_to_diyanet_ids), function(item) {
            if( item.startsWith(request.term.toUpperCase())){
                return item;
            }
            else{
                return null;
            }
        });
        response(filteredArray);
    },
    select: function(event, ui) {
        if(ui.item){
          console.log('Selected location: ', ui.item.value);
          var id = city_names_to_diyanet_ids[ui.item.value];
          // createCookie('locationId', id, 6000);
          // createCookie('locationName', ui.item.value, 6000);
          localStorage.setItem('locationId', id);
          localStorage.setItem('locationName', ui.item.value);

          location.reload();
        }
    }
  });

  // If it's home page.
  if(currentUrl.indexOf('/iftar/') == -1 &&
     currentUrl.indexOf('/iftar.html') == -1 &&
     currentUrl.indexOf('/ulkeler.html') == -1 &&
     currentUrl.indexOf('/bilgi/') == -1 &&
     GLOBAL_COUNTRY == null && GLOBAL_CITY == null) {
    $('.subtitle')[0].innerHTML = 'Bulunduğun yer tespit ediliyor, bitmek üzere...';
    $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);

    // Check if location had been chosen before.
    var locationId = localStorage.getItem('locationId') || readCookie('locationId');
    var locationName = localStorage.getItem('locationName') || readCookie('locationName');
    console.log('Location from cookies: ', locationId, locationName);
//    window.location.href = locationName.split('/').reverse().join('/').trim() + '/';

    setHicriTarih(hicriTarih);
    showTodayBelirliGun();

    if (locationId && locationName) {
      getIftarTimeFromId(locationId, locationName);
      getWeatherByCityOW(null, locationName);
    } else {
      getLocation();
    }
  } else {
    // If it's not home page but location is coming from GET.
    console.log('not getting the location because url is ' + currentUrl);
    var params = getJsonFromUrl(currentUrl);
    console.log('get url parameters: ' + JSON.stringify(params));
    if (params && params['ulke'] && params['sehir']) {
      $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);
      setIftarTitle(params['ulke'], params['sehir'], params['state']);
      setWeatherTitle(params['ulke'], params['sehir'])
      setHicriTarih(hicriTarih);
      // window.location.href = (
      //     '/' + params['ulke'] + '/' + params['sehir'] + '/' + params['state'])
      var city = params['sehir'];
      var country = params['ulke'];
      var state = params['state'];
      getIftarTimeP(country, city, state);
      getWeatherByCityOW(country, city);
    } else if (GLOBAL_COUNTRY != null && GLOBAL_CITY != null) {
      console.log('GLOBALS: ', GLOBAL_COUNTRY, GLOBAL_CITY, GLOBAL_STATE);
      $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);
      setIftarTitle(GLOBAL_COUNTRY, GLOBAL_CITY, GLOBAL_STATE);
      setWeatherTitle(GLOBAL_COUNTRY, GLOBAL_CITY)
      setHicriTarih(hicriTarih);
      getIftarTimeP(GLOBAL_COUNTRY, GLOBAL_CITY, GLOBAL_STATE);
      getWeatherByCityOW(GLOBAL_COUNTRY, GLOBAL_CITY);
    } else {
      console.log('Wrong url params');
    }
  }

  var currentYear = (new Date()).getFullYear();
  console.log('Current year: ' + currentYear);

  var currentRamazanItem = _RAMAZAN_DATES[currentYear];
  var ramazanStartDaysLeft = parseInt(
        (new Date(currentRamazanItem.start) - new Date()) / 1000 / 3600 / 24);
  var ramazanEndDaysLeft = parseInt(
        (new Date(currentRamazanItem.end) - new Date()) / 1000 / 3600 / 24);
  console.log('Ramazan end days left: ' + ramazanEndDaysLeft);

  // If I can show ramazan days left, I show.
//  if ($('#span-ramazan-days-left').size() > 0) {
  if (ramazanStartDaysLeft > 0) {
    // If ramazan has already started, it will be minus N.
    ramazanStartDaysLeft = 0;
    $('#span-ramazan-start-end-text').innerHTML = 'başlamasına';
    $('#span-ramazan-days-left').innerHTML = ramazanEndDaysLeft;
  } else if (ramazanStartDaysLeft < -30) {
    // Show next ramazan.
    currentYear++;
    currentRamazanItem = _RAMAZAN_DATES[currentYear];
    var ramazanStartDaysLeft = parseInt(
          (new Date(currentRamazanItem.start) - new Date()) / 1000 / 3600 / 24);
    var ramazanEndDaysLeft = parseInt(
          (new Date(currentRamazanItem.end) - new Date()) / 1000 / 3600 / 24);
    console.log('next Ramazan end days left: ' + ramazanEndDaysLeft);
    $('#span-ramazan-start-end-text').innerHTML = 'başlamasına';
    $('#span-ramazan-days-left').innerHTML = ramazanEndDaysLeft;
  } else {
    // Ramazan started.
    $('#span-ramazan-days-remaining')[0].innerHTML = ramazanEndDaysLeft;
    $('#span-ramazan-start-end-text')[0].innerHTML = 'bitmesine';
  }

  $('#span-ramazan-bitis')[0].innerHTML = currentRamazanItem.end;

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

String.prototype.nonTurkishToUpper = function() {
  var string = this;
  var letters = {
      "i": "I", "ş": "S", "ğ": "G", "ü": "U", "ö": "O", "ç": "C", "ı": "I",
      "İ": "I", "Ş": "S", "Ğ": "G", "Ü": "U", "Ö": "O", "Ç": "C", "I": "I",
      "İ̇": "I" };
  string = string.replace(/(([iışğüçöİ̇İŞĞÜÖÇI]))/g, function(letter){ return letters[letter]; })
  return string.toUpperCase();
}

String.prototype.turkishToUpper = function() {
  var string = this;
  var letters = { "i": "İ", "ş": "Ş", "ğ": "Ğ", "ü": "Ü", "ö": "Ö", "ç": "Ç", "ı": "I" };
  string = string.replace(/(([iışğüçö]))/g, function(letter){ return letters[letter]; })
  return string.toUpperCase();
}

String.prototype.turkishToLower = function() {
  var string = this;
  var letters = { "İ": "i", "I": "ı", "Ş": "ş", "Ğ": "ğ", "Ü": "ü", "Ö": "ö", "Ç": "ç" };
  string = string.replace(/(([İIŞĞÜÇÖ]))/g, function(letter){ return letters[letter]; })
  return string.toLowerCase();
}

String.prototype.diyanetify = function() {
  console.log('Diyanetifying: ', this);
  var trArr = ['TÜRKİYE', 'İBRADI', 'İDİL', 'İHSANGAZİ', 'İHSANİYE', 'İKİZCE', 'İKİZDERE', 'İLİÇ', 'İMAMOĞLU', 'İMRANLI', 'İNCESU', 'İNCİRLİOVA', 'İNEBOLU', 'İNEGÖL', 'İNHİSAR', 'İNÖNÜ', 'İPEK', 'İPSALA', 'İSCEHİSAR', 'İSKENDERUN', 'İSKİLİP', 'İSLAHİYE', 'İSPİR', 'İSTANBUL', 'İSTOK', 'İVRİNDİ', 'İYİDERE', 'İZMİR', 'İZNİK'];
  for (var i = trArr.length - 1; i >= 0; i--) {
    if (trArr[i] == this) {
      console.log('Diyanetified: ', this);
      return this;
    }
  }

  if (this == 'ISTANBUL') {
    return 'İSTANBUL';
  }

  if (this == 'Türkiye' || this == 'TURKIYE' || this == 'türkiye' || this == 'turkiye') {
    return 'TÜRKİYE'
  }
  return this.nonTurkishToUpper();
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

//var reverseGeoYql = 'select * from geo.placefinder where text="{lat},{lon}" and gflags="R"';
var reverseGeoYql = "select * from xml where url = '{url}'";
var reverseGeoYqlUrl = 'https://query.yahooapis.com/v1/public/yql?q='
                       + '{reverseGeoYql}'
                       + '&format=json&diagnostics=false&callback=';
var reverseGeoUrl = 'http://gws2.maps.yahoo.com/findlocation?pf=1&locale=tr_TR&offset=15&flags=&gflags=R&q={lat},{lon}'

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
    },
    "2016-4-07": {
        "content": "REGAİB KANDİLİ"
    },
    "2016-4-08": {
        "content": "ÜÇ AYLARIN BAŞLANGICI"
    },
    "2016-5-03": {
        "content": "MİRAC KANDİLİ"
    },
    "2016-5-21": {
        "content": "BERAT KANDİLİ"
    },
    "2016-6-06": {
        "content": "RAMAZAN'IN BAŞLANGICI"
    },
    "2016-7-01": {
        "content": "KADİR GECESİ"
    },
    "2016-7-04": {
        "content": "AREFE"
    },
    "2016-7-05": {
        "content": "RAMAZAN BAYRAMI (1.Gün)"
    },
    "2016-7-06": {
        "content": "RAMAZAN BAYRAMI (2.Gün)"
    },
    "2016-7-07": {
        "content": "RAMAZAN BAYRAMI (3.Gün)"
    },
    "2016-9-11": {
        "content": "AREFE"
    },
    "2016-9-12": {
        "content": "KURBAN BAYRAMI (1.Gün)"
    },
    "2016-9-13": {
        "content": "KURBAN BAYRAMI (2.Gün)"
    },
    "2016-9-14": {
        "content": "KURBAN BAYRAMI (3.Gün)"
    },
    "2016-10-02": {
        "content": "HİCRİ YILBAŞI"
    },
    "2016-10-11": {
        "content": "AŞURE GÜNÜ"
    },
    "2016-12-1": {
        "content": "MEVLİD KANDİLİ"
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
        $('.subtitle')[0].innerHTML = 'Bulunduğun yeri tespit edemedik, tarayici desteklemiyor :(';
    }
}

function showPosition(position) {
  if (!(position && position.coords && position.coords.latitude && position.coords.longitude)) {
    console.log('Lokasyon bulunamadi');
    $('.subtitle')[0].innerHTML = 'Bulunduğun yeri tespit edemedik, bir hata oluştu :(';
    return;
  }
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  console.log("Latitude: " + lat + " | " + "Longitude: " + lon);

  console.log('Getting address from geocode: ' + lat + ' ' + lon);
  var geocoder = new google.maps.Geocoder;
  var isFound = false;
  geocoder.geocode({'location': {'lat': lat, 'lng': lon}}, function(results, status) {
    if (status === 'OK') {
      console.log('results:')
      console.log(results)
      for (var i = 0; i < results.length; i++) {
        console.log(results[i].types)
        if (results[i].types.indexOf('locality') > -1) {
          console.log('found: ', results[i].formatted_address)
          var city = results[i].formatted_address.split(',')[0].trim().diyanetify();
          var country = results[i].formatted_address.split(',')[1].trim().diyanetify();

          // var city = response.query.results.ResultSet.Result.city.diyanetify();
          // var country = response.query.results.ResultSet.Result.country.diyanetify();
          var state = null;
          console.log('city: ' + city);
          console.log('country: ' + country);
          setIftarTitle(country, city, state);
          setWeatherTitle(country, city);

          // Overwrite the cookie and local storage.
          console.log('Setting the cookies');
          // createCookie('locationId', id, 6000);
          // createCookie('locationName', (state || city), 6000);
          var id = city_names_to_diyanet_ids[(state || city) + ' / ' + country];
          localStorage.setItem('locationId', id); 
          localStorage.setItem('locationName', (state || city));

          isFound = true;

          //getIftarTimeP(country, city, state);
          getIftarTimeFromId(id);
          break;
        }
      }

      if (isFound) {
        console.log('Address found');
      } else {
        console.log('No results found');
        $('.subtitle')[0].innerHTML = 'Adres bulunamadı, İstanbulu gösteriyorum :(';
        country = _DEFAULT_COUNTRY
        city = _DEFAULT_CITY
        state = null
        setIftarTitle(country, city, state);
        setWeatherTitle(country, city);
        getIftarTimeP(country, city, state);
      }
    } else {
      console.log('Geocoder failed due to: ' + status);
    }
  });
  return 1;

  getWeatherByLatLonOW(lat, lon);
}

function getIftarTimeFromId(locationId, locationName) {
  // New id based method.
  console.log('getIftarTimeFromId ID: ' + locationId + ' | ');
  var url = _FB_ROOT_URL + '/new_iftar/' + locationId + '.json';
  console.log('fb url: ' + url);
  fetch(url)
    .then(function(response) { return response.json(); })
    .then(function(json) {
      // console.log('json: ', json);
      doStuffWithNamazVakitleri(json, '', locationName, '');
  });  
}

function getIftarTimeP(country, city, state) {
  console.log('getIftarTimeP: ', country, city, state);
  var d = new Date();
  var currentMonth = (
      d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1));
  var currentDay = d.getDate() >= 10 ? d.getDate() : '0' + (d.getDate());
  var dateStr = (d.getFullYear().toString().slice(2) + "-" + currentMonth + "-"
                 + currentDay);
  country = country.diyanetify();
  city = city.diyanetify();
  if (state) {
    state = state.diyanetify();
  }

  console.log('Getting iftar time for ' + country + ' city: ' + city + ' date: ' + dateStr);
  
  // New id based method.
  var cityWithState = city;
  if (state) {
    cityWithState = state + ' / ' + city; 
  }
  console.log('cityWithState', cityWithState, country)
  var key = city_names_to_diyanet_ids[cityWithState + ' / ' + country];
  if (!key)  {
    console.log('key not found in diyanet ids: ', cityWithState, country);
    $('.subtitle')[0].innerHTML = 'Adres bulunamadı, İstanbulu gösteriyorum :(';
    key = "9541";
  }
  console.log('ID: ' + key);
  var url = _FB_ROOT_URL + '/new_iftar/' + key + '.json';
  console.log('fb url: ' + url);
  fetch(url)
    .then(function(response) { return response.json(); })
    .then(function(json) {
      // console.log('json: ', json);
      doStuffWithNamazVakitleri(json, state, city, country);
  });  

  // var xhr = new XMLHttpRequest();

  // // This is Diyanet style - they count city as one of the state as well.
  // // If no state is given, go with city.
  // if (state == null) {
  //   state = city;
  // }

  // var withStateUrl = _FB_ROOT_URL + 'iftar/iftar/{country}/{city}/{state}/{date}.json'.supplant({
  //     'date': String(d.getFullYear()) + "/" + currentMonth + "/", //+ currentDay,
  //     'country': encodeURIComponent(country),
  //     'city': encodeURIComponent(city),
  //     'state': encodeURIComponent(state),
  // });

  // var withoutStateUrl = _FB_ROOT_URL + 'iftar/iftar/{country}/{city}/{date}.json'.supplant({
  //     'date': String(d.getFullYear()) + "/" + currentMonth + "/", //+ currentDay,
  //     'country': encodeURIComponent(country),
  //     'city': encodeURIComponent(city),
  // });

  // xhr.open("GET", withStateUrl, true);
  // xhr.onload = function() {
  //   if (xhr.responseText && xhr.responseText.indexOf('aksam') > -1) {
  //     var response = JSON.parse(xhr.responseText);

  //     // If state is given search for it among the results.
  //     if (state != null) {
  //       for (var i=0; i < response.length; i++) {
  //         if (response[i].state && response[i].state == state) {
  //           response = response[i];
  //         }
  //       }
  //     }
  //     doStuffWithNamazVakitleri(response, state, city, country);
  //   } else {
  //     console.log("Bir hata oluştu.");
  //     console.log("Fallback");
  //     // Try without state, some cities have states some dont.
  //     // IRELAND vs Turkey.
  //     xhr.open("GET", withoutStateUrl, true);
  //     xhr.onload = function() {
  //       if (xhr.responseText && xhr.responseText.indexOf('aksam') > -1) {
  //         var response = JSON.parse(xhr.responseText);

  //         // If state is given search for it among the results.
  //         if (state != null) {
  //           for (var i=0; i < response.length; i++) {
  //             if (response[i].state && response[i].state == state) {
  //               response = response[i];
  //             }
  //           }
  //         }
  //         doStuffWithNamazVakitleri(response, state, city, country);
  //       } else {
  //         console.log("Bir hata oluştu.");
  //         console.log("Fallback");
  //       } // End of fallback mechanism
  //     };
  //     xhr.send();
  //   } // End of fallback mechanism
  // };
  // xhr.send();
}

function getCurrentDay() {
  var d = new Date();
  var currentDay = d.getDate() >= 10 ? d.getDate() : '0' + (d.getDate());
  return currentDay;
}

function doStuffWithNamazVakitleri(monthlyVakits, state, city, country) {
  //response = response['results'][0];
  console.log('doStuffWithNamazVakitleri response: ');
  // console.log(monthlyVakits);

  var dateobj= new Date() ;
  var month = dateobj.getMonth() + 1;
  var day = dateobj.getDate();
  var year = dateobj.getFullYear();
  var currentFlatDate = year + '' + (month >= 10 ? month : '0' + month) + (day >= 10 ? day : '0' + day);
  console.log('currentFlatDate', currentFlatDate);
  var todayNamazVakits = monthlyVakits[currentFlatDate];
  // console.log(todayNamazVakits);

  var imsak = todayNamazVakits.imsak;
  var gunes = todayNamazVakits.gunes;
  var ogle = todayNamazVakits.ogle;
  var ikindi = todayNamazVakits.ikindi;
  var aksam = todayNamazVakits.aksam;
  var yatsi = todayNamazVakits.yatsi;

  var iftarHours = parseInt(todayNamazVakits.aksam.split(':')[0]);
  var iftarMinutes = parseInt(todayNamazVakits.aksam.split(':')[1]);

  var sahurHours = parseInt(todayNamazVakits.imsak.split(':')[0]);
  var sahurMinutes = parseInt(todayNamazVakits.imsak.split(':')[1]);

  var imsakSeconds = getSecondsFromStrTime(imsak);
  var gunesSeconds = getSecondsFromStrTime(gunes);
  var ogleSeconds = getSecondsFromStrTime(ogle);
  var ikindiSeconds = getSecondsFromStrTime(ikindi);
  var aksamSeconds = getSecondsFromStrTime(aksam);
  var yatsiSeconds = getSecondsFromStrTime(yatsi);

  var currentSeconds = getCurrentTimeSeconds();

  var targetHours = 0;
  var targetMinutes = 0;
  var targetTitle = '';

  targetHours = parseInt(aksam.split(':')[0]);
  targetMinutes = parseInt(aksam.split(':')[1]);
  targetTitle = 'İftar';

  // if (imsakSeconds > currentSeconds) {
  //   targetHours = parseInt(imsak.split(':')[0]);
  //   targetMinutes = parseInt(imsak.split(':')[1]);
  //   targetTitle = 'İmsak';
  // } else if (ogleSeconds > currentSeconds) {
  //   targetHours = parseInt(ogle.split(':')[0]);
  //   targetMinutes = parseInt(ogle.split(':')[1]);
  //   targetTitle = 'Öğle';
  // } else if (ikindiSeconds > currentSeconds) {
  //   targetHours = parseInt(ikindi.split(':')[0]);
  //   targetMinutes = parseInt(ikindi.split(':')[1]);
  //   targetTitle = 'İkindi';
  // } else if (aksamSeconds > currentSeconds) {
  //   targetHours = parseInt(aksam.split(':')[0]);
  //   targetMinutes = parseInt(aksam.split(':')[1]);
  //   targetTitle = 'Akşam';
  // } else if (yatsiSeconds > currentSeconds) {
  //   targetHours = parseInt(yatsi.split(':')[0]);
  //   targetMinutes = parseInt(yatsi.split(':')[1]);
  //   targetTitle = 'Yatsı';
  // } else {
  //   // Time is after yatsi before imsak but still in the previous day.
  //   targetHours = parseInt(imsak.split(':')[0]) + 24;
  //   targetMinutes = parseInt(imsak.split(':')[1]);
  //   targetTitle = 'İmsak';
  // }

  console.log('Setting timer now...');
  setTimerForVakit(targetHours, targetMinutes, state, city, country, targetTitle);
  // setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes, state, city, country);
  setNamazVakitleri(imsak, gunes, ogle, ikindi, aksam, yatsi, monthlyVakits);
}

/* Returns 62 * 60 from '01:02' */
function getSecondsFromStrTime(str_time) {
  var hours = parseInt(str_time.split(':')[0]);
  var minutes = parseInt(str_time.split(':')[0]);
  return (hours * 60 * 60) + (minutes * 60);
}

function getCurrentTimeSeconds() {
  var currentdate = new Date();
  var currentHours = currentdate.getHours();
  var currentMinutes = currentdate.getMinutes();
  return getSecondsFromStrTime(currentHours + ':' + currentMinutes);
}

function getValues(objects) {
  var values = [];
  for(var key in objects) {
    values.push(objects[key]);
  }
  return values;
}

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

function setNamazVakitleri(imsak, gunes, ogle, ikindi, aksam, yatsi, monthlyVakits) {
  $('#p-imsak')[0].innerHTML = '<b>' + imsak + '</b>';
  $('#p-gunes')[0].innerHTML = '<b>' + gunes+ '</b>';
  $('#p-ogle')[0].innerHTML = '<b>' + ogle+ '</b>';
  $('#p-ikindi')[0].innerHTML = '<b>' + ikindi+ '</b>';
  $('#p-aksam')[0].innerHTML = '<b>' + aksam+ '</b>';
  $('#p-yatsi')[0].innerHTML = '<b>' + yatsi+ '</b>';

  var refinedMonthlyVakits = []
  var date = new Date();
  for (var keyDate in monthlyVakits) {
    if (keyDate > date.yyyymmdd()) {
      refinedMonthlyVakits.push(monthlyVakits[keyDate]);
    }
  }

  monthlyVakits = getValues(refinedMonthlyVakits);

  var counter = 1;
  for (var i in monthlyVakits) {
    $('#p-tarih-' + counter)[0].innerHTML = monthlyVakits[i].date;
    $('#p-imsak-' + counter)[0].innerHTML = monthlyVakits[i].imsak;
    $('#p-gunes-' + counter)[0].innerHTML = monthlyVakits[i].gunes;
    $('#p-ogle-' + counter)[0].innerHTML = monthlyVakits[i].ogle;
    $('#p-ikindi-' + counter)[0].innerHTML = monthlyVakits[i].ikindi;
    $('#p-aksam-' + counter)[0].innerHTML = monthlyVakits[i].aksam;
    $('#p-yatsi-' + counter)[0].innerHTML = monthlyVakits[i].yatsi;
    counter++;
  }
}

function setHicriTarih(hicriTarih) {
  $('#today-date-hicri')[0].innerHTML = (
      $('#today-date-hicri')[0].innerHTML + hicriTarih);
}

function setIftarTitle(country, city, state) {
  if (state == null) {
    state = '';
  }
  document.title = (
      country + ' / ' + city + ' / ' + state + ' için iftar ve namaz vakitleri, '
      + 'ramazana ne kadar kaldı?, Ankara, İstanbul, İzmir, Bursa, Bakü '
      + 'iftar 2019, ramazan, uluslararası namaz ve iftar zamanları.');

  $('.subtitle')[0].innerHTML = (
      city.capitalize() + ' ' + country.capitalize() +
      ' için kalan süre');
  if (state != null) {
    $('.subtitle')[0].innerHTML = ' ' + state + ' ' + $('.subtitle')[0].innerHTML;
  }
}

function setWeatherTitle(country, city) {
  $('#span-weather-country').innerHTML = country;
  $('#span-weather-city').innerHTML = city;
}

function setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes,
                  state, city, country) {
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
        city + ' ' + country + ' için iftara kalan süre');
    if (state != null) {
      $('.subtitle')[0].innerHTML = state + ' ' + $('.subtitle')[0].innerHTML;
    }
  } else {
    clock.setTime(sahurRemainingMs / 1000);
    $('#description').text($('#description').text().replace('iftar', 'sahur'));
    $('#tagline').text($('#tagline').text().replace('iftar', 'sahur'));
    $('.subtitle')[0].innerHTML = (
        city.capitalize() + ' ' + country.capitalize() + ' için sahura kalan süre');
    if (state != null) {
      $('.subtitle')[0].innerHTML = state + ' ' + $('.subtitle')[0].innerHTML;
    }
  }

  clock.start();
}

function setTimerForVakit(
    targetHours, targetMinutes, state, city, country, targetTitle) {
  console.log("targetHours: " + targetHours + " | targetMinutes: " + targetMinutes);
  console.log("city: " + city + " | country: " + country + " | title: " + targetTitle);

  targetHours = parseInt(targetHours);
  targetMinutes = parseInt(targetMinutes);

  var currentdate = new Date();

  var currentDay = currentdate.getDate();
  var currentMonth = currentdate.getMonth();
  var currentYear = currentdate.getYear();

  var currentHours = currentdate.getHours();
  var currentMinutes = currentdate.getMinutes();

  console.log("current hour: " + currentHours + " | minute: " + currentMinutes);

  var targetRemainingMs = (
      new Date(new Date).setHours(targetHours, targetMinutes, 0) - new Date());

  console.log("remaining target ms: " + targetRemainingMs);

  if (targetRemainingMs > 0 && currentHours < targetRemainingMs) {
    clock.setTime(targetRemainingMs / 1000);
    $('#description').text($('#description').text().replace('sahur', targetTitle));
    $('#tagline').text($('#tagline').text().replace('sahur', targetTitle));
    $('.subtitle')[0].innerHTML = (
        city + ' ' + country + ' için ' + targetTitle + '\'a kalan süre');
  } else {
    clock.setTime(sahurRemainingMs / 1000);
    $('#description').text($('#description').text().replace('iftar', targetTitle));
    $('#tagline').text($('#tagline').text().replace('iftar', targetTitle));
    $('.subtitle')[0].innerHTML = (
        city.capitalize() + ' ' + country.capitalize() + ' için ' + targetTitle + '\'a kalan süre');
  }

  clock.start();
}


// USES OPEN WEATHER MAPS but this doesn't work on HTTPS.
// Need https to be able to fetch the location.
function getWeatherByLatLonOW(lat, lon) {
  var xhr = new XMLHttpRequest();
  var weatherUrl = _PROXY_SERVER_URL.supplant({
      'url': encodeURIComponent(_OPEN_WEATHER_API_LAT_LON_URL.supplant(
          {'lat': lat, 'lon': lon, 'api_key': _OPEN_WEATHER_API_KEY}))
  });
  xhr.open("GET", weatherUrl, true);
  xhr.onload = function() {
    var response = JSON.parse(xhr.responseText).list;
    setWeatherDataOW(response);
  };
  xhr.send();
}

function getWeatherByCityOW(countryCode, city) {
  var xhr = new XMLHttpRequest();
  var weatherUrl = '';

  if (!countryCode) {
    weatherUrl = _PROXY_SERVER_URL.supplant({
        'url': encodeURIComponent(_OPEN_WEATHER_API_CITY_ONLY_URL.supplant({
            'city': city,
            'api_key': _OPEN_WEATHER_API_KEY}))
    });
  } else {
    var weatherUrl = _PROXY_SERVER_URL.supplant({
        'url': encodeURIComponent(_OPEN_WEATHER_API_CITY_URL.supplant({
            'country_code': countryCode,
            'city': city,
            'api_key': _OPEN_WEATHER_API_KEY}))
    });
  }

  xhr.open("GET", weatherUrl, true);
  xhr.onload = function() {
    var response = JSON.parse(xhr.responseText).list;
    setWeatherDataOW(response);
  };
  xhr.send();
}

function setWeatherDataOW(response) {
  for (var i in response) {
      var hava = response[i];
      var rowsCode =(
          '<tr id="tr-vakit-0">' +
          '  <td id="p-tarih-0">{date}</td>' +
          '  <td id="p-sicaklik-0">{temp} &#8451;</td>' +
          '  <td id="p-durum-0">{description}</td>' +
          '  <td id="p-icon-0"><img src="{icon_url}"></td>' +
          '  <td id="p-durum-0">{humidity}</td>' +
          '</tr>').supplant({
              'date': hava.dt_txt,
              'temp': hava.main.temp,
              'description': hava.weather[0].description,
              'icon_url': _OPEN_WEATHER_ICON_URL.supplant({
                  'icon_code': hava.weather[0].icon}),
              'humidity': hava.main.humidity
          });
      $('#table-hava-durumu').append(rowsCode);
    }
}

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// Using Dark sky net's API.
// They only have lat lon API.
// function getWeatherByLatLonDarkSky(lat, lon) {
//   var xhr = new XMLHttpRequest();
//   var weatherUrl = _DARK_SKY_API_LAT_LON_URL.supplant(
//       {'lat': lat, 'lon': lon, 'api_key': _DARK_SKY_API_KEY});
//   xhr.open("GET", weatherUrl, true);
//   xhr.onload = function() {
//     var response = JSON.parse(xhr.responseText);
//     setWeatherDataDarkSky(response);
//   };
//   xhr.send();
// }

// function setWeatherDataDarkSky(response) {
//   for (var i in response) {
//       var hava = response[i];
//       var rowsCode =(
//           '<tr id="tr-vakit-0">' +
//           '  <td id="p-tarih-0">{date}</td>' +
//           '  <td id="p-sicaklik-0">{temp} &#8451;</td>' +
//           '  <td id="p-durum-0">{description}</td>' +
//           '  <td id="p-icon-0"><img src=' + _WEATHER_ICON_URL + '"{icon_url}"></td>' +
//           '  <td id="p-durum-0">{humidity}</td>' +
//           '</tr>').supplant({
//               'date': hava.dt_txt,
//               'temp': hava.main.temp,
//               'description': hava.weather[0].description,
//               'icon_url': _WEATHER_ICON_URL.supplant({
//                   'icon_code': hava.weather[0].icon}),
//               'humidity': hava.main.humidity
//           });
//       $('#table-hava-durumu').append(rowsCode);
//     }
// }

