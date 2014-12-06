var resetBtn     = document.getElementById('reset'),
    simDamageBtn = document.getElementById('simDamage'),
    zoomLevelInput = document.getElementById('zoomLevel'),
    UTILS        = new Utils();
    VIEWPORT     = SVG('viewport'),
    KEY_INPUT    = new BrowserKeyInput(),
    // global scalar for speed calculations
    SCALE_SPEED  = 0.25;

var VIEWBOX = VIEWPORT.viewbox();

VIEWBOX.cx = (VIEWBOX.width - VIEWBOX.x) / 2;
VIEWBOX.cy = (VIEWBOX.height - VIEWBOX.y) / 2;

// Populate
var objects = [];
for (var i=0; i<=100; i++) {
  objects.push(new EnemyShip({x: VIEWBOX.cx, y:VIEWBOX.cy}));
}

var playerShip   = new PlayerShip({x: VIEWBOX.cx, y:VIEWBOX.cy});
var playerHealth = new ProgressBar({  });
zoomLevel.addEventListener('change', function (e) {
  VIEWPORT.viewbox({zoom: parseInt(e.target.value)});
});
simDamageBtn.addEventListener('click', function () { playerShip.health.doDamage(10) });
resetBtn.addEventListener('click', resetAll);

function gameLoop () {
  
  for (var i=0; i<objects.length; i++) {
    objects[i].update();
    detectBoundaryCollision(objects[i]);
  }
  
  playerShip.update();
  playerHealth.update(playerShip.health.current,
                      playerShip.health.max);
  
  detectBoundaryCollision(playerShip);
  
  requestAnimationFrame(gameLoop);
}

gameLoop();


///

function handleBoundaryCollision (object) {
  // reverse direction
  object.heading.degrees = object.heading.degrees - 180;
}

function detectBoundaryCollision (object) {
  
  if(object.location.x <= VIEWBOX.x
     || object.location.y <= VIEWBOX.y
     || object.location.x >= VIEWBOX.width
     || object.location.y >= VIEWBOX.height) {
    handleBoundaryCollision(object);
  }
}

function resetAll () {
  playerShip.reset();
}

///


/** */
function PlayerShip (config) {
  
  if (typeof(config) === 'undefined') { config = {}; }
  
  var _location      = new Vector2D(config.x || 0, config.y || 0),
      _heading       = new Heading(config.heading || 0),
      _maxSpeed      = config.maxSpeed || 30,
      _health        = new HitPoints(100),
      _engine        = new RotationalEngine(60),
      _inputHandler  = new KeyInputHandler(),
      _mesh          = new Mesh({shape: 'triangle'});
 
  var exports = {
    inputHandler: _inputHandler,
    update:       _update,
    location:     _location,
    heading:      _heading,
    mesh:         _mesh,
    health:       _health,
    reset:        _reset,
    engine:       _engine
  };
  
  return exports;
  
  /// 
  
  function _update () {
    _inputHandler.update(this);
    _engine.update(this);
    _mesh.update(this);
  }
 
  function _reset () {
    _location.x = 0;
    _location.y = 0;
    _heading.degrees = 0;
    _engine.stop();
  }
    
}

/** */
function EnemyShip (config) {
  
  if (typeof(config) === 'undefined') { config = {}; }
  
  var _location      = new Vector2D(config.x || 0, config.y || 0),
      _heading       = new Heading(0),
      _maxSpeed      = config.maxSpeed || 30,
      _health        = new HitPoints(100),
      _engine        = new RotationalEngine(40),
      _inputHandler  = new RandomInput(),
      _mesh          = new Mesh({shape: 'triangle'});
 
  var exports = {
    engine:       _engine,
    inputHandler: _inputHandler,
    update:       _update,
    location:     _location,
    heading:      _heading,
    mesh:         _mesh,
    health:       _health,
    reset:        _reset
  };
  
  return exports;
  
  /// 
  
  function _update () {
    _inputHandler.update(this);
    _engine.update(this);
    _mesh.update(this);
  }
  
  function _reset () {
    _location.x = 0;
    _location.y = 0;
    _engine.stop();
  }
    
}

/** Random Input generator */
function RandomInput () {
  
  var exports = {
    update: _update
  }
  
  return exports;
  
  ///
  
  function _update (obj) {
    
    var random = Math.random() * 100;
    
    //console.log(random);
    
    if (obj.engine.thrust.right) {
      if (random < 20) {
        obj.engine.setThrust('left', true);
        obj.engine.setThrust('right', false);
      }
    } else if (obj.engine.thrust.left){
      if (random < 20) {
        obj.engine.setThrust('right', true);
        obj.engine.setThrust('left', false);
      }
    } else {
      if (random < 50) {
        obj.engine.setThrust('left', true);
      } else {
        obj.engine.setThrust('right', true)
      }
    }
    
    if (obj.engine.thrust.up) {
      if (random < 51) {
        obj.engine.setThrust('up', false);
      }
    } else {
      if (random > 50) {
        obj.engine.setThrust('up', true);
      }
    }

  }

}

/** Component to track an object's hit points */
function HitPoints (max) {

  var _max = max || 100,
      _current = _max;
  
  var exports = {
    doDamage:   _doDamage,
    regenerate: _regenerate,
    get max () { return _max; },
    get current () { return _current; }
  }
  
  return exports;
  
  ///
  
  function _doDamage (amount) {
    _current -= Math.abs(amount);
  }
  
  function _regenerate (amount) {
    _current += Math.abs(amount);
  }
  
}

/** */
function Heading (defaultHeading) {
  
  var _degrees = defaultHeading || 0;
  
  var exports = {
    get degrees () { return _degrees; },
    set degrees (newVal) { _degrees = newVal; },
    getVector: _getVector
  }
  
  return exports;
  
  ///
 
  function _getVector () {
    return {
      x: _calcX(),
      y: _calcY()
    };
  }
  
  function _calcX () {
    return Math.cos(_degrees * Math.PI / 180);
  }

  function _calcY () {
    return Math.sin(_degrees * Math.PI / 180);
  }
  
  
}

/** */
function ProgressBar (current, max) {
  var _current  = current || 100,
      _max      = max     || 100,
      _maxWidth = 600,
      _positiveMesh;
  
  _positiveMesh = VIEWPORT
                    .rect(_maxWidth, 10)
                    .move(20, '95%')
                    .fill('#99f');
  
  var exports = {
    update: _update
  };
  
  return exports;
  
  ///
  
  function _update (newVal, newMax) {
    if (_current !== newVal) {
      // TODO: trigger some transition animation
      _current = newVal;
    }
    _positiveMesh.width( (_current / _max) * _maxWidth ); 
  }
  
}

/** Simple 2D vector */
function Vector2D (x, y) {
  this.x = x || 0,
  this.y = y || 0;
}


/** Mirrors an engine interface, but does nothing */
function NullEngine (maxSpeed) {
  
  exports = {
    reset: UTILS.Null,
    setThrust: UTILS.Null,
    get velocity () { return {x: 0, y: 0} }
  }
  
  return exports;
    
}

/** An engine that allows rotation of an object and propels it forward in the direction it is facing */
function RotationalEngine (maxSpeed) {
  var _acceleration = 0,
      _velocity = new Vector2D(0, 0),
      _maxSpeed = maxSpeed || 5,
      _thrust = {
        right: false,
        left:  false,
        up:    false,
        down:  false
      };

  var exports = {
    setThrust:  _setThrust,
    update:     _update,
    stop:       _stop,
    get velocity () { return _velocity; },
    get thrust () { return _thrust; }
  }
  
  return exports;

  ///
  
  function _setThrust(direction, value) {
    
    if (typeof(value) === 'undefined') { return; }

    switch (direction) {
      case 'left':
        _thrust.left = value;
        break;
      case 'right':
        _thrust.right = value;
        break;
      case 'up':
        _thrust.up = value;
        break;
      case 'down':
        _thrust.down = value;
        break;
    }
  }
  
  function _accelerate () {
    if (_acceleration < Math.abs(_maxSpeed)) {
      _acceleration++;
    }
  }
  
  function _decelerate () {
    if (_acceleration > -Math.abs(_maxSpeed)) {
      _acceleration--;
    }
  }
  
  function _update (obj) {
    
    if (_thrust.down) { _decelerate(); }
    if (_thrust.up) { _accelerate(); }
    
    _applyFriction();
    
    _updateVelocity(obj);
    _updateHeading(obj);
    _updateLocation(obj);
  }
  
  function _updateHeading (obj) {
    if (_thrust.right) { obj.heading.degrees += 2 }
    if (_thrust.left)  { obj.heading.degrees -= 2 }
  }
  
  function _applyFriction () {
    if (!_thrust.down && !_thrust.up) {
      if (_acceleration === 0) {return;}
      if (_acceleration > 0) { _acceleration--; }
      else if (_acceleration < 0) { _acceleration++; }
    }
  }
  
  function _updateVelocity (obj) {
    var headingVector = obj.heading.getVector();
    _velocity.x = (_acceleration * headingVector.x);
    _velocity.y = (_acceleration * headingVector.y);  
  }
  
  function _updateLocation (obj) {
    obj.location.x += (_velocity.x * SCALE_SPEED);
    obj.location.y += (_velocity.y * SCALE_SPEED);
  }
  
  function _stop () {
    _acceleration = 0;
    _velocity.x = 0;
    _velocity.y = 0;
  }
  
}

/** A basic engine that can propel an object in any direction */
function BasicEngine (maxSpeed) {
  var _velocity = new Vector2D(0, 0),
      _maxSpeed = maxSpeed || 50,
      _thrust = {
        right: false,
        left:  false,
        up:    false,
        down:  false
      };
  
  var exports = {
    setThrust:  _setThrust,
    update:     _update,
    stop:       _stop,
    get velocity () { return _velocity; }
  }
  
  return exports;
  
  ///
  
  function _setThrust(direction, value) {
    
    if (typeof(value) === 'undefined') { return; }

    switch (direction) {
      case 'left':
        _thrust.left = value;
        break;
      case 'right':
        _thrust.right = value;
        break;
      case 'up':
        _thrust.up = value;
        break;
      case 'down':
        _thrust.down = value;
        break;
    }
  }
  
  function _accelLeft () {
    if (_velocity.x > -Math.abs(_maxSpeed)) {
      _velocity.x--;
    }
  }
  
  function _decelLeft () {
    if (_velocity.x === 0) { return; }
    if (_velocity.x < 0) {
      _velocity.x++;
    }
  }
  
  function _accelRight () {
    if (_velocity.x < Math.abs(_maxSpeed)) {
      _velocity.x++;
    }
  }
  
  function _decelRight () {
    if (_velocity.x === 0) { return; }
    if (_velocity.x > 0) {
      _velocity.x--;
    }
  }
  
  function _accelUp () {
    if (_velocity.y > -Math.abs(_maxSpeed)) {
      _velocity.y--;
    }
  }
  
  function _decelUp () {
    if (_velocity.y === 0) { return; }
    if (_velocity.y < 0) {
      _velocity.y++;
    }
  }
  
  function _accelDown () {
    if (_velocity.y < Math.abs(_maxSpeed)) {
      _velocity.y++;
    }
  }
  
  function _decelDown () {
    if (_velocity.y === 0) { return; }
    if (_velocity.y > 0) {
      _velocity.y--;
    }
  }
  
  function _update (obj) {
    _thrust.right ? _accelRight() : _decelRight();
    _thrust.left  ? _accelLeft()  : _decelLeft();
    _thrust.down  ? _accelDown()  : _decelDown();
    _thrust.up    ? _accelUp()    : _decelUp();
    _updateLocation(obj);
  }
  
  function _updateLocation (obj) {
    if (!obj) { return; }
    obj.location.x += _velocity.x * SCALE_SPEED;
    obj.location.y += _velocity.y * SCALE_SPEED;
  }
  
  function _stop () {
    _velocity.x = 0;
    _velocity.y = 0;
  }
  
}

/** Attaches browser event listeners and tracks currently-depressed keys */
function BrowserKeyInput () {

  var _pressedKeys = [];
  
  window.addEventListener('keydown', _keyDownHandler);
  window.addEventListener('keyup', _keyUpHandler);

  exports = {
    getPressedKeys: _getPressedKeys
  }
  
  return exports;
  
  ///
  
  function _getPressedKeys () {
    return _pressedKeys;
  }
  
  function _keyDownHandler (event) {
    if (_pressedKeys.indexOf(event.keyCode) < 0) {
      _pressedKeys.push(event.keyCode);
    }
  }

  function _keyUpHandler (event) {
    var index = _pressedKeys.indexOf(event.keyCode);
    if (index >= 0) { _pressedKeys.splice(index, 1); }
  } 

}

/** 
 * Component that maps key input to game object actions
 */
function KeyInputHandler () {
  
  var _thrustKeyCodes = {
        left:  37,
        right: 39,
        up:    38,
        down:  40
      };
  
  var exports = {
    update: _update
  }
  
  return exports;
  
  ///
  
  function _update (obj) {
    
    var pressedKeys = KEY_INPUT.getPressedKeys();

    _.forIn(_thrustKeyCodes, function (keyCode, direction) {
      obj.engine.setThrust(direction, _isPressed(pressedKeys, keyCode));
    });

  }
  
  function _isPressed (pressedKeys, keyCode) {
    return pressedKeys.indexOf(keyCode) >= 0;
  }

}


/** 
 * Component that creates and renders a visual
 * @param {obj} config - attributes of the mesh, ex: shape, size, location, etc.
 */
function Mesh (config) {
  
  if (typeof(config) === 'undefined') { config = {}; }
  
  var _mesh,
      _config = {
        shape:  config.shape  || 'rect',
        width:  config.width  || 50,
        height: config.height || 50,
        x:      config.x      || 100,
        y:      config.y      || 100,
        color:  config.color  || '#f09'
      };
  
  _init();
  
  exports = {
    update: _update
  }
  
  return exports;
  
  /// 
  
  function _init () {
    switch (_config.shape) {
      case 'rect':
        _mesh = _drawRectangle();
        break;
      case 'circle':
        _mesh = _drawCircle();
        break;
      case 'triangle':
        _mesh = _drawTriangle();
        break;
    }
  }
  
  function _drawRectangle () {
    return VIEWPORT
            .rect(_config.width, _config.height)
            .move(_config.x, _config.y)
            .fill(_config.color);
  }
  
  function _drawCircle () {
    return VIEWPORT
            .circle(_config.width, _config.height)
            .move(_config.x, _config.y)
            .fill(_config.color);
  }
  
  function _drawTriangle () {
    return VIEWPORT
            .polyline([[0,0], [50,25], [0,50]])
            .move(_config.x, _config.y)
            .fill(_config.color);
  }
  
  function _update (obj) {
    _mesh.center(obj.location.x, obj.location.y);
    
    if (obj.heading) {
      _mesh.rotate(obj.heading.degrees, obj.location.x, obj.location.y);
    }
  }
  
}

function Utils () {
  var exports = {
    Null: _Null
  };
  
  return exports;

  /** A function that doesn't do anything */
  function _Null () {
    return;
  }
}