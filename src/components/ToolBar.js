var React = require('react');

export default class ToolBar extends React.Component {
  render() {
    return <div className='toolbar'>
      <a href='#' title='translate' className='button fa fa-arrows'></a>
      <a href='#' title='rotate' className='button fa fa-repeat'></a>
      <a href='#' title='scale' className='button fa fa-expand'></a>
    </div>
  }
};
