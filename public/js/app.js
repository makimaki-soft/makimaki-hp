var app = angular.module('hpApp',[]);
// ---------------------------------------------------------
// 右上のメニューの表示
// ---------------------------------------------------------
app.controller('headerController',function($scope){

    $scope.onclick = function() {
        console.log("test");
        $("header ul.nav").toggle();
        $("header div.logosp p").toggle();
    }
});