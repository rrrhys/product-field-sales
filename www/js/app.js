// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic-material', 'starter.controllers'])


    .directive("itemInOrder", function () {
        return {
            templateUrl: "templates/directives/itemInOrder.html"
        };
    })


    .directive("itemInProducts", function () {
        return {
            templateUrl: "templates/directives/itemInProducts.html"
        };
    })

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {

            // Initialize Parse
            Parse.initialize(ENV.parse_app, ENV.parse_js_key);

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

            .state('app.products', {
                url: '/products',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/products.html',
                        controller: 'ProductsCtrl'
                    }
                }
            })

            .state('app.product-create', {
                url: '/products/create',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/product_create_edit.html',
                        controller: 'ProductCreateEditCtrl'
                    }
                }
            })

            .state('app.product-edit', {
                url: '/products/edit/:productId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/product_create_edit.html',
                        controller: 'ProductCreateEditCtrl'
                    }
                }
            })

            .state('app.product', {
                url: '/products/:productId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/product.html',
                        controller: 'ProductCtrl'
                    }
                }
            })

            .state('app.orders', {
                url: '/orders',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/orders.html',
                        controller: 'OrdersCtrl'
                    }
                }
            })

            .state('app.order-create', {
                url: '/orders/create',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/order_create.html',
                        controller: 'OrderCreateCtrl'
                    }
                }
            })

            .state('app.order', {
                url: '/orders/:orderId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/order.html',
                        controller: 'OrderCtrl'
                    }
                }
            })

            .state('app.order-placed', {
                url: '/orders/placed/:orderId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/order_placed.html',
                        controller: 'OrderPlacedCtrl'
                    }
                }
            })

        .state('splash', {
            url: '/',
                templateUrl: 'templates/splash.html',
                controller: 'SplashCtrl'
        })
            .state('onboarding', {
                url: '/onboard',
                templateUrl: 'templates/onboard.html',
                controller: 'OnboardCtrl'
            })
        ;
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/');
    });
