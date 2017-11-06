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

.controller('homeCtrl', function($scope) {
	
	$('#searchButton').on('click', function(e) { //make onClick in code, not in HTML
		
		$scope.color = ''; //what if I don't put this here?
		
		
	});
	
})
	
