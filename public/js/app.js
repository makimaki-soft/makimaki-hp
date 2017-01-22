// ---------------------------------------------------------
// 共通変数
// ---------------------------------------------------------
//var dbname = "/blog/"; // blogデータの参照先
var dbname = "/test/"; // blogデータの参照先
var articles = []; // blog記事


var app = angular.module('hpApp',['ngSanitize', 'ngRoute', 'btford.markdown'])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
        .when('/', {
            templateUrl: 'template/home.html'
        })
        .when('/about', {
            templateUrl: 'template/about.html'
        })
        .when('/games', {
            templateUrl: 'template/games.html'
        })
        .when('/blog/:id?', {
            templateUrl: 'template/blog.html',
            controller: 'blogController'
        })
        .when('/tool/blog_cms/', {
            templateUrl: 'template/blog_cms.html',
        })
        .otherwise({
            redirectTo: '/'
        });
    }])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.hashPrefix('');
    }]);


// ---------------------------------------------------------
// カスタムフィルター
// ---------------------------------------------------------
// YYYYMMDD文字列用
app.filter('myDate', function() {
    return function(input) {
        if(!input) {
            return;
        }
        console.log(input);
        return input.substr(0, 4) + "年"
             + input.substr(4, 2) + "月"
             + input.substr(6, 2) + "日";
    }
});


// ---------------------------------------------------------
// 右上のメニューの表示
// ---------------------------------------------------------
app.controller('headerController', function($scope) {

    $scope.onclick = function() {
        $("header ul.nav").toggle();
        $("header div.logosp p").toggle();
    }
});


// ---------------------------------------------------------
// ブログ表示用
// ---------------------------------------------------------
app.controller('blogController', ['$scope', '$routeParams', function($scope, $routeParams) {

    $scope.id = $routeParams.id;
    if($scope.id){ // ----- 詳細ページ
        if(articles == []) { // ----- 記事取得済ならデータとりにいかない。
            console.log(articles);
            var article = articles[$scope.id];
            $scope.article = article;
            $scope.$apply();

            // view にセット
            document.querySelector("section.blog-detail").style.display = "block";
            hljs.initHighlightingOnLoad();
            return;
        }
        firebase.database().ref(dbname).limitToLast(10).once('value').then(function(snapshot) {
            articles = snapshot.val();
            var article = articles[$scope.id];
            console.log(article);

            $scope.article = article;
            $scope.$apply();

            // view にセット
            document.querySelector("section.blog-detail").style.display = "block";
            hljs.initHighlightingOnLoad();
        });
    }else { // ----- indexページ(パラメータ無し)
        if(articles == []) { // ----- 記事取得済ならデータとりにいかない。
            console.log(articles);
            // 配列に変換
            ary_articles = $.map(articles, function(value, index) {
                return value;
            });

            // view にセット
            $scope.articles = ary_articles;
            $scope.$apply();
            document.querySelector("section.blog").style.display = "block";
            return;
        }
        firebase.database().ref(dbname).limitToLast(10).once('value').then(function(snapshot) {
            articles = snapshot.val();
            // 配列に変換
            ary_articles = $.map(articles, function(value, index) {
                return value;
            });

            // view にセット
            $scope.articles = ary_articles;
            $scope.$apply();
            document.querySelector("section.blog").style.display = "block";
        });
    }
}]);
