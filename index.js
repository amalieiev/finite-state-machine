function Machine(schema, config) {
  let current = schema.initial;
  let callbacks = [];

  return {
    send: function(event, payload) {
      const next = schema.states[current][event];

      if (next) {
        if (next.target !== current) {
          current = next.target;
          callbacks.forEach(callback => callback(current));
        }

        next.actions &&
          next.actions.forEach(action =>
            config.actions[action](event, payload)
          );
      }

      return this;
    },

    current: function() {
      return current;
    },

    matches: function(...args) {
      return args.includes(current);
    },

    subscribe: function(callback) {
      callbacks.push(callback);
    },

    unsubscribe: function(callback) {
      callbacks = callbacks.filter(fn => fn !== callback);
    }
  };
}

module.exports = {
  Machine
};
