function Machine(schema, config) {
    let current = schema.initial
    let callbacks = []

    return {
        send: function(event) {
            const next = schema.states[current][event.type]

            if (next) {
                if (next.target !== current) {
                    current = next.target
                    callbacks.forEach(callback => callback(current))
                }

                next.actions && next.actions.forEach(action => config.actions[action](event))
            }

            return this
        },

        current: function() {
            return current
        },

        subscribe: function (callback) {
            callbacks.push(callback)
        },

        unsubscribe: function (callback) {
            callbacks = callbacks.filter(fn => fn !== callback)
        }
    }
}

module.exports = {
    Machine
}