'use strict';

var Directives = angular.module('LM.directives', []);

Directives.directive('changePagesize', [ function () {
	return function(scope, element, attrs) {
		function selectValue(e) {
			var obj = angular.element(e.target);
			element.find('.type').text(obj.text());
			element.find('button').val(obj.attr('data-value'));
			element.removeClass('open');
			scope.reload();
			return false;
		}
		element.find('a').on('click', selectValue);
	};
}]);

Directives.directive('openLinks', [ function () {
	return function(scope, element, attrs) {
		element.on('click', function() {
			var items = angular.element('.link-item');
			items.each( function (e) {
				chrome.tabs.create({url:angular.element(this).attr('href'), "selected":false});
			});
	    });
	};
}]);

Directives.directive('closeLinks', [ function () {
	return function(scope, element, attrs) {
		element.on('click', function() {
			chrome.windows.getCurrent( function(win) {
				chrome.tabs.getAllInWindow(win.id, function(tabs) {
					for ( var i=0; i < tabs.length; i++) {
						if (tabs[i].id != LM.link.tabId) {
							chrome.tabs.remove(tabs[i].id)
						}
					}
				});
			});
	    });
	};
}]);

Directives.directive('insertLink', [ '$rootScope', function ($rootScope) {
	return function(scope, element, attrs) {
		element.on('click', function() {
			$rootScope.$broadcast(LM.link.openHandleLinkForm, {type:LM.link.InsertLink, data:{}});
	    });
	};
}]);

Directives.directive('insertService', [ '$rootScope', function ($rootScope) {
	return function(scope, element, attrs) {
		element.on('click', function() {
			$rootScope.$broadcast(LM.link.openInsertServiceForm, false);
	    });
	};
}]);

Directives.directive('backHome', [ function () {
	return function(scope, element, attrs) {
		element.on('click', function() {
			angular.element('#container').empty();
			chrome.tabs.reload(LM.link.tabId);
	    });
	};
}]);