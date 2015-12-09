import Rx from 'rx';
import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';
import Helpers from 'hyperscript-helpers';

const {div, ul, li} = Helpers(h);

import makeWebSocketDriver from './cycle-websocket-driver';
import makePostMessageDriver from './cycle-postmessage-driver';
import messageInput from './message-input.js';

function intent(DOM, ws, postMessage) {
  return {
    newMessage$: DOM.select('.js-message-input')
      .events('newmessage')
      .pluck('detail')
      .map(message => ({ message })),
    messageReceived$: ws,
    subscription$: postMessage
      .pluck('data')
      .map(subscription => ({ subscription }))
  };
}

function model(messageReceived$) {
  return messageReceived$
    .scan((messages, msg) => {
      messages.push(msg)
      return messages;
    }, [])
    .startWith([]);
}

function view(state$) {
  return state$.map(messages =>
    div([
      h('message-input.js-message-input'),
      ul(
        messages.map(content => li([content]))
      )
    ])
  );
}

function main({DOM, ws, postMessage}) {
  const actions = intent(DOM, ws, postMessage);

  const requests = {
    DOM: view(model(actions.messageReceived$)),
    ws: Rx.Observable.merge(
      actions.newMessage$,
      actions.subscription$
    ).map(JSON.stringify)
  };

  return requests;
}

const drivers = {
  DOM: makeDOMDriver('[data-js-app]', {
    'message-input': messageInput
  }),
  //ws: makeWebSocketDriver('wss://ws.igormatics.com/ws'),
  ws: makeWebSocketDriver('ws://localhost:8081'),
  postMessage: makePostMessageDriver()
};

Cycle.run(main, drivers);
