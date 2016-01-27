stripAngularStuff = function(obj){
    delete obj._objCount;

}


angular.module('starter.services', ['ngResource', 'ngParse'])
    .config(['ParseProvider', function(ParseProvider) {
        ParseProvider.initialize(ENV.parse_app, ENV.parse_js_key);
    }])

    .factory('ParseUserService', function($q, Parse){

        var settingsObject = Parse.Object.extend("Settings");
        Parse.defineAttributes(settingsObject, ["company"]);

        var private_acl = new Parse.ACL();
        if(Parse.User.current()){
            private_acl.setWriteAccess(Parse.User.current(), true);
            private_acl.setReadAccess(Parse.User.current(), true);
        }

        return {
            fetchSettings: function(){
                var defer = $q.defer();
                var id = Parse.User.current().get("settings").id;

                var query = new Parse.Query(settingsObject);
                query.get(id, {success: function(s){
                    defer.resolve(s);
                }, error: function(e){
                    defer.reject(e);
                }});
                return defer.promise;
            },
            refresh: function(){
                var self=this;
              var defer = $q.defer();
                Parse.User.current().fetch(function(u){
                    u.settings = self.fetchSettings().then(function(s){
                        u.settings = s;
                        defer.resolve(u);
                    });
                },
                function(e){
                    defer.reject(e);
                });

                return defer.promise;
            },
            update: function(u){
                var defer = $q.defer();
                u.save().then(function(){
                    u.settings.save();
                  defer.resolve();
                },function(e){
                    defer.reject(e);
                });
                return defer.promise;
            },
            signIn: function(email, password){
                var defer = $q.defer();
                Parse.User.logIn(email, password, {
                    success: function (user) {
                        defer.resolve(user);
                    },
                    error: function (user, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            register: function(email,password,company){
                var defer = $q.defer();
                var user = new Parse.User();
                user.set("email", email);
                user.set("password", password);
                user.set("username",email);

                var settings = new settingsObject();
                settings.set("company", company);
                user.set("settings", settings);

                user.signUp(null, {success: function(u){
                    defer.resolve(u);
                },
                error: function(u, e){
                  defer.reject(e);
                }})

                return defer.promise;

            }
        }

    })
    .factory('ParseOrderService', function ($q) {
        var itemObject = Parse.Object.extend("Item");
        var orderObject = Parse.Object.extend("Order");

        var private_acl = new Parse.ACL();
        // give write access to the current user
        if(Parse.User.current()){
            private_acl.setWriteAccess(Parse.User.current(), true);
            private_acl.setReadAccess(Parse.User.current(), true);
        }

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

    .factory('ParseProductService',function ($q, Parse) {

        var private_acl = new Parse.ACL();
        // give write access to the current user
        if(Parse.User.current()){
            private_acl.setWriteAccess(Parse.User.current(), true);
            private_acl.setReadAccess(Parse.User.current(), true);
        }

        var productObject = Parse.Object.extend("Product");
        Parse.defineAttributes(productObject, ["name","description", "price", "can_order", "photo", "photos"]);

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
            },
            create: function (productRequest) {
                var defer = $q.defer();
                var Product = new productObject();
                Product.setACL(private_acl);

                // strip items from the orderRequest.
                productRequest.user = Parse.User.current();
                for(var key in productRequest){
                    Product.set(key, productRequest[key]);
                }
                Product.id = productRequest.id;

                // stripAngularStuff(productRequest);

                Product.save(null, {
                    success: function (productResult) {
                        defer.resolve(productResult);
                        /*var itemsRequest = [];
                        angular.forEach(items, function(item){
                            item.order = orderResult;
                            item.price = item.product.get("price");
                            item.photo = item.product.get("photo");
                            console.log(item);
                            var Item = new itemObject(item);
                            Item.setACL(private_acl);
                            itemsRequest.push(Item);

                        });*/
                        /*Parse.Object.saveAll(itemsRequest, {
                            success: function(objs){
                                orderResult.set("items",itemsRequest);
                                orderResult.save();
                                defer.resolve(orderResult);
                            },
                            error: function(error){
                                defer.reject(error);

                            }
                        })*/
                    }, error: function (orderResult, error,a,b,c) {
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