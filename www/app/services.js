/* Services */

var bggCollectionsServices = angular.module('bggCollectionsServices', ['ngResource']);

bggCollectionsServices.factory('Collection', ['$resource',
  function($resource){
    'use strict';

    return $resource('collection/:username', {}, {
      query: {
        method:'GET', 
        params:{
          username:'username'
        }
      }
    });
  }
]);