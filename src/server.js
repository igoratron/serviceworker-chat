const WebSocketServer = require('ws').Server;
const Rx = require('rx');

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
  .scan(function aggregateSubs(all, sub) {
    all.push(sub);
    return all;
  }, [])
  .startWith([]);

Rx.Observable.combineLatest(
  activeSockets$,
  messages$,
  subscriptions$,
  (sockets, message, subscriptions) => (() => {
    sockets.forEach(socket => socket.send(message));
    subscriptions.forEach(sub => pushMessage(sub));
  }))
  .sample(messages$)
  .subscribe(sendAll => sendAll());

function pushMessage(subscription) {
  console.log(subscription);
}
