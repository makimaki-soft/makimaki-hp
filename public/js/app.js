// ---------------------------------------------------------
// 共通変数
// ---------------------------------------------------------
//var dbname = "/blog/"; // blogデータの参照先
var dbname = "/blog/"; // blogデータの参照先
var articles = []; // blog記事

var preTohljs = function(str) {
    var replacedStr = str.replace(/<pre><code>/g, "<div hljs>");
    replacedStr = replacedStr.replace(/<\u002fcode><\u002fpre>/g, "<\u002fdiv>");
    return replacedStr;

    var replacedStr = "";
    if(!reverse) {
        replacedStr = str.replace(/<div hljs="">/g, "<pre><code>");
        replacedStr = replacedStr.replace(/<\u002fdiv>/g, "<\u002fcode><\u002fpre>");
    } else {
        replacedStr = str.replace(/<pre><code>/g, "<div hljs>");
        replacedStr = replacedStr.replace(/<\u002fcode><\u002fpre>/g, "<\u002fdiv>");
    }
    return replacedStr;
}

// ---------------------------------------------------------
// ルーティング
// ---------------------------------------------------------
var app = angular.module('hpApp',['ngSanitize', 'ngRoute', 'btford.markdown', 'hljs'])
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
// config
// ---------------------------------------------------------
app.config(function (hljsServiceProvider) {
  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    //tabReplace: '    '
  });
});

app.directive('bindHtmlCompile', ['$compile', function ($compile) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(function () {
        return scope.$eval(attrs.bindHtmlCompile);
      }, function (value) {
        // Incase value is a TrustedValueHolderType, sometimes it
        // needs to be explicitly called into a string in order to
        // get the HTML string.
        element.html(value && value.toString());
        // If scope is provided use it, otherwise use parent scope
        var compileScope = scope;
        if (attrs.bindHtmlScope) {
          compileScope = scope.$eval(attrs.bindHtmlScope);
        }
        $compile(element.contents())(compileScope);
      });
    }
  };
}]);

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
        firebase.database().ref(dbname + $scope.id).once('value').then(function(snapshot) {
            article = snapshot.val();

            // body内のコードがハイライトするように
            article.body = preTohljs(article.body);
            console.log(article);

            $scope.article = article;
            $scope.$apply();

            // view にセット
            document.querySelector("section.blog-detail").style.display = "block";
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
