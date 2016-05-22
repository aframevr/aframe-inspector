/**
 * @author mrdoob / http://mrdoob.com/
 */

var Sortable = require('sortablejs');

var UI = {};

UI.Element = function ( dom ) {

  this.dom = dom;

};

UI.Element.prototype = {

  add: function () {

    for ( var i = 0; i < arguments.length; i ++ ) {

      var argument = arguments[ i ];

      if ( argument instanceof UI.Element ) {

        this.dom.appendChild( argument.dom );

      } else {

        console.error( 'UI.Element:', argument, 'is not an instance of UI.Element.' );

      }

    }

    return this;

  },

  remove: function () {

    for ( var i = 0; i < arguments.length; i ++ ) {

      var argument = arguments[ i ];

      if ( argument instanceof UI.Element ) {

        this.dom.removeChild( argument.dom );

      } else {

        console.error( 'UI.Element:', argument, 'is not an instance of UI.Element.' );

      }

    }

    return this;

  },

  clear: function () {

    while ( this.dom.children.length ) {

      this.dom.removeChild( this.dom.lastChild );

    }

  },

  setId: function ( id ) {

    this.dom.id = id;

    return this;

  },

  getId: function () {

    return this.dom.id;

  },

  setClass: function ( name ) {

    this.dom.className = name;

    return this;

  },

  setStyle: function ( style, array ) {

    for ( var i = 0; i < array.length; i ++ ) {

      this.dom.style[ style ] = array[ i ];

    }

    return this;

  },

  show: function () {

      this.dom.style.display = 'block';
      this.visible = true;

  },

  hide: function () {

      this.dom.style.display = 'none';
      this.visible = false;

  },

  setDisabled: function ( value ) {

    this.dom.disabled = value;

    return this;

  },

  setTextContent: function ( value ) {

    this.dom.textContent = value;

    return this;

  }

};

// properties

var properties = [ 'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'border', 'borderLeft',
'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'display', 'overflow', 'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom', 'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'color',
'backgroundColor', 'opacity', 'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex' ];

properties.forEach( function ( property ) {

  var method = 'set' + property.substr( 0, 1 ).toUpperCase() + property.substr( 1, property.length );

  UI.Element.prototype[ method ] = function () {

    this.setStyle( property, arguments );

    return this;

  };

} );

// events

var events = [ 'KeyUp', 'KeyDown', 'MouseOver', 'MouseOut', 'Click', 'DblClick', 'Change' ];

events.forEach( function ( event ) {

  var method = 'on' + event;

  UI.Element.prototype[ method ] = function ( callback ) {

    this.dom.addEventListener( event.toLowerCase(), callback.bind( this ), false );

    return this;

  };

} );

// Span

UI.Span = function () {

  UI.Element.call( this );

  this.dom = document.createElement( 'span' );

  return this;

};

UI.Span.prototype = Object.create( UI.Element.prototype );
UI.Span.prototype.constructor = UI.Span;

// Div

UI.Div = function () {

  UI.Element.call( this );

  this.dom = document.createElement( 'div' );

  return this;

};

UI.Div.prototype = Object.create( UI.Element.prototype );
UI.Div.prototype.constructor = UI.Div;

// Row

UI.Row = function () {

  UI.Element.call( this );

  var dom = document.createElement( 'div' );
  dom.className = 'Row';

  this.dom = dom;

  return this;

};

UI.Row.prototype = Object.create( UI.Element.prototype );
UI.Row.prototype.constructor = UI.Row;

// Panel

UI.Panel = function () {

  UI.Element.call( this );

  var dom = document.createElement( 'div' );
  dom.className = 'Panel';

  this.dom = dom;

  return this;

};

UI.Panel.prototype = Object.create( UI.Element.prototype );
UI.Panel.prototype.constructor = UI.Panel;


// Collapsible Panel

UI.CollapsiblePanel = function () {

  UI.Panel.call( this );

  this.setClass( 'Panel Collapsible' );

  var scope = this;

  this.static = new UI.Panel();
  this.static.setClass( 'Static' );
  this.static.onClick( function () {

    scope.toggle();

  } );
  this.dom.appendChild( this.static.dom );

  this.contents = new UI.Panel();
  this.contents.setClass( 'Content' );
  this.dom.appendChild( this.contents.dom );

  var button = new UI.Panel();
  button.setClass( 'Button' );
  this.static.add( button );

  this.isCollapsed = false;

  return this;

};

UI.CollapsiblePanel.prototype = Object.create( UI.Panel.prototype );
UI.CollapsiblePanel.prototype.constructor = UI.CollapsiblePanel;

UI.CollapsiblePanel.prototype.addStatic = function () {

  this.static.add.apply( this.static, arguments );
  return this;

};

UI.CollapsiblePanel.prototype.removeStatic = function () {

  this.static.remove.apply( this.static, arguments );
  return this;

};

UI.CollapsiblePanel.prototype.clearStatic = function () {

  this.static.clear();
  return this;

};

UI.CollapsiblePanel.prototype.add = function () {

  this.contents.add.apply( this.contents, arguments );
  return this;

};

UI.CollapsiblePanel.prototype.remove = function () {

  this.contents.remove.apply( this.contents, arguments );
  return this;

};

UI.CollapsiblePanel.prototype.clear = function () {

  this.contents.clear();
  return this;

};

UI.CollapsiblePanel.prototype.toggle = function() {

  this.setCollapsed( ! this.isCollapsed );

};

UI.CollapsiblePanel.prototype.collapse = function() {

  this.setCollapsed( true );

};

UI.CollapsiblePanel.prototype.expand = function() {

  this.setCollapsed( false );

};

UI.CollapsiblePanel.prototype.setCollapsed = function( boolean ) {

  if ( boolean ) {

    this.dom.classList.add( 'collapsed' );

  } else {

    this.dom.classList.remove( 'collapsed' );

  }

  this.isCollapsed = boolean;

  if ( this.onCollapsedChangeCallback !== undefined ) {

    this.onCollapsedChangeCallback( boolean );

  }

};

UI.CollapsiblePanel.prototype.onCollapsedChange = function ( callback ) {

  this.onCollapsedChangeCallback = callback;

};

// Text

UI.Text = function ( text ) {

  UI.Element.call( this );

  var dom = document.createElement( 'span' );
  dom.className = 'Text';
  dom.style.cursor = 'default';
  dom.style.display = 'inline-block';
  dom.style.verticalAlign = 'middle';

  this.dom = dom;
  this.setValue( text );

  return this;

};

UI.Text.prototype = Object.create( UI.Element.prototype );
UI.Text.prototype.constructor = UI.Text;

UI.Text.prototype.getValue = function () {

  return this.dom.textContent;

};

UI.Text.prototype.setValue = function ( value ) {

  if ( value !== undefined ) {

    this.dom.textContent = value;

  }

  return this;

};


// Input

UI.Input = function ( text ) {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'input' );
  dom.className = 'Input';
  dom.style.padding = '2px';
  dom.style.border = '1px solid transparent';

  dom.addEventListener( 'keydown', function ( event ) {

    event.stopPropagation();

  }, false );

  this.dom = dom;
  this.setValue( text );

  return this;

};

UI.Input.prototype = Object.create( UI.Element.prototype );
UI.Input.prototype.constructor = UI.Input;

UI.Input.prototype.getValue = function () {

  return this.dom.value;

};

UI.Input.prototype.setValue = function ( value ) {

  this.dom.value = value;

  return this;

};


// TextArea

UI.TextArea = function () {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'textarea' );
  dom.className = 'TextArea';
  dom.style.padding = '2px';
  dom.spellcheck = false;

  dom.addEventListener( 'keydown', function ( event ) {

    event.stopPropagation();

    if ( event.keyCode === 9 ) {

      event.preventDefault();

      var cursor = dom.selectionStart;

      dom.value = dom.value.substring( 0, cursor ) + '\t' + dom.value.substring( cursor );
      dom.selectionStart = cursor + 1;
      dom.selectionEnd = dom.selectionStart;

    }

  }, false );

  this.dom = dom;

  return this;

};

UI.TextArea.prototype = Object.create( UI.Element.prototype );
UI.TextArea.prototype.constructor = UI.TextArea;

UI.TextArea.prototype.getValue = function () {

  return this.dom.value;

};

UI.TextArea.prototype.setValue = function ( value ) {

  this.dom.value = value;

  return this;

};


// Select

UI.Select = function () {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'select' );
  dom.className = 'Select';
  dom.style.padding = '2px';

  this.dom = dom;

  return this;

};

UI.Select.prototype = Object.create( UI.Element.prototype );
UI.Select.prototype.constructor = UI.Select;

UI.Select.prototype.setMultiple = function ( boolean ) {

  this.dom.multiple = boolean;

  return this;

};

UI.Select.prototype.setOptions = function ( options ) {

  var selected = this.dom.value;

  while ( this.dom.children.length > 0 ) {

    this.dom.removeChild( this.dom.firstChild );

  }

  for ( var key in options ) {

    var option = document.createElement( 'option' );
    option.value = key;
    option.innerHTML = options[ key ];
    this.dom.appendChild( option );

  }

  this.dom.value = selected;

  return this;

};

UI.Select.prototype.getValue = function () {

  return this.dom.value;

};

UI.Select.prototype.setValue = function ( value ) {

  value = String( value );

  if ( this.dom.value !== value ) {

    this.dom.value = value;

  }

  return this;

};

// Checkbox

UI.Checkbox = function ( boolean ) {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'input' );
  dom.className = 'Checkbox';
  dom.type = 'checkbox';

  this.dom = dom;
  this.setValue( boolean );

  return this;

};

UI.Checkbox.prototype = Object.create( UI.Element.prototype );
UI.Checkbox.prototype.constructor = UI.Checkbox;

UI.Checkbox.prototype.getValue = function () {

  return this.dom.checked;

};

UI.Checkbox.prototype.setValue = function ( value ) {

  if ( value !== undefined ) {

    this.dom.checked = value;

  }

  return this;

};


// Color

UI.Color = function () {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'input' );
  dom.className = 'Color';
  dom.style.width = '64px';
  dom.style.height = '17px';
  dom.style.border = '0px';
  dom.style.padding = '2px';
  dom.style.backgroundColor = 'transparent';

  try {

    dom.type = 'color';
    dom.value = '#ffffff';

  } catch ( exception ) {}

  this.dom = dom;

  return this;

};

UI.Color.prototype = Object.create( UI.Element.prototype );
UI.Color.prototype.constructor = UI.Color;

UI.Color.prototype.getValue = function () {

  return this.dom.value;

};

UI.Color.prototype.getHexValue = function () {

  return parseInt( this.dom.value.substr( 1 ), 16 );

};

UI.Color.prototype.setValue = function ( value ) {

  if ( value.length === 4 ) {
    value = '#' + value[ 1 ] + value[ 1 ] + value[ 2 ] + value[ 2 ] + value[ 3 ] + value[ 3 ];
  }

  this.dom.value = value;

  return this;

};

UI.Color.prototype.setHexValue = function ( hex ) {

  this.dom.value = '#' + ( '000000' + hex.toString( 16 ) ).slice( - 6 );

  return this;

};


// Number

UI.Number = function ( number ) {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'input' );
  dom.className = 'Number';
  dom.value = '0.00';

  dom.addEventListener( 'keydown', function ( event ) {

    event.stopPropagation();

    if ( event.keyCode === 13 ) dom.blur();

  }, false );

  this.value = 0;

  this.min = - Infinity;
  this.max = Infinity;

  this.precision = 2;
  this.step = 1;

  this.dom = dom;

  this.setValue( number );

  var changeEvent = document.createEvent( 'HTMLEvents' );
  changeEvent.initEvent( 'change', true, true );

  var distance = 0;
  var onMouseDownValue = 0;

  var pointer = [ 0, 0 ];
  var prevPointer = [ 0, 0 ];

  function onMouseDown( event ) {

    event.preventDefault();

    distance = 0;

    onMouseDownValue = scope.value;

    prevPointer = [ event.clientX, event.clientY ];

    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );

  }

  function onMouseMove( event ) {

    var currentValue = scope.value;

    pointer = [ event.clientX, event.clientY ];

    distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

    var value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
    value = Math.min( scope.max, Math.max( scope.min, value ) );

    if ( currentValue !== value ) {

      scope.setValue( value );
      dom.dispatchEvent( changeEvent );

    }

    prevPointer = [ event.clientX, event.clientY ];

  }

  function onMouseUp( event ) {

    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'mouseup', onMouseUp, false );

    if ( Math.abs( distance ) < 2 ) {

      dom.focus();
      dom.select();

    }

  }

  function onChange( event ) {

    var value = 0;

    try {

      value = eval( dom.value );

    } catch ( error ) {

      console.error( error.message );

    }

    scope.setValue( parseFloat( value ) );

  }

  function onFocus( event ) {

    dom.style.backgroundColor = '';
    dom.style.cursor = '';

  }

  function onBlur( event ) {

    dom.style.backgroundColor = 'transparent';
    dom.style.cursor = 'col-resize';

  }

  onBlur();

  dom.addEventListener( 'mousedown', onMouseDown, false );
  dom.addEventListener( 'change', onChange, false );
  dom.addEventListener( 'focus', onFocus, false );
  dom.addEventListener( 'blur', onBlur, false );

  return this;

};

UI.Number.prototype = Object.create( UI.Element.prototype );
UI.Number.prototype.constructor = UI.Number;

UI.Number.prototype.getValue = function () {

  return this.value;

};

UI.Number.prototype.setValue = function ( value ) {

  if ( value !== undefined ) {

    value = parseFloat(value);
    if (value < this.min)
      value = this.min;
    if (value > this.max)
      value = this.max;

    this.value = value;
    this.dom.value = value.toFixed( this.precision );

  }

  return this;

};

UI.Number.prototype.setRange = function ( min, max ) {

  this.min = min;
  this.max = max;

  return this;

};

UI.Number.prototype.setPrecision = function ( precision ) {

  this.precision = precision;

  return this;

};


// Integer

UI.Integer = function ( number ) {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'input' );
  dom.className = 'Number';
  dom.value = '0';

  dom.addEventListener( 'keydown', function ( event ) {

    event.stopPropagation();

  }, false );

  this.value = 0;

  this.min = - Infinity;
  this.max = Infinity;

  this.step = 1;

  this.dom = dom;

  this.setValue( number );

  var changeEvent = document.createEvent( 'HTMLEvents' );
  changeEvent.initEvent( 'change', true, true );

  var distance = 0;
  var onMouseDownValue = 0;

  var pointer = [ 0, 0 ];
  var prevPointer = [ 0, 0 ];

  function onMouseDown( event ) {

    event.preventDefault();

    distance = 0;

    onMouseDownValue = scope.value;

    prevPointer = [ event.clientX, event.clientY ];

    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );

  }

  function onMouseMove( event ) {

    var currentValue = scope.value;

    pointer = [ event.clientX, event.clientY ];

    distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

    var value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
    value = Math.min( scope.max, Math.max( scope.min, value ) ) | 0;

    if ( currentValue !== value ) {

      scope.setValue( value );
      dom.dispatchEvent( changeEvent );

    }

    prevPointer = [ event.clientX, event.clientY ];

  }

  function onMouseUp( event ) {

    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'mouseup', onMouseUp, false );

    if ( Math.abs( distance ) < 2 ) {

      dom.focus();
      dom.select();

    }

  }

  function onChange( event ) {

    var value = 0;

    try {

      value = eval( dom.value );

    } catch ( error ) {

      console.error( error.message );

    }

    scope.setValue( value );

  }

  function onFocus( event ) {

    dom.style.backgroundColor = '';
    dom.style.cursor = '';

  }

  function onBlur( event ) {

    dom.style.backgroundColor = 'transparent';
    dom.style.cursor = 'col-resize';

  }

  onBlur();

  dom.addEventListener( 'mousedown', onMouseDown, false );
  dom.addEventListener( 'change', onChange, false );
  dom.addEventListener( 'focus', onFocus, false );
  dom.addEventListener( 'blur', onBlur, false );

  return this;

};

UI.Integer.prototype = Object.create( UI.Element.prototype );
UI.Integer.prototype.constructor = UI.Integer;

UI.Integer.prototype.getValue = function () {

  return this.value;

};

UI.Integer.prototype.setValue = function ( value ) {

  if ( value !== undefined ) {

    this.value = value | 0;
    this.dom.value = value | 0;

  }

  return this;

};

UI.Integer.prototype.setRange = function ( min, max ) {

  this.min = min;
  this.max = max;

  return this;

};


// Break

UI.Break = function () {

  UI.Element.call( this );

  var dom = document.createElement( 'br' );
  dom.className = 'Break';

  this.dom = dom;

  return this;

};

UI.Break.prototype = Object.create( UI.Element.prototype );
UI.Break.prototype.constructor = UI.Break;


// HorizontalRule

UI.HorizontalRule = function () {

  UI.Element.call( this );

  var dom = document.createElement( 'hr' );
  dom.className = 'HorizontalRule';

  this.dom = dom;

  return this;

};

UI.HorizontalRule.prototype = Object.create( UI.Element.prototype );
UI.HorizontalRule.prototype.constructor = UI.HorizontalRule;


// Button

UI.Button = function ( value ) {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'button' );
  dom.className = 'Button';

  this.dom = dom;
  this.dom.textContent = value;

  return this;

};

UI.Button.prototype = Object.create( UI.Element.prototype );
UI.Button.prototype.constructor = UI.Button;

UI.Button.prototype.setLabel = function ( value ) {

  this.dom.textContent = value;

  return this;

};


// Modal

UI.Modal = function ( value ) {

  var scope = this;

  var dom = document.createElement( 'div' );

  dom.style.position = 'absolute';
  dom.style.width = '100%';
  dom.style.height = '100%';
  dom.style.backgroundColor = 'rgba(0,0,0,0.5)';
  dom.style.display = 'none';
  dom.style.alignItems = 'center';
  dom.style.justifyContent = 'center';
  dom.addEventListener( 'click', function ( event ) {

    //scope.hide();

  } );

  this.dom = dom;

  this.container = new UI.Panel();
  this.container.dom.style.width = '600px';
  this.container.dom.style.height = '600px';
  this.container.dom.style.overflow = 'auto';

  this.container.dom.style.padding = '20px';
  this.container.dom.style.backgroundColor = '#ffffff';
  this.container.dom.style.boxShadow = '0px 5px 10px rgba(0,0,0,0.5)';

  this.add( this.container );

  return this;

};

UI.Modal.prototype = Object.create( UI.Element.prototype );
UI.Modal.prototype.constructor = UI.Modal;

UI.Modal.prototype.show = function ( content ) {

  this.container.clear();
  this.container.add( content );

  this.dom.style.display = 'flex';

  return this;

};

UI.Modal.prototype.hide = function () {

  this.dom.style.display = 'none';

  return this;

};

UI.ContextMenu = function () {
  var nav = document.createElement( 'nav' );
  nav.className = 'context-menu';
  var ul = document.createElement('ul');
  ul.className = 'context-menu__items';
  nav.appendChild(ul);

  function addOption(text, onClick) {

  }
/*
<nav id="context-menu" class="context-menu">
    <ul class="context-menu__items">
      <li class="context-menu__item">
        <a href="#" class="context-menu__link" data-action="View"><i class="fa fa-eye"></i> View Task</a>
      </li>
      <li class="context-menu__item">
        <a href="#" class="context-menu__link" data-action="Edit"><i class="fa fa-edit"></i> Edit Task</a>
      </li>
      <li class="context-menu__item">
        <a href="#" class="context-menu__link" data-action="Delete"><i class="fa fa-times"></i> Delete Task</a>
      </li>
    </ul>
  </nav>
*/

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'button' );
  dom.className = 'Button';

  this.dom = dom;
  this.dom.textContent = value;

  return this;

};

UI.Button.prototype = Object.create( UI.Element.prototype );
UI.Button.prototype.constructor = UI.Button;

UI.Button.prototype.setLabel = function ( value ) {

  this.dom.textContent = value;

  return this;

};


// ----- UI.THREEJS

// Outliner

UI.Outliner = function ( editor ) {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'div' );
  dom.className = 'Outliner';
  dom.tabIndex = 0; // keyup event is ignored without setting tabIndex

  var scene = editor.scene;

  var sortable = Sortable.create( dom, {
    draggable: '.draggable',
    onUpdate: function ( event ) {

      var item = event.item;

      var object = scene.getObjectById( item.value );

      if ( item.nextSibling === null ) {

        editor.execute( new MoveObjectCommand( object, editor.scene ) );

      } else {

        var nextObject = scene.getObjectById( item.nextSibling.value );
        editor.execute( new MoveObjectCommand( object, nextObject.parent, nextObject ) );

      }

    }
  } );

  // Broadcast for object selection after arrow navigation
  var changeEvent = document.createEvent( 'HTMLEvents' );
  changeEvent.initEvent( 'change', true, true );

  // Prevent native scroll behavior
  dom.addEventListener( 'keydown', function ( event ) {

    switch ( event.keyCode ) {
      case 38: // up
      case 40: // down
        event.preventDefault();
        event.stopPropagation();
        break;
    }

  }, false );

  // Keybindings to support arrow navigation
  dom.addEventListener( 'keyup', function ( event ) {

    function select( index ) {

      if ( index >= 0 && index < scope.options.length ) {

        scope.selectedIndex = index;

        // Highlight selected dom elem and scroll parent if needed
        scope.setValue( scope.options[ index ].value );
        scope.dom.dispatchEvent( changeEvent );

      }

    }

    switch ( event.keyCode ) {
      case 38: // up
        select( scope.selectedIndex - 1 );
        break;
      case 40: // down
        select( scope.selectedIndex + 1 );
        break;
    }

  }, false );

  this.dom = dom;

  this.options = [];
  this.selectedIndex = - 1;
  this.selectedValue = null;

  return this;

};

UI.Outliner.prototype = Object.create( UI.Element.prototype );
UI.Outliner.prototype.constructor = UI.Outliner;

UI.Outliner.prototype.setOptions = function ( options ) {

  var scope = this;

  var changeEvent = document.createEvent( 'HTMLEvents' );
  changeEvent.initEvent( 'change', true, true );

  while ( scope.dom.children.length > 0 ) {

    scope.dom.removeChild( scope.dom.firstChild );

  }

  scope.options = [];

  for ( var i = 0; i < options.length; i ++ ) {

    var option = options[ i ];

    var div = document.createElement( 'div' );
    div.className = 'option ' + ( option.static === true ? '' : 'draggable' );
    div.innerHTML = option.html;
    div.value = option.value;
    scope.dom.appendChild( div );

    scope.options.push( div );

    div.addEventListener( 'click', function ( event ) {

      scope.setValue( this.value );
      scope.dom.dispatchEvent( changeEvent );

    }, false );

  }

  return scope;

};

UI.Outliner.prototype.getValue = function () {

  return this.selectedValue;

};

UI.Outliner.prototype.setValue = function ( value ) {

  for ( var i = 0; i < this.options.length; i ++ ) {

    var element = this.options[ i ];

    if ( element.value === value ) {

      element.classList.add( 'active' );

      // scroll into view

      var y = element.offsetTop - this.dom.offsetTop;
      var bottomY = y + element.offsetHeight;
      var minScroll = bottomY - this.dom.offsetHeight;

      if ( this.dom.scrollTop > y ) {

        this.dom.scrollTop = y;

      } else if ( this.dom.scrollTop < minScroll ) {

        this.dom.scrollTop = minScroll;

      }

      this.selectedIndex = i;

    } else {

      element.classList.remove( 'active' );

    }

  }

  this.selectedValue = value;

  return this;

};

UI.THREE = {};

UI.THREE.Boolean = function ( boolean, text ) {

  UI.Span.call( this );

  this.setMarginRight( '10px' );

  this.checkbox = new UI.Checkbox( boolean );
  this.text = new UI.Text( text ).setMarginLeft( '3px' );

  this.add( this.checkbox );
  this.add( this.text );

};

UI.THREE.Boolean.prototype = Object.create( UI.Span.prototype );
UI.THREE.Boolean.prototype.constructor = UI.THREE.Boolean;

UI.THREE.Boolean.prototype.getValue = function () {

  return this.checkbox.getValue();

};

UI.THREE.Boolean.prototype.setValue = function ( value ) {

  return this.checkbox.setValue( value );

};

UI.Vector3 = function ( vector3 ) {

  UI.Element.call( this );

  var dom = document.createElement( 'div' );
  dom.className = 'Row';

  this.dom = dom;

  var scope=this;

  this.vector={
    'x': new UI.Number().setWidth('50px'),
    'y': new UI.Number().setWidth('50px'),
    'z': new UI.Number().setWidth('50px'),
  }

  this.add(this.vector['x'] ,this.vector['y'] ,this.vector['z']);
};

UI.Vector3.prototype = Object.create( UI.Element.prototype );
UI.Vector3.prototype.constructor = UI.Vector3;

UI.Vector3.prototype.setWidth=function(value) {
  return this;
};

UI.Vector3.prototype.setValue=function(value) {
  for (var val in value) {
    this.vector[val].setValue(value[val]);
  }
  return this;
};

UI.Vector3.prototype.getValue=function() {
  return {
    'x': this.vector['x'].getValue(),
    'y': this.vector['y'].getValue(),
    'z': this.vector['z'].getValue()
  }
}



UI.Map = function ( vector3 ) {

  UI.Element.call( this );

  var dom = document.createElement( 'div' );
  dom.className = 'Row';

  this.dom = dom;

  var scope=this;

  this.vector={
    'x': new UI.Number().setWidth('50px'),
    'y': new UI.Number().setWidth('50px'),
    'z': new UI.Number().setWidth('50px'),
  }

  this.add(this.vector['x'] ,this.vector['y'] ,this.vector['z']);
};

UI.Vector3.prototype = Object.create( UI.Element.prototype );
UI.Vector3.prototype.constructor = UI.Vector3;

UI.Vector3.prototype.setWidth=function(value) {
  return this;
};

UI.Vector3.prototype.setValue=function(value) {
  for (var val in value) {
    this.vector[val].setValue(value[val]);
  }
  return this;
};

UI.Vector3.prototype.getValue=function() {
  return {
    'x': this.vector['x'].getValue(),
    'y': this.vector['y'].getValue(),
    'z': this.vector['z'].getValue()
  }
}


UI.Texture = function ( mapping ) {

  UI.Element.call( this );

  var scope = this;

  var dom = document.createElement( 'span' );
/*
  var input = document.createElement( 'input' );
  input.type = 'file';
  input.addEventListener( 'change', function ( event ) {

    loadFile( event.target.files[ 0 ] );

  } );
*/
  var icon = document.createElement( 'span' );
  icon.style.paddingRight = '2px';
  dom.appendChild( icon );

  var canvas = document.createElement( 'canvas' );
  canvas.width = 32;
  canvas.height = 16;
  canvas.style.cursor = 'pointer';
  canvas.style.marginRight = '5px';
  canvas.style.border = '1px solid #888';
  canvas.addEventListener( 'click', function ( event ) {
    aframeEditor.editor.signals.showAssetsDialog.dispatch(scope);
    //aframeEditor.editor.dialogs.assets.show(scope);
  }, false );
/*  canvas.addEventListener( 'drop', function ( event ) {

    event.preventDefault();
    event.stopPropagation();
    loadFile( event.dataTransfer.files[ 0 ] );

  }, false );
*/
  dom.appendChild( canvas );
/*
  var name = document.createElement( 'input' );
  name.disabled = true;
  name.style.width = '64px';
  name.style.border = '1px solid #ccc';
  dom.appendChild( name );
*/

  var remove = document.createElement( 'input' );
  remove.type = 'button';
  remove.value = 'remove';
  remove.addEventListener('click', function(event){
    scope.setValue('');
    if ( scope.onChangeCallback ) scope.onChangeCallback();
  });

  dom.appendChild( remove );

  var loadFile = function ( file ) {

    if ( file.type.match( 'image.*' ) ) {

      var reader = new FileReader();
      reader.addEventListener( 'load', function ( event ) {

        var image = document.createElement( 'img' );
        image.addEventListener( 'load', function( event ) {

          var texture = new THREE.Texture( this, mapping );
          texture.sourceFile = file.name;
          texture.needsUpdate = true;

          scope.setValue( texture );

          if ( scope.onChangeCallback ) scope.onChangeCallback();

        }, false );

        image.src = event.target.result;

      }, false );

      reader.readAsDataURL( file );

    }

  };

  this.dom = dom;
  this.texture = null;
  this.onChangeCallback = null;

  return this;

};

UI.Texture.prototype = Object.create( UI.Element.prototype );
UI.Texture.prototype.constructor = UI.Texture;

UI.Texture.prototype.getValue = function () {

  return this.texture;

};

UI.Texture.prototype.setValue = function ( mapValue ) {

  var icon = this.dom.children[ 0 ];
  var canvas = this.dom.children[ 1 ];
  var context = canvas.getContext( '2d' );

  function paintPreview(texture) {
    var image = texture.image;
    var filename = image.src.replace(/^.*[\\\/]/, '')
    if ( image !== undefined && image.width > 0 ) {

      canvas.title = filename;
      var scale = canvas.width / image.width;
      context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

    } else {

      //name.value = filename + ' (error)';
      context.clearRect( 0, 0, canvas.width, canvas.height );

    }
  }

  function getTextureFromSrc(src) {
    for (var hash in aframeEditor.editor.sceneEl.systems.material.textureCache) {
      if (JSON.parse(hash).src == src)
        return aframeEditor.editor.sceneEl.systems.material.textureCache[hash];
    }
    return null;
  }

  var url = AFRAME.utils.srcLoader.parseUrl(mapValue);
  var texture = getTextureFromSrc(mapValue);

//  console.log(mapValue,texture,aframeEditor.editor.sceneEl.systems.material.textureCache);

  if (texture) {
    icon.className = mapValue[0] == '#' ? 'fa fa-link' : 'fa fa-external-link';
    texture.then(paintPreview);
  } else {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    icon.className = '';
  }

  this.texture = mapValue;
  return;

  if ( texture !== null ) {

    var image = texture.image;

    if ( image !== undefined && image.width > 0 ) {

      name.value = texture.sourceFile;

      var scale = canvas.width / image.width;
      context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

    } else {

      name.value = texture.sourceFile + ' (error)';
      context.clearRect( 0, 0, canvas.width, canvas.height );

    }

  } else {

    name.value = '';
    context.clearRect( 0, 0, canvas.width, canvas.height );

  }

  this.texture = texture;

};

UI.Texture.prototype.onChange = function ( callback ) {

  this.onChangeCallback = callback;

  return this;

};

module.exports = UI;
