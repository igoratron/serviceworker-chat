import Rx from 'rx';

export default function makeWebSocketDriver(url) {
  const ws = new WebSocket(url);
  const open$ = Rx.Observable.fromEvent(ws, 'open');
  return function webSocketDriver(outgoing$) {
    outgoing$
      .skipUntil(open$)
      .subscribe(message => ws.send(message));
    return Rx.Observable.fromEvent(ws, 'message')
      .pluck('data');
  }
};
