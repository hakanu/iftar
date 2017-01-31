var clock = $('.your-clock').FlipClock({
  countdown: true,
  defaultLanguage: 'tr',
  language: 'tr',
});

var _FB_ROOT_URL = 'https://prayer-times-3d4fb.firebaseio.com/'
var RAMAZAN_DATE_ = '2017-05-27';
var RAMAZAN_LAST_DATE_ = '2017-06-25';

jQuery( document ).ready(function( $ ) {
  //console.log('  _[]    __   _                         _                    ');
  //console.log(' |_ _|  / _| | |_    __ _   _ __       / \     _ __    _ __  ');
  //console.log('  | |  | |_  | __|  / _` | |  __|     / _ \   |  _ \  |  _ \ ');
  //console.log('  | |  |  _| | |_  | (_| | | |       / ___ \  | |_) | | |_) |');
  //console.log(' |___| |_|    \__|  \__,_| |_|      /_/   \_\ | .__/  | .__/ ');
  //console.log('                                              |_|     |_|    ');
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
    //console.log('not getting the location because url is ' + currentUrl);
    var params = getJsonFromUrl(currentUrl);
    //console.log('get url parameters: ' + JSON.stringify(params));
    if (params && params['ulke'] && params['sehir']) {
      $('#today-date')[0].innerHTML = new Date().toJSON().slice(0,10);
      setIftarTitle(params['ulke'], params['sehir'], params['state']);
      setHicriTarih(hicriTarih);
      var city = params['sehir'];
      var country = params['ulke'];
      var state = params['state'];
      getIftarTimeP(country, city, state);
    } else {
      //console.log('Wrong url params');
    }
  }

  // If I can show ramazan days left, I show.
  if ($('#span-ramazan-days-left').size() > 0) {
    var ramazanDaysLeft = parseInt(
        (new Date(RAMAZAN_DATE_) - new Date()) / 1000 / 3600 / 24);

    // If ramazan has already started, it will be minus N.
    if (ramazanDaysLeft < 0) {
      ramazanDaysLeft = 0;
      $('#span-ramazan-start-end-text').innerHTML = 'bitmesine';
    }
    $('#span-ramazan-days-left')[0].innerHTML = ramazanDaysLeft;
  }

  if ($('#span-ramazan-days-remaining').size() > 0) {
    var ramazanDaysRemaining = parseInt(
        (new Date(RAMAZAN_LAST_DATE_) - new Date()) / 1000 / 3600 / 24);
    $('#span-ramazan-days-remaining')[0].innerHTML = ramazanDaysRemaining;
    $('#span-ramazan-start-end-text')[0].innerHTML = 'başlamasına';
  }

  $('#span-ramazan-bitis')[0].innerHTML = RAMAZAN_LAST_DATE_;

  // If it's bilgi page.
  if (currentUrl.indexOf('/bilgi/') != -1) {
    //console.log('Bilgi page');
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
    return this.charAt(0).toUpperCase().replace('İ̇', 'İ') + this.toLowerCase().slice(1);
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
    "2016​​-12-1": {
        "content": "MEVLİD KANDİLİ​"
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
        //console.log("Geolocation is not supported by this browser.");
        $('.subtitle')[0].innerHTML = 'Bulunduğun yeri tespit edemedik :(';
    }
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  //console.log("Latitude: " + lat + " | " + "Longitude: " + lon);
  var xhr = new XMLHttpRequest();
  reverseGeoYqlUrl = reverseGeoYqlUrl.supplant(
      {'reverseGeoYql': encodeURIComponent(
          reverseGeoYql.supplant(
              {'url': reverseGeoUrl.supplant(
                    {'lat': lat, 'lon': lon})
              }))
      });
  //reverseGeoYqlUrl = reverseGeoYqlUrl.supplant(
  //    {'reverseGeoYql': reverseGeoYql.supplant({'lat': lat, 'lon': lon})});
  // Yahoo shut down geo table. So use this workaround:
  //reverseGeoYqlUrl = reverseGeoUrl.supplant({'lat': lat, 'lon': lon})
  //console.log('reverseGeoYqlUrl: ' + reverseGeoYqlUrl);
  //console.log('reverseGeoYqlUrl: ' + reverseGeoYqlUrl);
  xhr.open("GET", reverseGeoYqlUrl, true);
  xhr.onload = function() {
    //console.log(xhr.responseText);
    var response = JSON.parse(xhr.responseText);
    //console.log(response);
    //console.log(response.query);
    var city = response.query.results.ResultSet.Result.city;
    var country = response.query.results.ResultSet.Result.country;
    var state = null;
    //console.log('city: ' + city);
    //console.log('country: ' + country);
    setIftarTitle(country, city, state);
    getIftarTimeP(country, city, state);
  };
  xhr.send();
}

function getIftarTimeP(country, city, state) {
  var d = new Date();
  var currentMonth = (
      d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1));
  var currentDay = d.getDate() >= 10 ? d.getDate() : '0' + (d.getDate());
  var dateStr = (d.getFullYear().toString().slice(2) + "-" + currentMonth + "-"
                 + currentDay);
  //console.log('Getting iftar time for ' + country + ' city: ' + city + ' date: ' + dateStr);
  var xhr = new XMLHttpRequest();

  var url = _FB_ROOT_URL + 'iftar/iftar/{date}/{country}/{city}/.json'.supplant({
      'date': String(d.getFullYear()) + "/" + currentMonth + "/" + currentDay,
      'country': encodeURIComponent(country.toUpperCase().replace('İ', 'I')),
      'city': encodeURIComponent(city.toUpperCase().replace('İ', 'I')),
  });

  //console.log(url);
  xhr.open("GET", url, true);
  xhr.onload = function() {
    //console.log(xhr.responseText);
    if (xhr.responseText && xhr.responseText.indexOf('aksam') > -1) {
      var response = JSON.parse(xhr.responseText);

      // If state is given search for it among the results.
      if (state != null) {
        for (var i=0; i < response.length; i++) {
          if (response[i].state == state) {
            response = response[i];
          }
        }
      } else {
        response = response[0];
      }

      doStuffWithNamazVakitleri(response, state, city, country);
    } else {
      //console.log("Bir hata oluştu.");
      //console.log("Fallback");
    } // End of fallback mechanism
  };
  xhr.send();
}

function doStuffWithNamazVakitleri(response, state, city, country) {
  //response = response['results'][0];

  var imsak = response.imsak;
  var gunes = response.gunes;
  var ogle = response.ogle;
  var ikindi = response.ikindi;
  var aksam = response.aksam;
  var yatsi = response.yatsi;

  var iftarHours = parseInt(response.aksam.split(':')[0]);
  var iftarMinutes = parseInt(response.aksam.split(':')[1]);

  var sahurHours = parseInt(response.imsak.split(':')[0]);
  var sahurMinutes = parseInt(response.imsak.split(':')[1]);

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

  if (imsakSeconds > currentSeconds) {
    targetHours = parseInt(imsak.split(':')[0]);
    targetMinutes = parseInt(imsak.split(':')[1]);
    targetTitle = 'İmsak';
  } else if (ogleSeconds > currentSeconds) {
    targetHours = parseInt(ogle.split(':')[0]);
    targetMinutes = parseInt(ogle.split(':')[1]);
    targetTitle = 'Öğle';
  } else if (ikindiSeconds > currentSeconds) {
    targetHours = parseInt(ikindi.split(':')[0]);
    targetMinutes = parseInt(ikindi.split(':')[1]);
    targetTitle = 'İkindi';
  } else if (aksamSeconds > currentSeconds) {
    targetHours = parseInt(aksam.split(':')[0]);
    targetMinutes = parseInt(aksam.split(':')[1]);
    targetTitle = 'Akşam';
  } else if (yatsiSeconds > currentSeconds) {
    targetHours = parseInt(yatsi.split(':')[0]);
    targetMinutes = parseInt(yatsi.split(':')[1]);
    targetTitle = 'Yatsı';
  } else {
    // Time is after yatsi before imsak but still in the previous day.
    targetHours = parseInt(imsak.split(':')[0]) + 24;
    targetMinutes = parseInt(imsak.split(':')[1]);
    targetTitle = 'İmsak';
  }

  //console.log('Setting timer now...');
  //setTimerForVakit(targetHours, targetMinutes, state, city, country, targetTitle);
  setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes,
           state, city, country);
  setNamazVakitleri(imsak, gunes, ogle, ikindi, aksam, yatsi);
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

function setIftarTitle(country, city, state) {
  if (state == null) {
    state = '';
  }
  document.title = (
      country + ' / ' + city + ' / ' + state + ' için iftar ve namaz vakitleri, '
      + 'ramazana ne kadar kaldı?, Ankara, İstanbul, İzmir, Bursa, Bakü '
      + 'iftar 2015, ramazan, uluslararası namaz ve iftar zamanları.');

  $('.subtitle')[0].innerHTML = (
      city.capitalize() + ' (' + country.capitalize() +
      ') için kalan süre');
  if (state != null) {
    $('.subtitle')[0].innerHTML = state + ', ' + $('.subtitle')[0].innerHTML;
  }
}

function setTimer(iftarHours, iftarMinutes, sahurHours, sahurMinutes,
                  state, city, country) {
  //console.log("iftar hour: " + iftarHours + " | minute: " + iftarMinutes);
  //console.log("sahur hour: " + sahurHours + " | minute: " + sahurMinutes);

  sahurHours = parseInt(sahurHours);
  sahurMinutes = parseInt(sahurMinutes);

  var currentdate = new Date();

  var currentDay = currentdate.getDate();
  var currentMonth = currentdate.getMonth();
  var currentYear = currentdate.getYear();

  var currentHours = currentdate.getHours();
  var currentMinutes = currentdate.getMinutes();

  //console.log("current hour: " + currentHours + " | minute: " + currentMinutes);

  var iftarRemainingMs = (
      new Date(new Date).setHours(iftarHours, iftarMinutes, 0) - new Date());
  var sahurRemainingMs = (
      new Date(new Date).setHours(sahurHours + 24, sahurMinutes, 0) - new Date());

  if (currentHours < sahurHours) {
    sahurRemainingMs = (
        new Date(new Date).setHours(sahurHours, sahurMinutes, 0) - new Date());
  }

  //console.log("remaining iftar ms: " + iftarRemainingMs);
  //console.log("remaining sahur ms: " + sahurRemainingMs);

  if (iftarRemainingMs > 0 && currentHours > sahurHours) {
    clock.setTime(iftarRemainingMs / 1000);
    $('#description').text($('#description').text().replace('sahur', 'iftar'));
    $('#tagline').text($('#tagline').text().replace('sahur', 'iftar'));
    $('.subtitle')[0].innerHTML = (
        city + ' (' + country +
        ') için iftara kalan süre');
    if (state != null) {
      $('.subtitle')[0].innerHTML = state + ', ' + $('.subtitle')[0].innerHTML;
    }
  } else {
    clock.setTime(sahurRemainingMs / 1000);
    $('#description').text($('#description').text().replace('iftar', 'sahur'));
    $('#tagline').text($('#tagline').text().replace('iftar', 'sahur'));
    $('.subtitle')[0].innerHTML = (
        city.capitalize() + ' (' + country.capitalize() +
        ') için sahura kalan süre');
    if (state != null) {
      $('.subtitle')[0].innerHTML = state + ', ' + $('.subtitle')[0].innerHTML;
    }
  }

  clock.start();
}

function setTimerForVakit(
    targetHours, targetMinutes, state, city, country, targetTitle) {
  //console.log("targetHours: " + targetHours + " | targetMinutes: " + targetMinutes);
  //console.log("city: " + city + " | country: " + country + " | title: " + targetTitle);

  targetHours = parseInt(targetHours);
  targetMinutes = parseInt(targetMinutes);

  var currentdate = new Date();

  var currentDay = currentdate.getDate();
  var currentMonth = currentdate.getMonth();
  var currentYear = currentdate.getYear();

  var currentHours = currentdate.getHours();
  var currentMinutes = currentdate.getMinutes();

  //console.log("current hour: " + currentHours + " | minute: " + currentMinutes);

  var targetRemainingMs = (
      new Date(new Date).setHours(targetHours, targetMinutes, 0) - new Date());

  //console.log("remaining target ms: " + targetRemainingMs);

  if (targetRemainingMs > 0 && currentHours < targetRemainingMs) {
    clock.setTime(targetRemainingMs / 1000);
    $('#description').text($('#description').text().replace('sahur', targetTitle));
    $('#tagline').text($('#tagline').text().replace('sahur', targetTitle));
    $('.subtitle')[0].innerHTML = (
        city + ' (' + country +
        ') için ' + targetTitle + '\'a kalan süre');
  } else {
    clock.setTime(sahurRemainingMs / 1000);
    $('#description').text($('#description').text().replace('iftar', targetTitle));
    $('#tagline').text($('#tagline').text().replace('iftar', targetTitle));
    $('.subtitle')[0].innerHTML = (
        city.capitalize() + ' (' + country.capitalize() +
        ') için ' + targetTitle + '\'a kalan süre');
  }

  clock.start();
}
