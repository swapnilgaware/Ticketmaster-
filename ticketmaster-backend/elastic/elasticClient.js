const { Client } = require('@elastic/elasticsearch');

if (!process.env.ELASTIC_URI) {
  console.error('Error: ELASTIC_URI is not defined in the environment variables.');
  process.exit(1);
}

const client = new Client({ node: process.env.ELASTIC_URI });

module.exports = client;
