import React from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

/**
 * Basic dropdown displaying existing content of site
 */
export default ({ postMeta, title, onSelect }) => {
  return (
    <DropdownButton title={title}>
      {
        postMeta.map(({ attributes }) =>
          (
            <Dropdown.Item id={attributes.route}
                           key={attributes.route}
                           eventKey={attributes.route}
                           as='button'
                           onSelect={onSelect}
            >
              {attributes.route}
            </Dropdown.Item>
          )
        )
      }
    </DropdownButton>
  );
}
