
export function author_link(authors) {
  console.log(authors);
  let results = {
    links: Object.keys(authors).map((id) => ({
      key: authors[id].username,
      text: authors[id].firstname,
      query: {author: authors[id].username},
      href: `/blog/?author=${authors[id]._id}`
    })).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0),
    class: 'filterBy',
    subtitle: 'Filter by Author'
  };
  console.log(results);
  return results;
}

export function nav_link(links) {
  console.log(links);
  let results = {
    links: links.map((link) => ({
      ...link,
      href: link.key.toLowerCase() === 'blog' ? `/${link.key.toLowerCase()}/` : `/${link.key.toLowerCase()}`
    })).filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0),
    class: 'exploreSection',
    subtitle: 'Explore Sections'
  };
  console.log(results);
  return results;
}

export function subject_link(subjects) {
  return {
    links: subjects
             .map((s) => ({ ...s, href: `/blog/?subject=${encodeURI(s.text)}` }))
             .filter((e1, i, a) => a.findIndex((e2, j) => e2.key === e1.key && i === j) !== -1 ? 1 : 0),
    class: 'resonateWith',
    subtitle: 'Resonate With'
  };
}
