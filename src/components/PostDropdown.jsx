import React from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

/**
 * Basic dropdown displaying existing content of site
 */
export default ({ items, title, onSelect }) => {
  return (
    <DropdownButton title={title}>
      {
        items.map((item) =>
          (
            <Dropdown.Item id={item.route}
                           key={item.route}
                           eventKey={item.route}
                           as='button'
                           onSelect={onSelect}
            >
              {item.route}
            </Dropdown.Item>
          )
        )
      }
    </DropdownButton>
  );
}
