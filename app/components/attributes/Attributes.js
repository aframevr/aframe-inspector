var React = require('react');
var Component = require('./Component');
var CommonComponents = require('./CommonComponents');
var Events = require('../../lib/Events.js');

var AddComponent = React.createClass({
  addComponent: function() {
    this.props.entity.setAttribute(this.refs.select.value, '');
  },
  render: function() {
    var entity = this.props.entity;
    if (!entity) {
      return <div></div>;
    }
    var usedComponents = Object.keys(this.props.entity.components);

    return <div className="collapsible">
            <div className="static"><div className="button"></div><span>COMPONENTS</span><div className="menu"></div></div>
            <div className="content">
              <div className="row">
                <span className="text">Add</span>
                <span className="value">
                  <select ref="select">
                  {
                    Object.keys(AFRAME.components)
                        .filter(function(key){return usedComponents.indexOf(key)==-1;})
                        .sort()
                        .map(function(value) {
                      return <option key={value} value={value}>{value}</option>;
                    }.bind(this))
                  }
                  </select>
                  <a href="#" className="button fa fa-plus-circle" onClick={this.addComponent}></a>
                </span>
              </div>
            </div>
          </div>;
  }
});

var Attributes = React.createClass({
  render: function() {

    var entity = this.props.entity;
    var components = entity ? this.props.entity.components : {};
    return <div className="attributes">
        <CommonComponents entity={entity}/>
        <AddComponent entity={entity}/>
        {
    	     Object.keys(components).filter(function(key){return ['visible','position','scale','rotation'].indexOf(key)==-1;}).sort().map(function(key) {
              return <Component entity={entity} key={key} name={key} component={components[key]}/>
	         })
        }
    </div>;
  }
});

module.exports = Attributes;
