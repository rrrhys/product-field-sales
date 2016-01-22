angular.module('starter.controllers', ['starter.services'])

    .controller('SplashCtrl', function($scope,$location){
        $scope.$on('$ionicView.enter', function(){
            console.log("fired");
            window.setTimeout(function(){
                console.log("redir");
                $location.path("/app/orders");
            },500);
        });

    })

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, ParseProductService, LocalStorageService) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        // Form data for the login modal

        $scope.fillItemsWithProducts = function (order, callback) {
            if ($scope.allProducts.length == 0) {
                $scope.pendingFillsTimeoutID = window.setTimeout(function () {
                    $scope.fillItemsWithProducts(order, callback)
                }, 500);
            }
            else {
                angular.forEach(order.items, function (item) {
                    item.product = null;
                    for (var i = 0; i < $scope.allProducts.length; i++) {
                        if ($scope.allProducts[i].id == item.product_id) {
                            item.product = $scope.allProducts[i];
                            console.log("filled");
                            break;
                        }
                    }
                });
                window.clearTimeout($scope.pendingFillsTimeoutID);
                if (callback) {
                    callback();
                }
            }

        };

        $scope.loadProducts = function () {
            ParseProductService.query().then(function (p) {
                $scope.allProducts = p;
            });
        };

        $scope.loadPendingOrder = function () {
            $scope.pendingOrder = LocalStorageService.getData('pendingOrder') || {
                    items: [],
                    started_at: null,
                    order_checking_out: false
                };
        };

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.modal.show();
        };

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            console.log('Doing login', $scope.loginData);
            debugger;
            Parse.User.logIn($scope.loginData.username, $scope.loginData.password, {
                success: function (user) {
                    $scope.currentUser = user;
                    LocalStorageService.setData("user", user);
                },
                error: function (user, error) {
                    alert(error);
                }
            });

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function () {
                $scope.closeLogin();
            }, 1000);
        };

        $scope.showDebugMessages = false;
        $scope.currentUser = LocalStorageService.getData("user");
        $scope.allProducts = [];
        $scope.loginData = {};
        $scope.pendingFillsTimeoutID = null;


        $scope.loadPendingOrder();
        $scope.loadProducts();


    })

    .controller('OrdersCtrl', function ($scope, $location, ParseOrderService) {

        $scope.getOrders = function (callback) {
            ParseOrderService.query().then(function (o) {
                $scope.orders = o;
            });
            if (callback) {
                callback();
            }
        };

        $scope.doRefresh = function () {
            $scope.getOrders(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.goNewOrder = function () {
            $location.path('/app/orders/create');
        };

        $scope.getOrders();


    })

    .controller('OrderCreateCtrl', function ($scope, $location, LocalStorageService, ParseOrderService, $ionicLoading, $ionicPopup) {

        $scope.$on('$ionicView.enter', function(){
            console.log("ran totals");
            $scope.loadProducts();
            $scope.pendingOrder.price_total = 0;

            $scope.fillItemsWithProducts($scope.pendingOrder, function () {
                angular.forEach($scope.pendingOrder.items, function (item) {
                    $scope.pendingOrder.price_total += item.product ? (item.product.get('price') * item.quantity) : 0;
                });

                console.log($scope.pendingOrder.price_total);
            });
        });



        $scope.myGoBack = function () {
            $ionicHistory.goBack();
        };

        $scope.goProducts = function () {
            $location.path('/app/products').replace();
        };

        $scope.returnToOrder = function () {
            $scope.pendingOrder.order_checking_out = false;
            LocalStorageService.setData('pendingOrder', $scope.pendingOrder);
        }

        $scope.discardOrder = function () {
            if (confirm("Are you sure?")) {
                LocalStorageService.removeData('pendingOrder');
                $scope.loadPendingOrder();
            }
        }

        $scope.checkoutOrder = function () {
            // transition from 'looking at order' to 'entering details to finalise order'
            $scope.pendingOrder.order_checking_out = true;
            LocalStorageService.setData('pendingOrder', $scope.pendingOrder);
        }

        $scope.saveOrder = function () {

            // send order to server for processing.

            if(
                !$scope.pendingOrder.first_name ||
                !$scope.pendingOrder.first_name ||
                $scope.pendingOrder.first_name.trim() == "" ||
                $scope.pendingOrder.last_name.trim() == ""

            ){
                var alertPopup = $ionicPopup.alert({
                    title: 'Enter customer details',
                    template: 'You need to enter customer details before submitting the order.'
                });
                alertPopup.then(function(res) {
                    console.log('Thank you for not eating my delicious ice cream cone');
                });
            }
            else{
                $ionicLoading.show({
                    template: 'Loading...'
                });
                ParseOrderService.create($scope.pendingOrder).then(function (o) {
                    $ionicLoading.hide();
                    $location.path('/app/orders/placed/' + o.id);
                });
            }


        }

    })

    .controller('OrderPlacedCtrl', function ($scope, $location) {
        $scope.goOrders = function(){
            $location.path('/app/orders');
        }
    })
    .controller('OrderCtrl', function ($scope, $stateParams, ParseOrderService) {
        var orderId = $stateParams.orderId;

        ParseOrderService.get(orderId).then(function (o) {
            $scope.order = o;
            $scope.fillItemsWithProducts($scope.order);
        });

        $scope.myGoBack = function () {
            $ionicHistory.goBack();
        };
    })

    .controller('ProductsCtrl', function ($scope, $location) {
        $scope.loadProducts();

        $scope.goNewProduct = function(){
            $location.path("/app/products/create")
        }
    })

    .controller('ProductCreateEditCtrl', function($scope, $stateParams, ParseProductService){
        var productId = $stateParams.productId;

        if(productId){
            // it's an existing product.
            ParseProductService.get(productId).then(function (p) {
                $scope.pendingProduct = p;
            });
        }
    })

    .controller('ProductCtrl', function ($scope, $stateParams, LocalStorageService, ParseProductService, $location) {
        var productId = $stateParams.productId;
        ParseProductService.get(productId).then(function (p) {
            $scope.product = p;
        });

        // populate a dumb object, in case it's not in current order.
        $scope.productInPendingOrder = {
            quantity: 0,
            dummy: true,
        };

        for (var i = 0; i < $scope.pendingOrder.items.length; i++) {
            if ($scope.pendingOrder.items[i].product_id == productId) {
                $scope.productInPendingOrder = $scope.pendingOrder.items[i];
                break;
            }
        }

        $scope.editProduct = function(){
            $location.path("/app/products/edit/" + productId);
        }

        $scope.addOneToCart = function () {
            var pipo = $scope.productInPendingOrder;
            if (pipo.dummy == true) {
                pipo.dummy = false;
                $scope.pendingOrder.items.push(pipo);
            }

            pipo.quantity += 1;
            pipo.product_id = productId;
            LocalStorageService.setData("pendingOrder", $scope.pendingOrder);

        }

        $scope.subtractOneFromCart = function () {
            var pipo = $scope.productInPendingOrder;
            if (pipo.dummy == true) {
                pipo.dummy = false;
                $scope.pendingOrder.items.push(pipo);
            }

            pipo.quantity -= 1;
            pipo.product_id = productId;

            if (pipo.quantity <= 0) {
                pipo.quantity = 0;

                // where is it in the items list?
                var delete_index = -1;
                angular.forEach($scope.pendingOrder.items, function (obj, i) {
                    if (obj.id == pipo.id) {
                        delete_index = i;
                    }
                });
                $scope.pendingOrder.items.splice(delete_index, 1);

            }
            LocalStorageService.setData("pendingOrder", $scope.pendingOrder);

        }

    })

    .controller('PlaylistsCtrl', function ($scope) {
        $scope.playlists = [
            {title: 'Reggae', id: 1},
            {title: 'Chill', id: 2},
            {title: 'Dubstep', id: 3},
            {title: 'Indie', id: 4},
            {title: 'Rap', id: 5},
            {title: 'Cowbell', id: 6}
        ];
    })

    .controller('PlaylistCtrl', function ($scope, $stateParams) {
    });
