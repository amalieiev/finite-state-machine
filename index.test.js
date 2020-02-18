const { Machine } = require('./index');

const schema = {
  initial: 'idle',
  states: {
    idle: {
      INIT: {
        target: 'idle',
        actions: ['initialize']
      },
      SEND: {
        target: 'pending',
        actions: ['sendRequest']
      }
    },
    pending: {
      SUCCESS: {
        target: 'success'
      }
    },
    success: {}
  }
};

test('Machine should be a function', () => {
  expect(Machine).toBeDefined();
});

test('Should call transition actions', () => {
  const sendRequest = jest.fn();
  const m1 = Machine(schema, {
    actions: { sendRequest }
  });

  expect(m1.current()).toBe('idle');

  m1.send({ type: 'HELLO' });

  expect(sendRequest.mock.calls.length).toBe(0);

  m1.send({ type: 'SEND' });

  expect(m1.current()).toBe('pending');
  expect(sendRequest.mock.calls.length).toBe(1);
  expect(sendRequest.mock.calls[0][0]).toEqual({ type: 'SEND' });

  m1.send({ type: 'SEND' });
  m1.send({ type: 'SEND' });

  expect(m1.current()).toBe('pending');
  expect(sendRequest.mock.calls.length).toBe(1);

  m1.send({ type: 'SUCCESS' });
  expect(m1.current()).toBe('success');
  expect(sendRequest.mock.calls.length).toBe(1);
});

test('Should call provided callbacks', () => {
  const c1 = jest.fn();
  const sendRequest = jest.fn();

  const m1 = Machine(schema, { actions: { sendRequest } });

  m1.subscribe(c1);

  m1.send({ type: 'SEND' });

  expect(c1.mock.calls.length).toBe(1);
  expect(c1.mock.calls[0][0]).toBe('pending');

  m1.send({ type: 'SEND' });

  expect(c1.mock.calls.length).toBe(1);
  expect(c1.mock.calls[0][0]).toBe('pending');
});

test('should have initial state', () => {
  const service = Machine(schema);
  expect(service.current()).toBe(schema.initial);
});

test('should not change state if action is not presend in it', () => {
  const service = Machine(schema);
  service.send({ type: 'SUCCESS' });
  expect(service.current()).toBe(schema.initial);
});

test('should change state if action is presend in it', () => {
  const service = Machine(schema, { actions: { sendRequest: jest.fn() } });
  service.send({ type: 'SEND' });
  expect(service.current()).toBe('pending');
});

test('should not call subscribers if state is not changed', () => {
  const service = Machine(schema, { actions: { initialize: jest.fn() } });
  const callback_1 = jest.fn();
  service.subscribe(callback_1);
  expect(service.current()).toBe('idle');
  service.send({ type: 'INIT' });
  expect(service.current()).toBe('idle');
  expect(callback_1.mock.calls.length).toBe(0);
});

test('should subscibe and unsubscribe to state changes', () => {
  const service = Machine(schema, { actions: { sendRequest: jest.fn() } });
  const callback_1 = jest.fn();
  const callback_2 = jest.fn();
  service.subscribe(callback_1);
  service.subscribe(callback_2);
  service.send({ type: 'SEND' });
  expect(callback_1.mock.calls[0][0]).toBe('pending');
  expect(callback_2.mock.calls[0][0]).toBe('pending');
  service.unsubscribe(callback_1);
  service.send({ type: 'SUCCESS' });
  expect(callback_1.mock.calls.length).toBe(1);
  expect(callback_2.mock.calls.length).toBe(2);
});
