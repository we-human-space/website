import React from 'react';

export default function NavAuthors(props) {
  const authors = [
    {firstName: 'Philippe', url: ''},
    {firstName: 'Gregory', url: ''},
    {firstName: 'Sacha', url: ''},
    {firstName: 'Chloe', url: ''}
  ];

  const list = authors.map((author, i) =>
    <li key={i}><a href={`#${author.url}`}>{author.firstName}</a></li>
  );

  return (
    <div className='filterBy'>
      <div className='sectionTitle'>
        <span>Filter by author</span>
      </div>
      <div className='separator blockTwo'></div>
      <ul className='ulBlock'>
        { list }
      </ul>
    </div>
  );
}
