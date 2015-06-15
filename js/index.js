$(document).ready(function() {
  var GITHUB_USERS_URL = 'https://api.github.com/users';
  var NEW_USER_BATCH = "__user__batch__";
  // var requestStream = Rx.Observable.just('https://api.github.com/users');
  // requestStream.subscribe(function(requestUrl) {
  //   var responseStream = Rx.Observable.create(function(observer) {
  //     $.getJSON(requestUrl)
  //      .done(function (response) {
  //        observer.onNext(response);
  //      })
  //      .fail(function (jqXHR, status, error) {
  //        observer.onError(error);
  //      })
  //      .always(function () {
  //        observer.onCompleted();
  //      });
  //   };
  // });


  var refreshButton = document.querySelector('.refresh');
  var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

  // var requestOnRefreshStream = refreshClickStream
  //   .map(function () {
  //     var randomOffset = Math.floor(Math.random() * 500);
  //     return 'https://api.github.com/users?since=' + randomOffset;
  //   });

  // var startupRequestStream = Rx.Observable.just('https://api.github.com/users');

  // var requestStream = Rx.Observable.merge(
  //   requestOnRefreshStream, startupRequestStream
  // );

  var randomOffset = function () {
    return Math.floor(Math.random() * 500);
  };

  var requestStream = refreshClickStream
    .map(function() {
      return  GITHUB_USERS_URL + '?since=' + randomOffset();
    })
    .startWith(GITHUB_USERS_URL);

  var responseStream = requestStream
    .flatMap(function (requestUrl) {
      return Rx.Observable.fromPromise($.getJSON(requestUrl));
    });

  // Based on a whole user stream batch, it produces a stream that contains
  // three user entries on each 'propagation'.
  var userStream = responseStream
    .flatMap(function(response) {
      return Rx.Observable.create(function(observer) {
        observer.onNext(_.sample(response, 3));
      });
    });

  // Leaf stream listener that sets the user entries to the .response textbox
  // on each propagation.
  userStream.subscribe(function (users) {
    var content = _.reduce(users, function(memo, user) {
      return memo + "\n" + user.login + ": " + user.html_url;
    }, "");
    $(".response").text(content);
  });
});