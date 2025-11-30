const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Website Analytics API",
      version: "1.0.0",
      description: "Scalable backend API for website/app analytics"
    }
  },
  apis: ["./src/routes/*.js"] 
};

const specs = swaggerJsdoc(options);

module.exports = specs;
