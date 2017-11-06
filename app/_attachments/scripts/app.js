'use strict'

angular.module('parkingApp', ['ngRoute'])

.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'assets/views/home.html',
            controller: 'homeCtrl'
        });
})

.controller('homeCtrl', function($scope) {
	
})
	
