const { useState, useEffect } = require('react');
const { Machine } = require('../index');

function useSchema(schema) {
  const [machine, setMachine] = useState(null);
  const [_, next] = useState({});

  useEffect(() => {
    const machine = Machine(schema);
    const handler = () => next({});

    setMachine(machine);

    machine.subscribe(handler);
    return () => machine.unsubscribe(handler);
  }, []);

  return machine;
}

function useMachine(machine) {
  const [state, setState] = useState(machine.current());
  const handler = state => {
    setState(state);
  };

  useEffect(() => {
    machine.subscribe(handler);
    return () => machine.unsubscribe(handler);
  });

  return machine;
}

module.exports = {
  useMachine,
  useSchema
};
