var React = require('react');
var Component = require('./Component');

var Attributes = React.createClass({
  render: function() {

    var entity = this.props.entity;
    var components = entity ? this.props.entity.components : {};

    return <div className="attributes">
    {
    	Object.keys(components).filter(function(key){return ['visible','position','scale','rotation'].indexOf(key)==-1;}).map(function(key) {
		    return <Component entity={entity} key={key} name={key} component={components[key]}/>
	    })}
    </div>;
  }
});

module.exports = Attributes;
