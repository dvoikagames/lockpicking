function Input() {
  throw new Error('This is a static class');
}

Input.initialize = function() {
  this.clear();
  this._setupEventHandlers();
};

Input.keyRepeatWait = 24;

Input.keyRepeatInterval = 6;

Input.keyMapper = {
  9: 'tab', // tab
  13: 'ok', // enter
  16: 'shift', // shift
  17: 'control', // control
  18: 'alt', // alt
  27: 'escape', // escape
  32: 'ok', // space
  33: 'pageup', // pageup
  34: 'pagedown', // pagedown
  65: 'left', // A
  37: 'left', // left arrow
  87: 'up', // W
  38: 'up', // up arrow
  68: 'right', // D
  39: 'right', // right arrow
  83: 'down', // S
  40: 'down', // down arrow
  45: 'escape', // insert
  81: 'pageup', // Q
  69: 'pagedown', // E
  88: 'escape', // X
  90: 'ok', // Z
  96: 'escape', // numpad 0
  98: 'down', // numpad 2
  100: 'left', // numpad 4
  102: 'right', // numpad 6
  104: 'up', // numpad 8
  120: 'debug', // F9
  192: 'tilde',
  8: 'backspace',
  49: 'one',
  50: 'two',
  51: 'three',
  52: 'four',
  53: 'five',
  54: 'six',
  55: 'seven',
  56: 'eight',
  57: 'nine',
  48: 'zero',
  70: 'f'

}

Input.gamepadMapper = {
  0: 'ok', // A
  1: 'escape', // B
  2: 'shift', // X
  3: 'menu', // Y
  4: 'pageup', // LB
  5: 'pagedown', // RB
  12: 'up', // D-pad up
  13: 'down', // D-pad down
  14: 'left', // D-pad left
  15: 'right' // D-pad right
}

Input.clear = function() {
  this._currentState = {};
  this._previousState = {};
  this._gamepadStates = [];
  this._latestButton = null;
  this._pressedTime = 0;
  this._dir4 = 0;
  this._dir8 = 0;
  this._preferredAxis = '';
  this._date = 0;
  this._isKeySpacePressed = false
  this._isKeyZPressed = false
  this._isKeyXPressed = false
};

Input.update = function() {
  this._pollGamepads();
  if (this._currentState[this._latestButton]) {
    this._pressedTime++;
  } else {
    this._latestButton = null;
  }
  for (var name in this._currentState) {
    if (this._currentState[name] && !this._previousState[name]) {
      this._latestButton = name;
      this._pressedTime = 0;
      this._date = Date.now();
    }
    this._previousState[name] = this._currentState[name];
  }
  this._updateDirection();
};

Input.isPressed = function(keyName) {
  if (this._isEscapeCompatible(keyName) && this.isPressed('escape')) {
    return true;
  } else {
    return !!this._currentState[keyName];
  }
};

Object.defineProperty(Input, 'date', {
  get: function() {
    return this._date;
  },
  configurable: true
});

Input._shouldPreventDefault = function(keyCode) {
  switch (keyCode) {
    case 8:     // backspace
    case 33:    // pageup
    case 34:    // pagedown
    case 37:    // left arrow
    case 38:    // up arrow
    case 39:    // right arrow
    case 40:    // down arrow
      return true;
  }
  return false;
};

Input._onKeyUp = function (event) {
  if (this._disabled) {
    return
  }

  // Space, z, x hack
  // TODO: Improve
  if (event.keyCode === 32) {
    this._isKeySpacePressed = false
  }

  if (event.keyCode === 90) {
    this._isKeyZPressed = false
  }

  if (event.keyCode === 88) {
    this._isKeyXPressed = false
  }

  const buttonName = this.keyMapper[event.keyCode]

  if (buttonName) {
    this._currentState[buttonName] = false
  }

  if (event.keyCode === 0) { // For QtWebEngine on OS X
    this.clear()
  }
}

Input._onKeyDown = function (event) {
  if (this._disabled) {
    return
  }

  if (this._shouldPreventDefault(event.keyCode)) {
    event.preventDefault()
  }

  if (event.keyCode === 144) { // Numlock
    this.clear()
  }

  // Space, z, x hack
  // TODO: Improve
  if (event.keyCode === 32) {
    this._isKeySpacePressed = true
  }

  if (event.keyCode === 90) {
    this._isKeyZPressed = true
  }

  if (event.keyCode === 88) {
    this._isKeyXPressed = true
  }

  const buttonName = this.keyMapper[event.keyCode]

  if (buttonName) {
    this._currentState[buttonName] = true
  }
}

Input._onLostFocus = function() {
  this.clear();
};

Input._pollGamepads = function() {
  if (navigator.getGamepads) {
    var gamepads = navigator.getGamepads();
    if (gamepads) {
      for (var i = 0; i < gamepads.length; i++) {
        var gamepad = gamepads[i];
        if (gamepad && gamepad.connected) {
          this._updateGamepadState(gamepad);
        }
      }
    }
  }
};

Input._updateGamepadState = function(gamepad) {
  var lastState = this._gamepadStates[gamepad.index] || [];
  var newState = [];
  var buttons = gamepad.buttons;
  var axes = gamepad.axes;
  var threshold = 0.5;
  newState[12] = false;
  newState[13] = false;
  newState[14] = false;
  newState[15] = false;
  for (var i = 0; i < buttons.length; i++) {
    newState[i] = buttons[i].pressed;
  }
  if (axes[1] < -threshold) {
    newState[12] = true;    // up
  } else if (axes[1] > threshold) {
    newState[13] = true;    // down
  }
  if (axes[0] < -threshold) {
    newState[14] = true;    // left
  } else if (axes[0] > threshold) {
    newState[15] = true;    // right
  }
  for (var j = 0; j < newState.length; j++) {
    if (newState[j] !== lastState[j]) {
      var buttonName = this.gamepadMapper[j];
      if (buttonName) {
        this._currentState[buttonName] = newState[j];
      }
    }
  }
  this._gamepadStates[gamepad.index] = newState;
};

Input._updateDirection = function() {
  var x = this._signX();
  var y = this._signY();

  this._dir8 = this._makeNumpadDirection(x, y);

  if (x !== 0 && y !== 0) {
    if (this._preferredAxis === 'x') {
      y = 0;
    } else {
      x = 0;
    }
  } else if (x !== 0) {
    this._preferredAxis = 'y';
  } else if (y !== 0) {
    this._preferredAxis = 'x';
  }

  this._dir4 = this._makeNumpadDirection(x, y);
};

Input._signX = function() {
  var x = 0;

  if (this.isPressed('left')) {
    x--;
  }
  if (this.isPressed('right')) {
    x++;
  }
  return x;
};

Input._signY = function() {
  var y = 0;

  if (this.isPressed('up')) {
    y--;
  }
  if (this.isPressed('down')) {
    y++;
  }
  return y;
};

Input._makeNumpadDirection = function(x, y) {
  if (x !== 0 || y !== 0) {
    return  5 - y * 3 + x;
  }
  return 0;
};

Input._isEscapeCompatible = function(keyName) {
  return keyName === 'cancel' || keyName === 'menu';
};

Input._setupEventHandlers = function () {
  this._onKeyDownBind = this._onKeyDown.bind(this)
  this._onKeyUpBind = this._onKeyUp.bind(this)
  document.addEventListener('keydown', this._onKeyDownBind)
  document.addEventListener('keyup', this._onKeyUpBind)
  window.addEventListener('blur', this._onLostFocus.bind(this))
}
