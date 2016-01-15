angular.module('starter.services', ['ngResource'])

    .factory('ParseOrderService', function ($q) {
        var itemObject = Parse.Object.extend("Item");
        var orderObject = Parse.Object.extend("Order");

        var private_acl = new Parse.ACL();
        // give write access to the current user
        private_acl.setWriteAccess(Parse.User.current(), true);
        private_acl.setReadAccess(Parse.User.current(), true);

        return {
            query: function () {
                var query = new Parse.Query(orderObject);
                var defer = $q.defer();
                query.find({
                    success: function (results) {
                        defer.resolve(results);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            get: function (id) {
                var query = new Parse.Query(orderObject);
                var defer = $q.defer();

                query.include('items');
                query.get(id, {
                    success: function (result) {
                        defer.resolve(result);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            create: function (orderRequest) {
                var defer = $q.defer();
                var Order = new orderObject();
                Order.setACL(private_acl);

                // strip items from the orderRequest.
                var items = orderRequest.items;
                delete orderRequest.items;
                orderRequest.user = Parse.User.current();

                Order.save(orderRequest, {
                    success: function (orderResult) {
                        var itemsRequest = [];
                        angular.forEach(items, function(item){
                            item.order = orderResult;
                            item.price = item.product.get("price");
                            item.photo = item.product.get("photo");
                            console.log(item);
                            var Item = new itemObject(item);
                            Item.setACL(private_acl);
                            itemsRequest.push(Item);

                        });
                        Parse.Object.saveAll(itemsRequest, {
                            success: function(objs){
                                orderResult.set("items",itemsRequest);
                                orderResult.save();
                                defer.resolve(orderResult);
                            },
                            error: function(error){
                                defer.reject(error);

                            }
                        })
                    }, error: function (orderResult, error) {
                        defer.reject(error);

                    }
                });

                return defer.promise;

            }
        }
    })

    .factory('ParseProductService', function ($q) {
        var productObject = Parse.Object.extend("Product");
        return {
            query: function () {
                var query = new Parse.Query(productObject);
                var defer = $q.defer();
                query.find({
                    success: function (results) {
                        defer.resolve(results);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            get: function (id) {
                var query = new Parse.Query(productObject);
                var defer = $q.defer();
                query.get(id, {
                    success: function (result) {
                        defer.resolve(result);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            }
        }


    })

    /*
     .factory('ProductService', function ($resource) {
     return $resource('http://192.168.1.21:3000/products/:product',{product: "@product"});
     })*/
    .factory("LocalStorageService", function ($window) {
        return {
            setData: function (name, val) {
                var clone = angular.copy(val);

                $window.localStorage && $window.localStorage.setItem(name, angular.toJson(val));
                return this;
            },
            getData: function (name) {
                return $window.localStorage && JSON.parse($window.localStorage.getItem(name));
            },
            removeData: function (name) {
                $window.localStorage.removeItem(name);
            }
        };
    });