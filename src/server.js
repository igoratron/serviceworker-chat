const WebSocketServer = require('ws').Server;
const Rx = require('rx');
const request = require('request');

const GCM_HOST = "https://android.googleapis.com/gcm/send";
const GCM_KEY = process.env.GCM_KEY;
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(Date(), 'Server listening on', PORT);

const connects$ = Rx.Observable.fromEvent(wss, 'connection');

const ids$ = connects$
  .map(1)
  .scan((x, y) => x + y);

const connectedSockets$ = connects$
  .zip(ids$, (socket, id) => ({socket, id}));

const disconnects$ = connectedSockets$
  .flatMap(obj =>
    Rx.Observable.fromEvent(obj.socket, 'close')
      .map({
        id: obj.id
      }));

const activeSockets$ = connectedSockets$
  .merge(disconnects$)
  .scan(function(clients, obj) {
    if(obj.socket) {
      clients.set(obj.id, obj.socket);
    } else {
      clients.delete(obj.id);
    }
    return clients;
  }, new Map())
  .map(map => Array.from(map.values()));

const envelopes$ = activeSockets$
  .flatMap(sockets => Rx.Observable.from(sockets))
  .flatMap(socket => Rx.Observable.fromEvent(socket, 'message'))
  .map(JSON.parse);

const messages$ = envelopes$
  .filter(envelope => envelope.message)
  .pluck('message');

const subscriptions$ = envelopes$
  .filter(envelope => envelope.subscription)
  .pluck('subscription')
  .scan((all, sub) => all.add(sub), new Set())
  .map(subs => Array.from(subs.values()))
  .startWith([]);

Rx.Observable.combineLatest(
  activeSockets$,
  messages$,
  subscriptions$,
  (sockets, message, subscriptions) => (() => {
    sockets.forEach(socket => socket.send(message));
    pushMessage(subscriptions);
  }))
  .sample(messages$)
  .subscribe(sendAll => sendAll());

function pushMessage(subscriptions) {
  const regIds = subscriptions.map(sub => sub.replace(GCM_HOST+'/', ''));

  request.post({
    url: GCM_HOST,
    headers: {
      'Authorization': `key=${GCM_KEY}`,
      'Content-Type': 'application/json'
    },
    json: true,
    body: {
      'registration_ids': regIds
    }
  }, function pushMessageSent(error, response, body) {
    console.log(body);
  });
}
