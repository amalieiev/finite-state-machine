const { Machine } = require('./index');

const schema = {
  initial: 'idle',
  states: {
    idle: {
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

  m1.subscribe(c1)

  m1.send({type: 'SEND'})

  expect(c1.mock.calls.length).toBe(1)
  expect(c1.mock.calls[0][0]).toBe('pending')

  m1.send({type: 'SEND'})
  
  expect(c1.mock.calls.length).toBe(1)
  expect(c1.mock.calls[0][0]).toBe('pending')
});
