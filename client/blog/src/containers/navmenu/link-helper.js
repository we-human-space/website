
export function author_link(authors, render_type) {
  return {
    links: Object.keys(authors).map((id) => ({
      key: authors[id].username,
      text: authors[id].firstname,
      query: {author: id},
      title: `M A A T - Articles by ${authors[id].firstname}`,
      url: `/blog/?author=${authors[id]._id}`,
      location: {pathname: '/blog/', search: `author=${authors[id]._id}`},
      render_type: render_type
    })).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0),
    class: 'filterBy',
    subtitle: 'Filter by Author',
    type: 'authors',
    render_type: render_type
  };
}

export function nav_link(links, render_type) {
  return {
    links: links.map((link) => {
      let pathname = link.key.toLowerCase() === 'blog' ? `/${link.key.toLowerCase()}/` : `/${link.key.toLowerCase()}`;
      return {
        ...link,
        url: pathname,
        location: {pathname: pathname},
        render_type: render_type
      };
    }).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0),
    class: 'exploreSection',
    subtitle: 'Explore Sections',
    type: 'navlinks',
    render_type: render_type
  };
}

export function subject_link(subjects, render_type) {
  return {
    links: subjects.map((s) => ({
      ...s,
      url: `/blog/?subject=${encodeURI(s.text)}`,
      location: {pathname: '/blog/', search: `subject=${encodeURI(s.text)}`},
      title: `M A A T - Resonate with ${s.text}`,
      render_type: render_type
    })).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0),
    class: 'resonateWith',
    subtitle: 'Resonate With',
    type: 'subjects',
    render_type: render_type
  };
}
