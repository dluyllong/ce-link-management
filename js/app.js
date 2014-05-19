'use strict';

var LM = angular.module('LM', ['LM.services','LM.directives','LM.filters','ngSanitize']);

// constant of link
LM.link = {
	"getLinksUrl": "http://localhost/duy-long-links-services/links.json",
	"saveLinksUrl": "http://localhost/duy-long-links-services/save.php",
	"followType": angular.element('#dl-follow-type').val(),
	"pageRank": parseInt(angular.element('#dl-pr').val()),
	"tabId": null,
	"winId": null,
	"dataLoaded": "DATA_LOADED",
	"openHandleLinkForm": "OPEN_HANDLE_LINK_FORM",
	"InsertLink": "INSERT_LINK",
	"EditLink": "EDIT_LINK",
	"deteteCallback": "DELETE_CALLBACK",
	"insertCallback": "INSERT_CALLBACK",
	"updateCallback": "UPDATE_CALLBACK",
	"urlIndex": null,
	"pageRanks": [0,1,2,3,4,5,6,7,8,9,10],
	"getLinksFilter": "GET_LINKS_FILTER",
	"loading": "LOADING",
	"loaded": "LOADED"
};

chrome.tabs.getCurrent( function (tab) {
	LM.link.tabId = tab.id;
});
chrome.windows.getCurrent( function(win) {
	LM.link.winId = win.id;
});

// for Handle Page
LM.controller('MainController', function($scope, $element, Links) {
	
	var data = Links.getData();
	data.then(function(result) {
		$scope.$broadcast(LM.link.dataLoaded, true);
	});
	
	var loadingLayer = $element.find('#loading-layer');
	$scope.$on(LM.link.loading, function () {
		$scope.loading = true;
	});
	
	$scope.$on(LM.link.loaded, function () {
		$scope.loading = false;
	});
	
});

// open Insert Dialog
LM.controller('HandleLinkController', function($scope, $element, Links) {
	
	// get 11 ranks
	$scope.pageRanks = LM.link.pageRanks;
	
	// set value for first time
	var resetValues = function () {
		$scope.handleType = "";
		$scope.url = "";
		$scope.pageRank = 0;
		$scope.isAvailable = true;
		$scope.follow = true;
		$scope.isUrlExist = false;
	};
	
	resetValues();
	
	var formTitle = $element.find('.modal-title'),
		inputUrl = $element.find('#inputUrl'),
		doFollowEL = $element.find('.do-follow'),
		noFollowEL = $element.find('.no-follow'),
		turnAvaiOn = $element.find('.turn-avai-on'),
		turnAvaiOff = $element.find('.turn-avai-off'),
		pageRankEl = $element.find('.page-rank'),
		pageRankView = pageRankEl.find('.type');
	
	var resetForm = function () {
		$scope.newLink = {
			"url": "",
			"isAvailable": true,
			"follow": true,
			"pageRank": 0
		};
		$scope.url = $scope.newLink.url;
		$scope.isAvailable = $scope.newLink.isAvailable;
		$scope.follow = $scope.newLink.follow;
		$scope.pageRank = $scope.newLink.pageRank;
		$scope.isUrlExist = false;
		
		inputUrl.val($scope.url);
		pageRankView.text($scope.pageRank);
		turnAvaiOn.addClass('active').siblings().removeClass('active');
		doFollowEL.addClass('active').siblings().removeClass('active');
	};
	
	var replaceForm = function (data) {
		$scope.url = data.url;
		$scope.follow = data.follow;
		$scope.isAvailable = data.isAvailable;
		$scope.pageRank = data.pageRank;
		pageRankView.text(data.pageRank);
		$scope.isUrlExist = false;
	};
	
	$element.on('hide.bs.modal', function (e) {
		$scope.isUrlExist = false;
		inputUrl.prop('disabled', false);
		$element.find('.alert').addClass('ng-hide');
	});
	
	$scope.$on(LM.link.openHandleLinkForm, function(event, data) {
		if (data.type == LM.link.InsertLink) {
			$scope.handleType = LM.link.InsertLink;
			formTitle.text(LM.link.InsertLink);
			resetForm();
		} else if (data.type == LM.link.EditLink) {
			inputUrl.prop('disabled', true);
			$scope.handleType = LM.link.EditLink;
			formTitle.text(LM.link.EditLink);
			replaceForm(data.data);
		}
		$element.modal('show');
	});
	
	// submit link to data
	$scope.submit = function () {
		if ( $scope.handleType == LM.link.EditLink ) {
			// change link in data
			
			$scope.thisLink = {
				"url": $scope.url,
				"isAvailable": $scope.isAvailable,
				"follow": $scope.follow,
				"pageRank": $scope.pageRank
			};
			
			$scope.$emit(LM.link.loading, false);
			Links.updateLink($scope.thisLink);
			
		} else if ( $scope.handleType == LM.link.InsertLink ) {
			// insert link to data
			if ( $scope.url.length > 6 ) {
				
				$scope.newLink = {
					"url": $scope.url,
					"isAvailable": $scope.isAvailable,
					"follow": $scope.follow,
					"pageRank": $scope.pageRank
				};
				
				if ( Links.checkLinkExist($scope.url) ) {
					$scope.isUrlExist = true;
				} else {
					$scope.$emit(LM.link.loading, false);
					Links.insertLink($scope.newLink);
				}
			}
		}
	};
	
	$scope.$on(LM.link.insertCallback, function () {
		$element.modal('hide');
	});
	
	$scope.$on(LM.link.updateCallback, function () {
		$element.modal('hide');
	});
	
	// change form follow type
	$scope.doFollow = function (isFollow) {
		$scope.follow = isFollow;
	};
	
	// change form available
	$scope.turnAvai = function (is) {
		$scope.isAvailable = is;
	};
	
	// change form pagerank
	$scope.changePageRank = function (pr) {
		$scope.pageRank = pr;
		pageRankView.text(pr);
		return false;
	};
});

// for Handle Search Panel
LM.controller('SearchController', function($rootScope, $scope, $element, Links) {
	
	var pageRankEl = $element.find('.page-rank'),
		pageRankView = pageRankEl.find('.type'),
		followEl = $element.find('.follow'),
		followView = followEl.find('.type'),
		isAvaiEl = $element.find('.is-avai'),
		isAvaiView = isAvaiEl.find('.type'),
		data = {
			pageRank: -1,
			followType: -1,
			isAvai: -1
		};
		
	$scope.pageRanks = LM.link.pageRanks;
	
	$scope.changePageRank = function (pr, $event) {
		data.pageRank = pr;
		pageRankView.text('PR ' + pr);
		$rootScope.$broadcast(LM.link.getLinksFilter, data);
		return false;
	};
	
	$scope.changeToType = function (type, $event) {
		data.followType = type;
		followView.text($event.target.innerHTML);
		$rootScope.$broadcast(LM.link.getLinksFilter, data);
		return false;
	};
	
	$scope.changeToAvai = function (isAvai, $event) {
		data.isAvai = isAvai;
		isAvaiView.text($event.target.innerHTML);
		$rootScope.$broadcast(LM.link.getLinksFilter, data);
		return false;
	};
	
});

LM.controller('LinksListController', function ($scope, $element, Links, $filter) {
	
	$scope.currentPage = 1;
	$scope.pageSizes = [5,10,20];
	$scope.pageSize = 10;
	$scope.links = [];
	$scope.groupLinks = [];
	$scope.pages = 1;
	
	var pageSizeEl = $element.find('.page-size'),
		pageSizeView = pageSizeEl.find('.type');
	
	$scope.group = function () {
		$scope.links = $filter('orderBy')($scope.links, '-pageRank');
		$scope.groupLinks = [];
		var num = Math.ceil($scope.links.length/$scope.pageSize);
		$scope.pages = num < 1 ? 1 : num;
		
		for ( var i = 0; i < $scope.links.length; i++ ) {
			if (i % $scope.pageSize === 0) {
				$scope.groupLinks[Math.floor(i / $scope.pageSize)] = [ $scope.links[i] ];
			} else {
				$scope.groupLinks[Math.floor(i / $scope.pageSize)].push($scope.links[i]);
			}
		}
		
	};
	
	$scope.$on(LM.link.dataLoaded, function (event, mass) {
		$scope.links = Links.getLinks();
		$scope.group();
	});
	
	$scope.$on(LM.link.deteteCallback, function (event, mass) {
		$scope.links = _.without($scope.links, _.findWhere($scope.links, {url: LM.link.urlIndex}));
		$scope.group();
		if ( $scope.pages < $scope.currentPage ) {
			$scope.changeSlide(-1);
		}
		LM.link.urlIndex=null;
	});
	
	$scope.$on(LM.link.getLinksFilter, function (event, mass) {
		$scope.links = Links.getLinksFilter(mass);
		$scope.currentPage = 1;
		$scope.group();
	});
	
	$scope.$on(LM.link.insertCallback, function (event, mass) {
		if ( _.find($scope.links, function(link) { return link.url == mass.url }) ) {
			// do nothing
		} else {
			$scope.links.push(mass);
		}
		$scope.group();
	});
	
	// change number of links each slide
	$scope.changeSizeTo = function (ps) {
		$scope.pageSize = ps;
		pageSizeView.text(ps);
		$scope.group();
	};
	
	// jump slide to next or previous, way = 1 or -1
	$scope.changeSlide = function (way) {
		$scope.currentPage = $scope.currentPage+way;
	};

});

LM.controller('LinkItemController', function($rootScope, $scope, $element, Links) {
	$scope.edit = function () {
		var url = $element.find('.link-item').text(),
			data = Links.getLink(url);
		$rootScope.$broadcast(LM.link.openHandleLinkForm, {type:LM.link.EditLink, data:data});
	};
	
	$scope.remove = function () {
		$scope.$emit(LM.link.loading, false);	// delay other actions
		var url = $element.find('.link-item').text();
		LM.link.urlIndex = url;
		var url = $element.find('.link-item').text();
		Links.deleteLinkByUrl(url);
	}
});