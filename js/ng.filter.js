'use strict';

var filters = angular.module('LM.filters', []);

filters.filter('bool', function($sanitize) {
	return function (data) {
		return '<span class="glyphicon glyphicon-'+(data ? "ok" : "remove")+'"></span>';
	}
});