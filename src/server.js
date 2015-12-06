const WebSocketServer = require('ws').Server;
const Rx = require('rx');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log('Server listening on', PORT);

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

const messages$ = activeSockets$
  .flatMap(sockets => Rx.Observable.from(sockets))
  .flatMap(socket => Rx.Observable.fromEvent(socket, 'message'))

activeSockets$
  .combineLatest(messages$, (sockets, message) => (() => sockets.forEach(socket => socket.send(message))))
  .sample(messages$)
  .subscribe(sendAll => sendAll());
