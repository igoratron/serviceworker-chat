self.addEventListener('push', function onpush(event) {
  event.waitUntil(
    self.registration.showNotification('Awesome chat!', {
      body: `You've got new message!`
    })
  );
});
