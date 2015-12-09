import Rx from 'rx';

export default function makePostMessageDriver() {
  return function webSocketDriver() {
    return Rx.Observable.fromEvent(window, 'message');
  }
};
