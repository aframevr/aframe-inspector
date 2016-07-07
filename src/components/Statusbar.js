var React = require('react');
import NumberWidget from './widgets/NumberWidget';

export default class Statusbar extends React.Component {
  render() {
    return <div className='statusbar'>
      <a href='#' title='translate' className='button fa fa-arrows'></a>
      <a href='#' title='rotate' className='button fa fa-repeat'></a>
      <a href='#' title='scale' className='button fa fa-expand'></a>
    </div>
  }
};
