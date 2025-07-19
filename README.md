# 🤖 Node Wallet API

A modern, AI-powered financial management API built with Bun's native server.

## 🚀 Features

### 🔐 Authentication
- JWT-based authentication
- User registration and login
- Password reset functionality
- Token refresh mechanism

### 👤 User Management
- User profile management
- Address and contact information
- Secure profile updates

### 🧠 AI Agent System
- **Financial Insights**: Spending pattern analysis and recommendations
- **Smart Budget**: AI-powered budget creation and optimization
- **Expense Prediction**: Predictive analytics for future expenses
- **Automation**: Intelligent financial automation rules

### ⚡ Automation Features
- **Spending Limits**: Automated alerts and controls
- **Smart Savings**: Intelligent savings strategies
- **Bill Reminders**: Automated payment notifications
- **Investment Alerts**: Opportunity detection

### 📁 File Management
- Secure file upload system
- AWS S3 integration
- Document management

## 🛠️ Technology Stack

- **Runtime**: Bun (native server)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Storage**: AWS S3
- **Architecture**: RESTful API

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed
- PostgreSQL database
- AWS S3 bucket (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd node_wallet
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/node_wallet"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="your-aws-region"
   AWS_BUCKET_NAME="your-s3-bucket"
   ```

4. **Database Setup**
   ```bash
   bun run migrate
   bun run generate
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Forgot password
- `PATCH /api/auth/reset-password` - Reset password

### User Profile
- `GET /api/v1/user/profile` - Get user profile
- `PATCH /api/v1/user/update` - Update user profile

### AI Agent
- `GET /api/v1/ai-agent/financial-insights` - Get AI insights
- `GET /api/v1/ai-agent/expense-predictor` - Predict expenses
- `POST /api/v1/ai-agent/smart-budget` - Create smart budget

### Automation
- `POST /api/v1/ai-agent/automation/setup` - Setup automation
- `POST /api/v1/ai-agent/automation/execute` - Execute automation
- `POST /api/v1/ai-agent/automation/smart-savings` - Smart savings

### File Upload
- `POST /api/v1/upload` - Upload files

### Health Check
- `GET /api/health` - Server health status

## 🔧 Development

### Running the Server
```bash
# Development with hot reload
bun run dev

# Production
bun run start
```

### Database Operations
```bash
# Run migrations
bun run migrate

# Generate Prisma client
bun run generate

# Open Prisma Studio
bun run studio
```

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get server info
curl http://localhost:3000
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Request validation and sanitization
- **Rate Limiting**: Protection against abuse

## 🧠 AI Features

### Financial Insights
- Spending pattern analysis
- Income source tracking
- Personalized recommendations
- Financial health metrics

### Smart Budget
- 50/30/20 budget rule implementation
- Category-based spending limits
- AI-powered recommendations
- Emergency fund suggestions

### Expense Prediction
- Monthly and weekly predictions
- Seasonal trend analysis
- Confidence scoring
- Category-based forecasting

### Automation
- Spending limit alerts
- Savings goal automation
- Bill reminders
- Investment suggestions

## 🚀 Performance

### Bun Optimizations
- **Fast startup**: Instant server startup
- **Hot reload**: Development efficiency
- **TypeScript**: Native compilation
- **Memory efficient**: Optimized resource usage

### Database Performance
- **Prisma ORM**: Type-safe database queries
- **Connection pooling**: Efficient database connections
- **Query optimization**: Optimized database operations

## 🔮 Future Enhancements

### Planned Features
- **Real-time notifications**: WebSocket integration
- **Advanced analytics**: Detailed financial reports
- **Mobile app**: React Native integration
- **Third-party integrations**: Banking APIs
- **Machine learning**: Advanced prediction models

### Technical Improvements
- **GraphQL**: Alternative to REST API
- **Microservices**: Service decomposition
- **Docker**: Containerization
- **CI/CD**: Automated deployment
- **Monitoring**: Application monitoring

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Document API endpoints
- Maintain code quality

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Write meaningful commit messages
- Include JSDoc comments

## 📄 License

This project is licensed under the MIT License.

---

*Built with ❤️ using Bun's native server capabilities*
