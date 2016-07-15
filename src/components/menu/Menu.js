import React from 'react';
import {CreateMenu} from './CreateMenu';
import {EditMenu} from './EditMenu';
import {ExportMenu} from './ExportMenu';

export class MenuWidget extends React.Component {
  render () {
    return (
      <div className='panel' id='menubar'>
        <div className='menu aframe-logo'>
          <div className='title'>
            <span style={{color: '#ed3160'}}>A-</span>
            <span style={{color: '#fff'}}>Frame</span>
          </div>
        </div>
        <ExportMenu/>
        <EditMenu/>
        <CreateMenu/>
      </div>
    );
  }
}
