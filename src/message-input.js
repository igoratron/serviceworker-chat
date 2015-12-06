import Rx from 'rx';
import {h} from '@cycle/dom';
import Helpers from 'hyperscript-helpers';

const {form, button, input} = Helpers(h);

function intent(DOM) {
  const inputValue$ = DOM.select('[data-js-text]')
    .events('input')
    .pluck('target', 'value');
  const sendRequest$ = DOM.select('[data-js-form]')
    .events('submit')
    .map(event => event.preventDefault());
  const newMessage$ = inputValue$.sample(sendRequest$);

  return {
    newMessage$,
    sendRequest$,
    inputValue$
  };
}

function model(actions) {
  const inputValue$ = Rx.Observable.merge(
    actions.inputValue$,
    actions.sendRequest$.map('')
  ).startWith('');

  return inputValue$;
}

function view(state$) {
  return state$.map(inputValue =>
    form({attributes: {'data-js-form': ''}}, [
      input({
        type: 'text',
        value: inputValue,
        attributes: {
          'data-js-text': ''
        }
      }),
      button(['Send'])
    ])
  );
}

export default function messageInput({DOM}) {
  const actions = intent(DOM);

  return {
    DOM: view(model(actions)),
    events: {
      newmessage: actions.newMessage$
    }
  };
};
