'use strict'

angular.module('parkingApp', ['ngRoute'])

.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'assets/views/home.html',
            controller: 'homeCtrl'
        })
        .otherwise({ //BUG FIX, Bootstrap etc doesn't load without .otherwise
            redirectTo: '/home'
          });
})

.controller('homeCtrl', function($scope, addressSrv, zoneSrv, saveSrv) {
	
	$('#searchButton').on('click', function(e) { //make onClick in code, not in HTML
		
		$scope.color = '';
		
		var address = $('#addressText').val();
		
		addressSrv.getCoordinates(address).then(function(data) {
			//console.log(data);
			var lat = parseFloat(data.data[0].lat); //data.data[0].lat check with console.log(data) and look how to get to your data
			var lon = parseFloat(data.data[0].lon);
			var zones = saveSrv.getObject('zones'); //get zones from localstorage, because we already saved it once

			if (Object.keys(zones).length == 0) { //If there is nothing locally saved
				zoneSrv.getZones().then(function(data) {
					//console.log(data);
					zones = data;
					saveSrv.setObject('zones', data); //saves the data locally, don't need to GET from internet anymore but locally
					$scope.color = zoneSrv.getTariff(lon, lat, zones.data).tariefkleur;
					$scope.starttarief = zoneSrv.getTariff(lon, lat, zones.data).starttarief;
					$scope.uur = zoneSrv.getTariff(lon, lat, zones.data).uurregeling;
				});
			} else {
				$scope.color = zoneSrv.getTariff(lon, lat, zones.data).tariefkleur; //not stored locally
				$scope.starttarief = zoneSrv.getTariff(lon, lat, zones.data).starttarief;
				$scope.uur = zoneSrv.getTariff(lon, lat, zones.data).uurregeling;
			}
			
		});
	});
	
})

.service('addressSrv', function($http, $q) {
	this.getCoordinates = function(address) {
		
		var q = $q.defer();
		var url = 'http://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(address) + '&format=json';
		
		$http.get(url)
			.then(function(data) {
				q.resolve(data);
			}, function error(err) {
				q.reject(err);
			});
		
		return q.promise;
	}
})

.service('zoneSrv', function($http, $q) {
	this.getZones = function() {
		var q = $q.defer();
		$http.get('http://datasets.antwerpen.be/v4/gis/paparkeertariefzones.json')
			.then(function(data, status, headers, config) {
				q.resolve(data.data); //data.data because when you look at the json data of the GET url it has 'paging' and 'data'. We only want 'data'
			}, function error(err) {
				q.reject(err);
			});
		return q.promise;
	}
	
	this.inPolygon = function(location, polyLoc){
        var lastPoint = polyLoc[polyLoc.length-1];
        var isInside = false;
        var x = location[0];

        for(var i = 0; i < polyLoc.length; i++){
            var point = polyLoc[i];
            var x1 = lastPoint[0];
            var x2 = point[0];
            var dx = x2 - x1;

            if(Math.abs(dx) > 180.0){
                if(x > 0){
                    while(x1 < 0)
                        x1 += 360;
                    while(x2 < 0)
                        x2 += 360;
                }
                else{
                    while(x1 > 0)
                        x1 -= 360;
                    while(x2 > 0)
                        x2 -= 360;
                }
                dx = x2 - x1;
            }

            if((x1 <= x && x2 > x) || (x1 >= x && x2 < x)){
                var grad = (point[1] - lastPoint[1]) / dx;
                var intersectAtLat = lastPoint[1] + ((x - x1) * grad);

                if(intersectAtLat > location[1])
                    isInside = !isInside;
            }
            lastPoint = point;
        }
        return isInside;
    };
    
    this.getTariff = function(lng, lat, zones) {
    	for (var i = 0; i < zones.length; i++) { //Go through the whole zones array
    		var geo = JSON.parse(zones[i].geometry); //get geometry (lat longs of that zone)
    		var coords = geo.coordinates[0];
    		if (this.inPolygon([lng, lat], coords)) {
    			return zones[i];
    		}
    	}
    };
})

.service('saveSrv', function($window, $http){
	  this.setObject = function(key, value){
		  $window.localStorage[key] = JSON.stringify(value);
		  //Save in CouchDB
		  $http.put('../../' + key, value);
	  };
	  
	  this.getObject = function(key){
		  return JSON.parse($window.localStorage[key] || '{}');
	  };
});


	
