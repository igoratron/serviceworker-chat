import Rx from 'rx';
import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';

import makeWebSocketDriver from './cycle-websocket-driver';

function main({DOM, ws}) {
  const sendClicks$ = DOM.select('[data-js-send]')
    .events('click');
  const messageText$ = DOM.select('[data-js-text]')
    .events('input')
    .map(event => event.target.value);

  const requests = {
    ws: messageText$.sample(sendClicks$),
    DOM: ws
      .scan((messages, msg) => {
        messages.push(msg)
        return messages;
      }, [])
      .map(messages =>
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
      )
  };

  return requests;
}

const drivers = {
  DOM: makeDOMDriver('[data-js-app]'),
  ws: makeWebSocketDriver('ws://localhost:8080')
};

Cycle.run(main, drivers);
