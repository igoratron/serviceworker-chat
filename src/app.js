import Rx from 'rx';
import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';

import makeWebSocketDriver from './cycle-websocket-driver';

function intent(DOM, ws) {
  const sendClicks$ = DOM.select('[data-js-send]')
    .events('click');
  const messageText$ = DOM.select('[data-js-text]')
    .events('input')
    .map(event => event.target.value);

  return {
    messageSent$: messageText$.sample(sendClicks$)
    messageReceived$: ws
  };
}

function view(state$) {
  return $state.map(messages =>
    h('div', [
      h('input', {
        type: 'text',
        attributes: {
          'data-js-text': ''
        }
      }, ['Send']),
      h('button', {
        attributes: {
          'data-js-send': ''
        }
      }, ['Send']),
      h('ol', [
        messages.map(msg => h('li', msg))
      ])
    ])
  );
}

function model(messageReceived$) {
  return actions.messageReceived$
    .scan((messages, msg) => {
      messages.push(msg)
      return messages;
    }, []);
}

function main({DOM, ws}) {
  const actions = intent(DOM, ws);

  const requests = {
    ws: actions.messageSent$
    DOM: view(model(action.messageReceived$))
  };

  return requests;
}

const drivers = {
  DOM: makeDOMDriver('[data-js-app]'),
  ws: makeWebSocketDriver('ws://localhost:8080')
};

Cycle.run(main, drivers);
