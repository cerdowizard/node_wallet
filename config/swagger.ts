import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node Wallet API',
      version: '1.0.0',
      description: 'A comprehensive wallet management API',
      contact: {
        name: 'API Support',
        email: 'support@nodewallet.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        RegisterUserRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'address', 'city', 'state', 'zipCode', 'country'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (min 6 characters)'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number'
            },
            address: {
              type: 'string',
              description: 'User address'
            },
            city: {
              type: 'string',
              description: 'User city'
            },
            state: {
              type: 'string',
              description: 'User state'
            },
            zipCode: {
              type: 'string',
              description: 'User zip code'
            },
            country: {
              type: 'string',
              description: 'User country'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Operation success status'
            },
            status: {
              type: 'integer',
              description: 'HTTP status code'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            payload: {
              type: 'array',
              description: 'Response payload'
            }
          }
        }
      }
    }
  },
  apis: ['./controllers/**/*.ts', './routes/**/*.ts', './index.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options); 