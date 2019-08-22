const {
    GraphQLSchema,
  } = require('graphql/type');
  
  
  const articleType = require('./types/Article');
  const departmentType = require('./types/Department');
  const categoryType = require('./types/Category');
  const courseType = require('./types/Course');
  const currencyType = require('./types/Currency');
  const foodGroupType = require('./types/FoodGroup');
  const priceType = require('./types/Price');
  const salesAreaType = require('./types/SalesArea');

  const queryType = require('./types/Query');
  
  
  const untillSchema = new GraphQLSchema({
        query: queryType,
        types: [
            articleType,
            departmentType,
            categoryType,
            courseType,
            currencyType,
            foodGroupType,
            priceType,
            salesAreaType
        ],
  });
  
  module.exports = untillSchema;