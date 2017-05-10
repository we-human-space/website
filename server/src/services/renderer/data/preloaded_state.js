import serialize from 'serialize-javascript';
import models from '../../../models';

const Article = models.Article;
const Author = models.Author;

export default function preloaded_state(req){
  return serialize({
    fetching: {
      refresh: false,
      initial: false,
      load_more: false
    },
    query: req.query || {},
    entities: {
      subjects: Article.getCachedSubjects().map((s) => ({key: s, text: s, query: {'subject': s}})),
      pages: {},
      authors: Author.getCachedAuthors(true),
      navlinks: [
        {key:'Blog',text: 'Blog'},
        {key:'Team', text: 'Team'},
        {key:'Vision', text: 'Vision'}
      ]
    },
    feed: {}
  }, {isJSON: true});
}
