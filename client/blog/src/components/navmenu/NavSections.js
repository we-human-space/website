import React from 'react';

export default function NavSections(props) {
  const sections = [
    {key: 'Blog', text: 'Blog', url: '/blog/'},
    {key: 'Vision', text: 'Vision', url: '/vision/'},
    {key: 'Team', text: 'Team', url: '/team/'}
  ];

  const list = sections.map((section) =>
    <li key={section.key}><a href={`${section.url}`}>{section.key}</a></li>
  );

  return (
    <div className='exploreSection'>
      <div className='sectionTitle'>
        <span>Explore Sections</span>
      </div>
      <div className='separator blockOne'></div>
      <ul className='ulBlock'>
        { list }
      </ul>
    </div>
  );
}
