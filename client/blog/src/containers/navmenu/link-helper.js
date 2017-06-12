import config from '../../config';

export function author_link(authors, render_type) {
  return {
    links: Object.keys(authors).map((id) => ({
      key: authors[id].username,
      text: authors[id].firstname,
      query: {author: id},
      title: `M A A T - Articles by ${authors[id].firstname}`,
      url: `${config.routing['phase-one']}?author=${authors[id]._id}`,
      location: {pathname: `${config.routing['phase-one']}`, search: `author=${authors[id]._id}`},
      render_type: render_type
    })).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0).sort(sort_by_key),
    class: 'filterBy',
    subtitle: 'Filter by Author',
    type: 'authors',
    render_type: render_type
  };
}

export function nav_link(links, render_type) {
  return {
    links: links.map((link) => {
      return {
        ...link,
        url: config.routing[link.key],
        location: {pathname: config.routing[link.key].replace(/.*human\.space/, '')},
        render_type: render_type
      };
    }).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0).sort(sort_by_key),
    class: 'exploreSection',
    subtitle: 'Explore Sections',
    type: 'navlinks',
    render_type: render_type
  };
}

export function subject_link(subjects, render_type) {
  return {
    links: subjects.map((link) => ({
      ...link,
      url: `${config.routing['quest']}?subject=${encodeURI(link.text)}`,
      location: {pathname: `${config.routing['quest'].replace(/.*human\.space/, '')}`, search: `subject=${encodeURI(link.text)}`},
      title: `M A A T - Resonate with ${link.text}`,
      render_type: render_type
    })).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0).sort(sort_by_key),
    class: 'resonateWith',
    subtitle: 'Resonate With',
    type: 'subjects',
    render_type: render_type
  };
}

function sort_by_key(a, b){
  if(a.key < b.key){
    return -1;
  }else if(a.key === b.key){
    return 0;
  }else{
    return 1;
  }
}
