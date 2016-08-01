import React from 'react';
import ComponentsContainer from './ComponentsContainer';
import Clipboard from 'clipboard';

export default class Sidebar extends React.Component {
  static propTypes = {
    entity: React.PropTypes.object
  };

  constructor (props) {
    super(props);
    this.state = {open: false};
  }

  componentDidMount () {
    var clipboard = new Clipboard('[data-action="copy-entity-to-clipboard"]', {
      text: trigger => {
        return this.props.entity.outerHTML;
      }
    });
    clipboard.on('error', e => {
      // @todo Show the error on the UI
    });
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
    ga('send', 'event', 'Components', 'toggleSidebar');
  }

  render () {
    const entity = this.props.entity;
    let entityButtons = '';
    let entityName = '';
    if (entity) {
      entityButtons = <div>
        <a href='#' title='Copy entity HTML to clipboard' data-action='copy-entity-to-clipboard'
          className='button fa fa-clipboard' onClick={event => event.stopPropagation()}></a>
      </div>;
      entityName = '<' + entity.tagName.toLowerCase() + '>';
    }

    return (
      <div id='sidebar'>
        <div className='sidebar-title'>
          <code>{entityName}</code>
          {entityButtons}
        </div>
        <ComponentsContainer entity={this.props.entity}/>
      </div>
    );
  }
}
