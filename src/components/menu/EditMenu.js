import React from 'react';
import {removeSelectedEntity, cloneSelectedEntity} from '../../actions/entity';

var menuOptions = {
  'Clone': {group: 'base', callback: cloneSelectedEntity, needsEntity: true},
  'Remove': {group: 'base', callback: removeSelectedEntity, needsEntity: true}
};

export const EditMenu = () => {
  var prevGroup = null;
  return (
    <div className='menu'>
      <div className='title'>Edit</div>
      <div className='options'>
      {
        Object.keys(menuOptions).map(key => {
          var option = menuOptions[key];
          var output = [];
          if (prevGroup === null) {
            prevGroup = option.group;
          } else if (prevGroup !== option.group) {
            prevGroup = option.group;
            output.push(<hr/>);
          }
          output.push(<div className='option' key={key} value={key}
            onClick={() => option.callback()}>{key}</div>);
          return output;
        })
      }
      </div>
    </div>
  );
};
