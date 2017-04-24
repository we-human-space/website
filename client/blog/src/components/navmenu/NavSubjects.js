import React from 'react';

export default function NavSubjects(props) {
  const subjects = [
    {key: 'Books', url: ''},
    {key: 'Drugs', url: ''},
    {key: 'Flow', url: ''},
    {key: 'Health', url: ''},
    {key: 'Music', url: ''},
    {key: 'Social Dynamics', url: ''},
    {key: 'Spirituality', url: ''},
    {key: 'Startup Journey', url: ''},
    {key: 'Tech', url: ''},
    {key: 'Travel', url: ''},
    {key: 'Visual Art', url: ''}
  ];

  const list = subjects.map((subject) =>
    <li key={subject.key}><a href={`#${subject.url}`}>{subject.key}</a></li>
  );

  return (
    <div className='resonateWith'>
      <div className='sectionTitle'>
        <span>Resonate with</span>
      </div>
      <div className='separator blockThree'></div>
      <ul className='ulBlock'>
        { list }
      </ul>
    </div>
  );
}
