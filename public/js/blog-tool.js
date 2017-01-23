// ---------------------------------------------------------
// blog cms
// ---------------------------------------------------------
app.controller('blogToolController', ['$scope', function($scope) {

    $scope.login_show_flag = true;
    $scope.show_flag = false;
    $scope.show_flag_index = false;
    $scope.show_flag_add = false;
    $scope.show_flag_edit = false;

    $scope.index_status = "active";
    $scope.add_status = "nonactive";

    // noindexのメタタグを付与
    var meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex');
    document.getElementsByTagName('head')[0].appendChild(meta);

    // ログイン
    $scope.login = function() {
        console.log($scope.email);
        console.log($scope.pw);

        // ----- 認証
        firebase.auth().signInWithEmailAndPassword($scope.email, $scope.pw).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            console.log(errorCode + ":" + errorMessage);
        });

        var user = firebase.auth().currentUser;

        if (user) {
          // User is signed in.
          console.log(user);
          $scope.login_show_flag = false;
          $scope.show_flag_index = true;
          $scope.index();
        } else {
          // No user is signed in.
          console.log("login error.");
        }
    }

    $scope.changeMode = function(mode) {
        console.log(mode);

        switch(mode) {
            case "index":
                $scope.show_flag_index = true;
                $scope.show_flag_add = false;
                $scope.show_flag_edit = false;

                $scope.index_status = "active";
                $scope.add_status = "nonactive";

                $scope.index();
                break;

            case "add":
                $scope.show_flag_index = false;
                $scope.show_flag_add = true;
                $scope.show_flag_edit = false;

                $scope.index_status = "nonactive";
                $scope.add_status = "active";
                break;

            case "edit":
                $scope.show_flag_index = false;
                $scope.show_flag_add = false;
                $scope.show_flag_edit = true;

                $scope.index_status = "nonactive";
                $scope.add_status = "nonactive";
                break;
        }
    }

    $scope.index = function() {
        firebase.database().ref(dbname).once('value').then(function(snapshot) {
            var articles = snapshot.val();
            // 配列に変換
            var ary_articles = $.map(articles, function(value, index) {
                return value;
            });

            // view にセット
            $scope.articles = ary_articles;
            $scope.$apply();
        });
    }

    $scope.add = function() {

        // 保存先のkeyを取得
        var newPostKey = firebase.database().ref().child(dbname).push().key;

        // 登録日を取得
        var date = new Date();
        var unixTimestamp = date.getTime();

        // ポストデータ生成
        var postData = {
            id: newPostKey,
            title: $scope.title,
            body: document.querySelector("#body").innerHTML,
            description: $scope.description,
            tags: $scope.tags,
            thumbnail: $scope.thumbnail,
            updatetime: unixTimestamp
        };
        console.log(postData);

        regist(newPostKey, postData);
    }

    $scope.goEditView = function(id) {
        $scope.changeMode("edit");
        console.log(id);
        firebase.database().ref(dbname + id).once('value').then(function(snapshot) {
            var article = snapshot.val();
            console.log(article);

            $scope.id = article.id;
            $scope.title = article.title;
            $scope.tags = article.tags;
            $scope.md = toMarkdown(article.body);
            $scope.description = article.description;
            $scope.thumbnail = article.thumbnail;
            $scope.$apply();
        });
    }

    $scope.edit = function() {

        // 登録日を取得
        var date = new Date();
        var unixTimestamp = date.getTime();

        // ポストデータ生成
        var postData = {
            id: $scope.id,
            title: $scope.title,
            body: document.querySelector("#body").innerHTML,
            description: $scope.description,
            tags: $scope.tags,
            thumbnail: $scope.thumbnail,
            updatetime: unixTimestamp
        };
        console.log(postData);

        regist($scope.id, postData);
    }

    // 登録
    var regist = function(postKey, postData) {
        var updates = {};
        updates[dbname + postKey] = postData;
        firebase.database().ref().update(updates).then(function(){
            console.log("end");
            $scope.changeMode("index");
        },
        function(error){
            console.log("error:" + error);
        });
    }

    var preTohljs = function(str, reverse) {
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
}]);
