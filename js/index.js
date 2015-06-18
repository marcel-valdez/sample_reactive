$(document).ready(function() {
  var GITHUB_USERS_URL = 'https://api.github.com/users';

  var refreshButton = document.querySelector('.refresh');
  var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

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
