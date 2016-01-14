



angular.module('starter.controllers', ['starter.services'])




    .controller('AppCtrl', function($scope, $ionicModal, $timeout, ProductService, LocalStorageService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal


  $scope.allProducts = ProductService.query();
  $scope.pendingFills = null;
      $scope.fillItemsWithProducts = function(order){
        if($scope.allProducts.length == 0){
          $scope.pendingFills = window.setTimeout(function(){$scope.fillItemsWithProducts(order)},500);
        }
        else{
          angular.forEach(order.items, function(item){
            item.product= null;
            for(var i = 0; i < $scope.allProducts.length; i++){
              if($scope.allProducts[i].id == item.product_id){
                item.product = $scope.allProducts[i];
                console.log("filled");
                break;
              }
            }
          });
          window.clearTimeout($scope.pendingFills);
        }

      };

      $scope.loadPendingOrder = function(){
        $scope.pendingOrder = LocalStorageService.getData('pendingOrder') || {items: [], started_at: null, order_checking_out:false};
      };

  $scope.loginData = {};
      $scope.loadPendingOrder();

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

    .controller('OrdersCtrl', function($scope, $location, OrderService){
      $scope.orders = OrderService.query();

      $scope.goNewOrder = function(){
        $location.path('/app/orders/create');
      }
    })

    .controller('OrderCreateCtrl', function($scope, $location, LocalStorageService){
      $scope.fillItemsWithProducts($scope.pendingOrder);
      $scope.price_total = 0;
      angular.forEach($scope.pendingOrder.items, function(item){
        $scope.price_total += item.product.price * item.quantity;
      });

      $scope.myGoBack = function() {
        $ionicHistory.goBack();
      };

      $scope.goProducts = function(){
        $location.path('/app/products').replace();
      }

      $scope.discardOrder = function(){
        if(confirm("Are you sure?")){
          LocalStorageService.removeData('pendingOrder');
          $scope.loadPendingOrder();
        }
      }

      $scope.checkoutOrder = function(){
        $scope.pendingOrder.order_checking_out = true;
        LocalStorageService.setData('pendingOrder', $scope.pendingOrder);
      }

    })

    .controller('OrderCtrl', function($scope, $stateParams, OrderService) {
      var orderId = parseInt($stateParams.orderId);
      $scope.order = OrderService.get({order: orderId}, function(){
        // fill the order items with the actual products.
        $scope.fillItemsWithProducts($scope.order);


      });




      $scope.myGoBack = function() {
        $ionicHistory.goBack();
      };
    })

    .controller('ProductsCtrl', function($scope, ProductService){
      $scope.products = ProductService.query();
    })

    .controller('ProductCtrl', function($scope, $stateParams, ProductService, LocalStorageService) {
      var productId = parseInt($stateParams.productId);
      $scope.product = ProductService.get({product: productId});

      // populate a dumb object, in case it's not in current order.
      $scope.productInPendingOrder = {
        quantity: 0,
        dummy: true,
      }

      for(var i = 0; i < $scope.pendingOrder.items.length; i++){
        if($scope.pendingOrder.items[i].product_id == productId){
          $scope.productInPendingOrder = $scope.pendingOrder.items[i];
          break;
        }
      }

      $scope.addOneToCart = function(){
        var pipo = $scope.productInPendingOrder;
        if(pipo.dummy == true){
          pipo.dummy = false;
          $scope.pendingOrder.items.push(pipo);
        }

        pipo.quantity +=1;
        pipo.product_id = productId;
        LocalStorageService.setData("pendingOrder", $scope.pendingOrder);

      }

      $scope.subtractOneFromCart = function(){
        var pipo = $scope.productInPendingOrder;
        if(pipo.dummy == true){
          pipo.dummy = false;
          $scope.pendingOrder.items.push(pipo);
        }

        pipo.quantity -=1;
        pipo.product_id = productId;

        if(pipo.quantity <= 0){
          pipo.quantity = 0;

          // where is it in the items list?
          var delete_index = -1;
          angular.forEach($scope.pendingOrder.items, function(obj,i){
            if(obj.id == pipo.id){
              delete_index = i;
            }
          });
          $scope.pendingOrder.items.splice(delete_index,1);

        }
        LocalStorageService.setData("pendingOrder", $scope.pendingOrder);

      }

    })

    .controller('PlaylistsCtrl', function($scope) {
      $scope.playlists = [
        { title: 'Reggae', id: 1 },
        { title: 'Chill', id: 2 },
        { title: 'Dubstep', id: 3 },
        { title: 'Indie', id: 4 },
        { title: 'Rap', id: 5 },
        { title: 'Cowbell', id: 6 }
      ];
    })

    .controller('PlaylistCtrl', function($scope, $stateParams) {
    });
