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

.controller('homeCtrl', function($scope, addressSrv) {
	
	$('#searchButton').on('click', function(e) { //make onClick in code, not in HTML
		
		$scope.color = ''; //what if I don't put this here?
		
		var address = $('#addressText').val();
		
		addressSrv.getCoordinates(address).then(function(data) {
			//console.log(data);
			var lat = parseFloat(data.data[0].lat);
			var lon = parseFloat(data.data[0].lon);
			console.log(lat);
			console.log(lon);
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
});
	
