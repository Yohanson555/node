const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLID
} = require('graphql/type');

const {
    getArticles,
    getArticle
} = require('../getters/ArticleGetters');

const articleType = require('./Article'); 

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      articles: {
        type: GraphQLList(articleType),
        args: {
          limit: {
            description: 'Maximum number of articles to return',
            type: GraphQLInt,
          },
        },
        resolve: (root, { limit }) => getArticles(limit),
      },
      article: {
        type: articleType,
        args: {
            id: {
                description: 'Article ID',
                type: GraphQLNonNull(GraphQLID),
            }
        },
        resolve: (root, { id }) => getArticle(id),
      }
    }),
});

module.exports = queryType;