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

const {
    getDepartments,
    getDepartment
} = require('../getters/DepartmentGetters');

const articleType = require('./Article'); 
const departmentType = require('./Department'); 

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
      },
      departments: {
        type: GraphQLList(departmentType),
        args: {
          limit: {
            description: 'Maximum number of departments to return',
            type: GraphQLInt,
          },
        },
        resolve: (root, { limit }) => getDepartments(limit),
      },
      department: {
        type: departmentType,
        args: {
            id: {
                description: 'Department ID',
                type: GraphQLNonNull(GraphQLID),
            }
        },
        resolve: (root, { id }) => getDepartment(id),
      }
    }),
});

module.exports = queryType;