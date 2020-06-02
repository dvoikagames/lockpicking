function TouchInput() {
  throw new Error('This is a static class');
}

TouchInput.initialize = function() {
  this.clear();
  this._setupEventHandlers();
};

TouchInput.keyRepeatWait = 24;

TouchInput.keyRepeatInterval = 6;

TouchInput.clear = function() {
  this._mousePressed = false;
  this._rightMousePressed = false;
  this._screenPressed = false;
  this._pressedTime = 0;
  this._events = {};
  this._events.triggered = false;
  this._events.cancelled = false;
  this._events.moved = false;
  this._events.released = false;
  this._events.wheelX = 0;
  this._events.wheelY = 0;
  this._triggered = false;
  this._cancelled = false;
  this._moved = false;
  this._released = false;
  this._wheelX = 0;
  this._wheelY = 0;
  this._y = 0;
  this._date = 0;
};

TouchInput.update = function() {
  this._triggered = this._events.triggered;
  this._cancelled = this._events.cancelled;
  this._moved = this._events.moved;
  this._released = this._events.released;
  this._wheelX = this._events.wheelX;
  this._wheelY = this._events.wheelY;
  this._events.triggered = false;
  this._events.cancelled = false;
  this._events.moved = false;
  this._events.released = false;
  this._events.wheelX = 0;
  this._events.wheelY = 0;
  if (this.isPressed()) {
    this._pressedTime++;
  }
};

TouchInput.isPressed = function() {
  return this._mousePressed || this._screenPressed;
};

TouchInput.isReleased = function() {
  return this._released;
};

TouchInput._setupEventHandlers = function () {
  document.addEventListener('mousedown', this._onMouseDown.bind(this))
  document.addEventListener('mouseup', this._onMouseUp.bind(this))
}

TouchInput._onMouseDown = function(event) {
  console.log('onmousedown')
  if (event.button === 0) {
    this._onLeftButtonDown(event);
  } else if (event.button === 2) {
    this._onRightButtonDown(event);
  }

  event.preventDefault()
};

TouchInput._onLeftButtonDown = function(event) {
  this._mousePressed = true;
  this._pressedTime = 0;
  this._onTrigger();
};

TouchInput._onRightButtonDown = function(event) {
  this._onCancel();
};

TouchInput._onTrigger = function() {
  this._events.triggered = true;
  this._date = Date.now();
};

TouchInput._onCancel = function() {
  this._events.cancelled = true;
};

TouchInput._onRelease = function() {
  this._events.released = true;
};

TouchInput.isRightPressed = function () {
  return this._rightMousePressed
}

TouchInput._onRightButtonDown = function (event) {
  this._onCancel()
  this._rightMousePressed = true
}

TouchInput._onMouseUp = function (event) {
  if (event.button === 2) {
    this._rightMousePressed = false
  }

  if (event.button === 0) {
    this._mousePressed = false
    this._onRelease()
  }

  event.preventDefault()
}
