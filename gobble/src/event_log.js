'use strict';

class EventLog {
    constructor() {
        this._events = [];
        this._lastTimerSnapshot = Date.now();

        this._events.push({
            timer: this._lastTimerSnapshot,
            delta: null,
            event: 'EventLog initialized.'
        });

        this.size = 1;
    }

    add(event) {
        const delta = this._updateEventTimer();

        this._events.push({
            timer: this._lastTimerSnapshot,
            delta: delta,
            event: event
        });

        this.size++;
    }

    _updateEventTimer() {
        const prev = this._lastTimerSnapshot;
        this._lastTimerSnapshot = Date.now();
        return this._lastTimerSnapshot - prev;
    }
};

module.exports = EventLog;