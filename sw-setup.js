window.addEventListener('load', function onload(event) {
  navigator.serviceWorker
    .register('/serviceworker.js')
    .then(initialiseState)
});

function initialiseState() {
  navigator.serviceWorker.ready
    .then(function getSubscription(registration) {
      return registration.pushManager.subscribe({userVisibleOnly: true});
    })
    .catch(subscription => console.log(subscription));
}

function subscriptionExists(subscription) {
  if(! subscription) {
    console.log('subscription not exists');
    return Promse.reject();
  }

  console.log('subscription exists');
  return Promse.resolve(subscription);
}
