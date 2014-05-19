'use strict';

var ServicesModule = angular.module('LM.services', []);

ServicesModule.factory('Links',function($http, $q, $rootScope) {
	var data = [];
	
	var Links = {
		getData: function() {
			var deferred = $q.defer();
	
			$http.get(LM.link.getLinksUrl).success(function(result){
				deferred.resolve(result);
				data = result;
			});
	
			return deferred.promise;
		},
		save: function (type) {
			$http({
				url: LM.link.saveLinksUrl,
					method: "POST",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: $.param({data:JSON.stringify(angular.copy(data), null, '\t')})
				}).success(function(result, status, headers, config) {
					
					$rootScope.$broadcast(LM.link.loaded, false);
					if ( type == 'delete' ) {
						console.log('deleted');
						$rootScope.$broadcast(LM.link.deteteCallback, true);
					} else if ( type == 'insert' ) {
						console.log('inserted');
						$rootScope.$broadcast(LM.link.insertCallback, _.last(data));
					} else if ( type == 'update') {
						console.log('updated');
						$rootScope.$broadcast(LM.link.updateCallback, true);
					}
				}).error(function(result, status, headers, config) {
					console.log('failed');
			});
		},
		getLinks: function () {
			return data;
		},
		getLink: function (url) {
			var link = _.find(data, function(u) {
				return u.url == url;
			});
			return link;
		},
		checkLinkExist: function (url) {
			return _.find(data, function(link) {
				return link.url == url;
			});
		},
		getLinksFilter: function (param) {
			var list = data;
			if ( param.pageRank > -1 ) {	// get by pageRank
				list = _.filter(list, function(link) {
					return link.pageRank == param.pageRank;
				});
			}
			if ( param.followType > -1 ) {	// get by followType
				list = _.filter(list, function(link) {
					return link.follow == param.followType;
				});
			}
			if ( param.isAvai > -1 ) {	// get by isAvailable
				list = _.filter(list, function(link) {
					return link.isAvailable == param.isAvai;
				});
			}
			return list;
		},
		deleteLinkByUrl: function (url) {
			data = _.without(data, _.findWhere(data, {url: url}));
			Links.save('delete');
			return false;
		},
		insertLink: function (link) {
			data.push(link);
			Links.save('insert');
			return false;
		},
		updateLink: function (updateLink) {
			console.log(updateLink);
			var indexLink = _.find(data, function(link) {
				return link.url == updateLink.url;
			});
			indexLink.isAvailable = updateLink.isAvailable;
			indexLink.follow = updateLink.follow;
			indexLink.pageRank = updateLink.pageRank;
			Links.save('update');
			return false;
		}
	};
	
	return Links;
});