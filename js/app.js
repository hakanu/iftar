angular.module('httpExample', [])
.controller('FetchController', ['$scope', '$http', '$templateCache',
  function($scope, $http, $templateCache) {
    $scope.method = 'JSONP';
    $scope.url = 'https://angularjs.org/greet.php?callback=JSON_CALLBACK&name=Super%20Hero';

    $scope.fetch = function() {
      $scope.code = null;
      $scope.response = null;

      $http({method: $scope.method, url: $scope.url, cache: $templateCache}).
        success(function(data, status) {
          $scope.status = status;
          $scope.data = data;
        }).
        error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
      });


      // var xhr = createCORSRequest("POST", "http://www.diyanet.gov.tr/PrayerTime/PrayerTimesSet");
      // xhr.setRequestHeader('X-Custom-Header', 'value');
      // // xhr.setRequestHeader("Origin", "*");
      // // xhr.setRequestHeader("Access-Control-Request-Headers", "accept, origin, authorization");
      // xhr.onload = function() {
      //   var text = xhr.responseText;
      //   console.log('Response from CORS ' + text);
      // };
      // console.log("Sending");
      // xhr.send();

      $http(
          {
              method: 'POST',
              url: 'http://www.diyanet.gov.tr/PrayerTime/PrayerTimesSet',
              cache: $templateCache,
              data: {countryName: "33", stateName: "581", name: "8573"},
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
              }
          }).
        success(function(data, status, headers, config) {
          console.log("Finished successfully");
        }).
        error(function(data, status, headers, config) {
          console.log("Error in post");
        });

      // $http.post('http://www.diyanet.gov.tr/PrayerTime/PrayerTimesSet', {countryName: "33", stateName: "581", name: "8573"}).
      //   success(function(data, status, headers, config) {
      //     console.log("Finished successfully");
      //   }).
      //   error(function(data, status, headers, config) {
      //     console.log("Error in post");
      //   });

    };

  }]);