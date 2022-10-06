import EventEmitter from 'events';

const Events = new EventEmitter();
Events.setMaxListeners(0);

export default Events;
