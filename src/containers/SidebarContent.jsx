import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import '../style/SidebarContent.css';

function renderCategory(category, pages, handleLinkSelected) {
  if (Object.prototype.hasOwnProperty.call(pages, category)) {
    return pages[category].map(({ fileName, title }) => {
      const trimmed = fileName.slice(0, -3);
      return (
        <Link key={trimmed} 
              onClick={handleLinkSelected}
              style={{ 
                textDecoration: 'none',
                color: 'black',
                outline: 'none' 
              }}
              to={trimmed}
        >
          {title}
        </Link>
      );
    })
  }
  return null;
}

function SidebarContent(props) {
  const { pages, handleLinkSelected, categories, isResponsive } = props;
  const pagesByCategory = { unknown: [] };
  pages.forEach(({ category, title, priority, fileName }) => {
    if (category === undefined) {
      pagesByCategory['unknown'].push({ title, priority, fileName });
    } else if (Object.prototype.hasOwnProperty.call(pagesByCategory, category)) {
      pagesByCategory[category.toLowerCase()].push({ title, priority, fileName });
    } else {
      pagesByCategory[category.toLowerCase()] = [{ title, priority, fileName }];
    }
  });

  const rClass = isResponsive ? 'responsive-card' : '';
  const contentClass = isResponsive ? 'responsive-sidebar-content' : 'sidebar-content';
  return (
    <div className={`sidebar-all ${contentClass}`}>
      <Accordion className='myaccordion'>
        {
          categories.map((category, i) => {
            const eKey = isResponsive ? undefined : i;
            return (
              <Card className={rClass} key={category.toLowerCase()}>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey={eKey}>
                    {category}&nbsp;&nbsp;
                    {
                      (eKey !== undefined) && <span className='fa fa-caret-down' aria-hidden='true'></span>
                    }
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey={eKey}>
                  <Card.Body className='card-body'>
                    {
                      renderCategory(category.toLowerCase(), pagesByCategory, handleLinkSelected)
                    }
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            );
          })
        }
      </Accordion>
    </div>
  );
}


//       {
//         pages.map(({ fileName, title }) => {
//           const trimmed = fileName.slice(0, -3);
//           return (
//             <div key={trimmed} className='sidebar-link-container'>
//               // <Link key={trimmed} onClick={handleLinkSelected} style={{ textDecoration: 'none', color: 'black', outline: 'none' }} to={trimmed}>{title}</Link>
//             </div>
//           );
//         })
//       }


export default withRouter(SidebarContent);
