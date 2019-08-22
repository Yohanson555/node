const schema = require('./src/untill/UntillSchema');
const graphql = require('graphql');

const query = `
{
    article(id: 5000000139) {
      name
      department {
        name
        foodGroup {
          name,
          id
        }
      }
      prices {
        id
        value
        vat
        currency {
          id,
          name
        }
      }
    }
  }  
`;

graphql.graphql(schema, query).then(result => {
    console.log(result);
});