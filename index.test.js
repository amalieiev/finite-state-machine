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

  describe('send', () => {
    test('should call transition actions with correct arguments', () => {
      m1.send('SEND', { foo: 'bar' });
      expect(sendRequest.mock.calls.length).toBe(1);
      expect(sendRequest.mock.calls[0][0]).toBe('SEND');
      expect(sendRequest.mock.calls[0][1]).toEqual({ foo: 'bar' });
    });

    test('should change state by receiving events', () => {
      m1.send('SEND');
      m1.send('SUCCESS');
      expect(m1.current()).toBe('success');
    });

    test('should not change state if action is not presend in it', () => {
      m1.send('SUCCESS');
      expect(m1.current()).toBe(schema.initial);
    });
  });

  describe('subscribe', () => {
    test('should call provided callbacks', () => {
      const c1 = jest.fn();
      m1.subscribe(c1);
      m1.send('SEND');
      expect(c1.mock.calls.length).toBe(1);
      expect(c1.mock.calls[0][0]).toBe('pending');
    });

    test('should not call subscribers if state is not changed', () => {
      const callback_1 = jest.fn();
      m1.subscribe(callback_1);
      expect(m1.current()).toBe('idle');
      m1.send('INIT');
      expect(m1.current()).toBe('idle');
      expect(callback_1.mock.calls.length).toBe(0);
    });
  });

  describe('matches', () => {
    test('should be a function', () => {
      expect(m1.matches).toBeFunction();
    });

    test('should work with one value', () => {
      expect(m1.matches('idle')).toBeTruthy();
    });

    test('should work with multiple values', () => {
      expect(m1.matches('idle', 'success')).toBeTruthy();
    });
  });

  describe('unsubscribe', () => {
    test('should subscibe and unsubscribe to state changes', () => {
      const callback_1 = jest.fn();
      const callback_2 = jest.fn();
      m1.subscribe(callback_1);
      m1.subscribe(callback_2);
      m1.send('SEND');
      expect(callback_1.mock.calls[0][0]).toBe('pending');
      expect(callback_2.mock.calls[0][0]).toBe('pending');
      m1.unsubscribe(callback_1);
      m1.send('SUCCESS');
      expect(callback_1.mock.calls.length).toBe(1);
      expect(callback_2.mock.calls.length).toBe(2);
    });
  });

  test('should change state before calling actions', () => {
    const c1 = jest.fn();
    m1.subscribe(c1);
    m1.send('SEND');
    expect(c1).toHaveBeenCalledBefore(sendRequest);
  });

  test('should be a function', () => {
    expect(Machine).toBeDefined();
  });

  test('should have correct initial state', () => {
    expect(m1.current()).toBe('idle');
  });
});
