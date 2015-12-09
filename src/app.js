import Rx from 'rx';
import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';
import Helpers from 'hyperscript-helpers';

const {div, ul, li} = Helpers(h);

import makeWebSocketDriver from './cycle-websocket-driver';
import messageInput from './message-input.js';

function intent(DOM, ws) {
  return {
    newMessage$: DOM.select('.js-message-input')
      .events('newmessage')
      .pluck('detail'),
    messageReceived$: ws
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

function main({DOM, ws}) {
  const actions = intent(DOM, ws);

  const requests = {
    DOM: view(model(actions.messageReceived$)),
    ws: actions.newMessage$
  };

  return requests;
}

const drivers = {
  DOM: makeDOMDriver('[data-js-app]', {
    'message-input': messageInput
  }),
  ws: makeWebSocketDriver('wss://ws.igormatics.com/ws')
};

Cycle.run(main, drivers);
