var charityApp = angular.module('charityApp', ['ui.router', 'ngCookies']);


charityApp.config(function ($stateProvider, $urlRouterProvider) {


    $urlRouterProvider.otherwise('/login');

    $stateProvider

        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'loginController'

        })

        .state('cause', {
            url: '/charity?cId',
            templateUrl: 'charity-dashboard.html',
            controller: 'charityController',
            params:{cId:null},
            resolve: {authenticate: authenticate}
        })

        .state('create', {
            url: '/create-cause',
            templateUrl: 'create.html',
            controller: 'createController',
            resolve: {authenticate: adminAuthenticate}
        })

        .state('admin', {
            url: '/admin',
            templateUrl: 'admin.html',
            controller: 'adminController',
            resolve: {authenticate: adminAuthenticate}

        })
});

function authenticate($q, $http, $state, $timeout, $cookies) {
    var username = $cookies.get("username");
    var password = $cookies.get("password");

    if (username != null && password != null) {

        $http({
            method: 'POST',
            url: 'http://128.199.178.5:8080/charityback/charity-api/login',
            data: {
                "username": username,
                "password": password
            },
            transformResponse: []
        }).then(function successCallback(response) {
            return $q.when()
        }, function errorCallback(response) {
            alert("Fail");
            // The next bit of code is asynchronously tricky.

            $timeout(function () {
                // This code runs after the authentication promise has been rejected.
                // Go to the log-in page
                $state.go('login')
            });

            // Reject the authentication promise to prevent the state from loading
            return $q.reject()
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });


    } else {
        $state.go('login')

    }
}

function adminAuthenticate($q, $http, $state, $timeout, $cookies) {
    var username = $cookies.get("username");
    var password = $cookies.get("password");

    if (username != null && password != null) {

        $http({
            method: 'POST',
            url: 'http://128.199.178.5:8080/charityback/charity-api/login',
            data: {
                "username": username,
                "password": password
            },
            transformResponse: []
        }).then(function successCallback(response) {
            if (response.data == 1) {
                return $q.when()
            } else {
                $state.go('login')
            }
        }, function errorCallback(response) {
            alert("Fail");
            // The next bit of code is asynchronously tricky.

            $timeout(function () {
                // This code runs after the authentication promise has been rejected.
                // Go to the log-in page
                $state.go('login')
            });

            // Reject the authentication promise to prevent the state from loading
            return $q.reject()
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });


    } else {
        $state.go('login')

    }

}

charityApp.controller('adminController', function ($scope, $http, $state, $cookies) {

    $http({
        method: 'GET',
        url: 'http://128.199.178.5:8080/charityback/charity-api/get-causes/?cause='
    }).then(function successCallback(response) {
        $scope.causes = response.data;


    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.logout = function () {

        $cookies.remove("key");
        $cookies.remove("username");
        $cookies.remove("password")
        $state.go('login')

    };
    $scope.create = function () {

        $state.go('create')

    };

});

charityApp.controller('createController', function ($scope, $http, $state, $cookies) {

    var fd = new FormData();
    $scope.createCause = function () {
        $http({
            method: 'POST',
            url: "http://128.199.178.5:8080/charityback/charity-api/upload/?keyword=" + $scope.keyw,
            data: fd,
            headers: {'Content-Type': undefined},
            transformResponse: []
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.imgDirector = response.data;
            $scope.imageDirss = $scope.imgDirector.replace('/var/www/html/', 'http://128.199.178.5/');

            $scope.imageDirs = $scope.imageDirss.replace('"', '');
            $scope.imageDirsss =  $scope.imageDirs.replace('"', '');
            $scope.imageDir = $scope.imageDirsss.replace(' ',  '%20');

            $http({
                method: 'POST',
                url: 'http://128.199.178.5:8080/charityback/charity-api/new-cause/',
                data: {
                    "imgDir": $scope.imageDir,
                    "info": $scope.info,
                    "keyword": $scope.keyw,
                    "name": $scope.name,
                    "owner": $scope.owner,
                    "ownerPhone": $scope.ownerphone,
                    "password": $scope.password,
                    "username": $scope.username
                }
            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');
                $state.go('admin');

            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        });
    };

        $scope.uploadFiles = function (files) {
            //Take the first selected file
            fd.append("file", files[0]);

        };

        $scope.logout = function () {

            $cookies.remove("key");
            $cookies.remove("username");
            $cookies.remove("password")
            $state.go('login')

        };
        $scope.home = function () {

            $state.go('admin')

        };
});

charityApp.controller('charityController', function ($scope, $http, $state, $cookies, $stateParams) {

    if ($cookies.get('key')==1) {

        $scope.cause = $stateParams.cId;
        $scope.disabled = false;
    }else{
        $scope.disabled = true;
        $scope.cause = $cookies.get('key');
    }
    var fd = new FormData();
    var fdstatus = false;


    $http({
        method: 'GET',
        url: 'http://128.199.178.5:8080/charityback/charity-api/get-donations/?keyword=' + $scope.cause
    }).then(function successCallback(response) {
        $scope.donations = response.data;
        $scope.totalDonations = $scope.donations.totalDonations;
        $scope.totalDonors = $scope.donations.totlDonors;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $http({
        method: 'GET',
        url: 'http://128.199.178.5:8080/charityback/charity-api/get-causes/?cause=' + $scope.cause
    }).then(function successCallback(response) {
        $scope.keyw = response.data.keyword;
        $scope.activestatus = response.data.activeStatus;
        $scope.name = response.data.name;
        $scope.owner = response.data.owner;
        $scope.info = response.data.info;
        $scope.ownerphone = response.data.ownerPhone;
        $scope.username = response.data.username;
        $scope.password = response.data.password;
        $scope.imageDir = response.data.imgDir;
        $scope.donors = response.data.totalDonors;
        $scope.donations = response.data.totalDonations;
    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.editCause = function () {

        if (fdstatus == false) {

            $http({
                method: 'POST',
                url: 'http://128.199.178.5:8080/charityback/charity-api/edit-cause/',
                data: {
                    "activeStatus": $scope.activestatus,
                    "imgDir": $scope.imageDir,
                    "info": $scope.info,
                    "keyword": $scope.keyw,
                    "name": $scope.name,
                    "owner": $scope.owner,
                    "ownerPhone": $scope.ownerphone,
                    "password": $scope.password,
                    "username": $scope.username
                }
            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');

                location.reload();

            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        } else {
            $http({
                method: 'POST',
                url: "http://128.199.178.5:8080/charityback/charity-api/upload/?keyword=" + $scope.cause,
                data: fd,
                headers: {'Content-Type': undefined},
                transformResponse: []
            }).then(function successCallback(response) {
                console.log(response.data);
                $scope.imgDirector = response.data;
                $scope.imageDirss = $scope.imgDirector.replace('/var/www/html/', 'http://128.199.178.5/');

                $scope.imageDirs = $scope.imageDirss.replace('"', '');
                $scope.imageDirsss =  $scope.imageDirs.replace('"', '');
                $scope.imageDir = $scope.imageDirsss.replace(' ',  '%20');

                console.log($scope.imageDir);
                $http({
                    method: 'POST',
                    url: 'http://128.199.178.5:8080/charityback/charity-api/edit-cause/',
                    data: {
                        "activeStatus": $scope.activestatus,
                        "imgDir": $scope.imageDir,
                        "info": $scope.info,
                        "keyword": $scope.keyw,
                        "name": $scope.name,
                        "owner": $scope.owner,
                        "ownerPhone": $scope.ownerphone,
                        "password": $scope.password,
                        "username": $scope.username
                    }
                }).then(function successCallback(response) {
                    alert('Databases Successfully Updated');
                    location.reload();

                }, function errorCallback(response) {
                    // The next bit of code is asynchronously tricky.
                    alert("We encountered an error while saving your information.");
                    console.log(response)
                });
            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("Login Failed, Please try again");
                console.log(response)

            });//Image Upload request
            //On Success of Image Upload - Edit cause request

        }


    };

    $scope.logout = function () {

        $cookies.remove("key");
        $cookies.remove("username");
        $cookies.remove("password")
        $state.go('login')


    };

    $scope.generateReport = function () {
        $http({
            method: 'GET',
            url: 'http://128.199.178.5:8080/charityback/charity-api/gen-report/?keyWord=' + $scope.cause + '&month=' + $scope.month + '&year=' + $scope.year
        }).then(function successCallback(response) {
            $scope.report = response.data;

            console.log($scope.report);
            var chargingLog = [];
            chargingLog = response.data.chargingLog;
            if (chargingLog.length === 0) {
                alert("There are no records for this time period in our databases")
            } else {
                var x = new CSVExport(chargingLog, "Report-" + $scope.cause + "_" + $scope.month + "-" + $scope.year);
                console.log(chargingLog);
            }
        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while generating your report.");
            console.log(response)

        });

    }

    $scope.uploadFile = function (files) {
        //Take the first selected file
        fd.append("file", files[0]);
        fdstatus = true;

    };

});


charityApp.controller('loginController', function ($scope, $http, $cookies, $state) {


    $scope.login = function () {
        $http({
            method: 'POST',
            url: 'http://128.199.178.5:8080/charityback/charity-api/login',
            data: {
                "username": $scope.username,
                "password": $scope.password
            },
            transformResponse: []
        }).then(function successCallback(response) {
            $scope.key = response.data;

            $cookies.put("key", $scope.key);
            $cookies.put("username", $scope.username);
            $cookies.put("password", $scope.password);


            if ($scope.key == 1) {
                $state.go('admin')
            } else {
                $state.go('cause')
            }


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("Login Failed, Please try again");
            console.log(response)

        });

    }


});





