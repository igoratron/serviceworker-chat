window.addEventListener('load', function onload() {
  navigator.serviceWorker
    .register('/serviceworker.js')
    .then(registration =>
      either(
        () => registration.pushManager.getSubscription(),
        () => registration.pushManager.subscribe({userVisibleOnly: true})
      )
    )
    .then(subscription => sendSubscriptionToServer(subscription));
});


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
