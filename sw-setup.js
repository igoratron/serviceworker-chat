window.addEventListener('load', function onload(event) {
  navigator.serviceWorker
    .register('serviceworker.js')
    .then(function getSubscription(registration) {
      return registration.pushManager.subscribe({userVisibleOnly: true});
    })
});

function subscriptionExists(subscription) {
  if(! subscription) {
    console.log('subscription not exists');
    return Promse.reject();
  }

  console.log('subscription exists');
  return Promse.resolve(subscription);
}
