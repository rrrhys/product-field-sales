angular.module('starter.services', ['ngResource'])

    .factory('OrderService', function ($resource) {
        return $resource('http://192.168.1.21:3000/orders/:order',{order: "@order"});
    })
    .factory('ProductService', function ($resource) {
        return $resource('http://192.168.1.21:3000/products/:product',{product: "@product"});
    })
    .factory("LocalStorageService", function($window) {
        return {
            setData: function(name,val) {
                var clone = angular.copy(val);

                $window.localStorage && $window.localStorage.setItem(name,angular.toJson(val));
                return this;
            },
            getData: function(name) {
                return $window.localStorage && JSON.parse($window.localStorage.getItem(name));
            },
            removeData: function(name) {
                $window.localStorage.removeItem(name);
            }
        };
    });