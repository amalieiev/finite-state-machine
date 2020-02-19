const { Machine } = require('./index');

describe('Machine', () => {
  let m1, initialize, sendRequest;
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

  beforeEach(() => {
    initialize = jest.fn();
    sendRequest = jest.fn();
    m1 = Machine(schema, {
      actions: {
        initialize,
        sendRequest
      }
    });
  });

  test('should be a function', () => {
    expect(Machine).toBeDefined();
  });

  test('should have correct initial state', () => {
    expect(m1.current()).toBe('idle');
  });

  test('should call transition actions', () => {
    m1.send({ type: 'SEND' });
    expect(sendRequest.mock.calls.length).toBe(1);
    expect(sendRequest.mock.calls[0][0]).toEqual({ type: 'SEND' });
  });

  test('should change state by receiving events', () => {
    m1.send({type: 'SEND'})
    m1.send({type: 'SUCCESS'})
    expect(m1.current()).toBe('success')
  })

  test('should call provided callbacks', () => {
    const c1 = jest.fn();
    m1.subscribe(c1);
    m1.send({ type: 'SEND' });
    expect(c1.mock.calls.length).toBe(1);
    expect(c1.mock.calls[0][0]).toBe('pending');
  });

  test('should not change state if action is not presend in it', () => {
    m1.send({ type: 'SUCCESS' });
    expect(m1.current()).toBe(schema.initial);
  });

  test('should not call subscribers if state is not changed', () => {
    const callback_1 = jest.fn();
    m1.subscribe(callback_1);
    expect(m1.current()).toBe('idle');
    m1.send({ type: 'INIT' });
    expect(m1.current()).toBe('idle');
    expect(callback_1.mock.calls.length).toBe(0);
  });

  test('should subscibe and unsubscribe to state changes', () => {
    const callback_1 = jest.fn();
    const callback_2 = jest.fn();
    m1.subscribe(callback_1);
    m1.subscribe(callback_2);
    m1.send({ type: 'SEND' });
    expect(callback_1.mock.calls[0][0]).toBe('pending');
    expect(callback_2.mock.calls[0][0]).toBe('pending');
    m1.unsubscribe(callback_1);
    m1.send({ type: 'SUCCESS' });
    expect(callback_1.mock.calls.length).toBe(1);
    expect(callback_2.mock.calls.length).toBe(2);
  });

  test('should change state before calling actions', () => {
    const c1 = jest.fn()
    m1.subscribe(c1)
    m1.send({type: 'SEND'})
    expect(c1).toHaveBeenCalledBefore(sendRequest)
  });
});
