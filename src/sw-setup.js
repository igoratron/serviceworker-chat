

// =========== HELPERS =============

function either(promiseFn1, promiseFn2) {
  return promiseFn1().then(function (value) {
    if(value) {
      return value;
    }

    return promiseFn2();
  });
}

function sendSubscriptionToServer(subscription) {
  window.postMessage(subscription.endpoint, '*');
}
