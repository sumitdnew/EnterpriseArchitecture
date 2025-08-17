# Enterprise Architecture Platform

A comprehensive AI-powered platform for generating enterprise architecture recommendations, industry-specific diagrams, and development standards with flexible configuration options.

## 🚀 Features

### 🤖 AI-Powered Architecture Recommendations
- **OpenAI GPT-4 Integration** - Intelligent architecture analysis based on project requirements
- **Industry-Specific Compliance** - Automatic inclusion of relevant compliance frameworks (HIPAA, SOX, PCI, etc.)
- **Context-Aware Recommendations** - Tailored advice based on user volume, industry, and project description
- **Real-time AI Analysis** - Live processing with loading indicators and error handling
- **Smart Defaults** - AI recommendations automatically populate project configuration

### 🏭 Industry-Specific Support
- **20+ Industries** - Healthcare, Financial, Manufacturing, Logistics, Media, Gaming, Automotive, Energy, and more
- **Industry-Specific Diagrams** - Custom architecture diagrams for each industry
- **Compliance Automation** - Automatic compliance framework detection and inclusion
- **Regulatory Awareness** - Built-in knowledge of industry regulations and requirements
- **30+ Compliance Frameworks** - Comprehensive coverage of industry standards

### ⚙️ Flexible Project Configuration
- **Optional Components** - Choose which components you need (Database, Message Queue, Caching, etc.)
- **Smart Defaults** - AI suggests typical components but allows full customization
- **"Not Required" Options** - Skip components that aren't needed for your project
- **Dynamic Architecture** - Diagrams adapt based on selected components

### 📊 Interactive Architecture Diagrams
- **6 Diagram Types** - System Architecture, Component, Data Flow, Deployment, Security, Compliance
- **Industry-Customized Services** - Healthcare (Patient Service, Medical Service), Financial (Account Service, Transaction Service), etc.
- **Interactive Review** - Team collaboration and approval workflow
- **Export Options** - SVG, PNG, and Mermaid code export
- **Dynamic Components** - Only shows selected components in diagrams

### 🔧 Development Standards Generator
- **Enterprise Prompts** - AI-generated development prompts and standards
- **Testing Strategies** - Comprehensive testing recommendations
- **Performance Targets** - Industry-specific performance benchmarks
- **Security Guidelines** - Enterprise-grade security recommendations

### 🛡️ Architecture Validation
- **Compliance Checking** - Automated compliance validation
- **Security Assessment** - Security architecture review
- **Performance Analysis** - Performance and scalability validation
- **Best Practices** - Industry best practices validation

## 🏗️ Architecture

### Core Components
- **EnterprisePlatform.tsx** - Main application component with flexible configuration
- **DiagramGenerator.tsx** - Interactive diagram generation with dynamic components
- **DiagramReview.tsx** - Team review and approval workflow
- **ArchitectureValidator.tsx** - Validation and compliance checking
- **openaiService.ts** - OpenAI API integration service

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Diagrams**: Mermaid.js
- **AI**: OpenAI GPT-4 API
- **Build Tool**: Create React App

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sumitdnew/EnterpriseArchitecture.git
   cd enterprise-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure OpenAI API:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to view the application

## 📋 Usage Guide

### 1. Architecture Consultant
1. **Describe your project** - Enter detailed project requirements
2. **Select industry** - Choose from 20+ industry types
3. **Specify user volume** - Set expected number of users
4. **Get AI recommendations** - Receive intelligent architecture suggestions
5. **Review auto-populated config** - AI recommendations automatically fill project settings

### 2. Project Configuration
1. **Flexible Architecture** - Choose architecture pattern (Microservices, Monolith, Serverless, etc.)
2. **Optional Components** - Select which components you need:
   - **Database**: PostgreSQL, MySQL, MongoDB, or "No Database Required"
   - **Message Queue**: Kafka, RabbitMQ, or "No Message Queue Required"
   - **Caching**: Redis, Memcached, or "No Caching Required"
   - **Monitoring**: Prometheus, Datadog, or "No Monitoring Required"
3. **Industry Compliance** - Auto-selected based on industry, manually adjustable

### 3. Diagram Review
1. **Review generated diagrams** - 6 different diagram types
2. **Dynamic components** - Only shows selected components
3. **Team collaboration** - Invite team members for review
4. **Add comments** - Provide feedback and suggestions
5. **Approve architecture** - Move to next phase

### 4. Standards Generator
1. **Generate prompts** - AI-powered development standards
2. **Customize requirements** - Tailor to your specific needs
3. **Export standards** - Download for team use

### 5. Architecture Validation
1. **Upload implementation** - Submit your architecture
2. **Run validation** - Automated compliance and security checks
3. **Review results** - Get detailed validation report

## 🏭 Supported Industries

| Industry | Compliance Frameworks | Specialized Services | Use Cases |
|----------|---------------------|---------------------|-----------|
| Healthcare | HIPAA, HITECH, FDA | Patient Service, Medical Service, Billing Service | EHR, Telemedicine, Medical Devices |
| Financial | SOX, PCI, Basel-III, GLBA | Account Service, Transaction Service, Payment Service | Banking, Insurance, Trading Platforms |
| Manufacturing | ISO-27001, ISO-9001 | Production Service, Quality Service, Inventory Service | Smart Factory, Supply Chain, Quality Control |
| Logistics | ISO-28000 | Tracking Service, Delivery Service, Route Service | Fleet Management, E-commerce, Supply Chain |
| Media | DRM, Copyright | Content Service, Recommendation Service, Playback Service | Streaming, Content Management, Digital Rights |
| Gaming | COPPA, ESRB | Game Service, Matchmaking Service, Payment Service | Mobile Games, Online Gaming, Esports |
| Automotive | ISO-26262, AUTOSAR | IoT Service, Telemetry Service, Safety Service | Connected Cars, Autonomous Vehicles, Fleet Management |
| Energy | NERC-CIP, ISO-27001 | Monitoring Service, Control Service, Safety Service | Smart Grid, Renewable Energy, Utilities |
| Government | FedRAMP, FISMA, NIST | Security Service, Compliance Service, Audit Service | Digital Government, Public Services, Defense |
| Education | FERPA, COPPA | Learning Service, Assessment Service, Content Service | EdTech, LMS, Student Management |
| Real Estate | Fair Housing, MLS Compliance | Property Service, Agent Service, Listing Service | Property Management, Real Estate Platforms |
| Travel | PCI, GDPR | Booking Service, Payment Service, Review Service | Travel Booking, Hospitality, Tourism |
| Telecom | California Privacy, FCC | Billing Service, Network Service, Customer Service | Telecommunications, ISP, Mobile Services |
| Legal | Attorney-Client Privilege, Data Retention | Case Management, Document Service, Billing Service | Legal Tech, Law Firms, Compliance |
| Agriculture | Food Safety, Traceability | Farm Service, Supply Chain Service, Monitoring Service | AgTech, Food Safety, Supply Chain |

## 🔧 Configuration

### Environment Variables
```bash
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### Project Configuration Options

#### Architecture Patterns
- **Microservices** - Distributed services architecture
- **Modular Monolith** - Single application with modular design
- **Serverless** - Event-driven, cloud-native architecture
- **Event-Driven** - Asynchronous, message-based architecture

#### Technology Stacks
- **Spring Boot (Java)** - Enterprise Java development
- **Node.js (Express)** - JavaScript/TypeScript backend
- **.NET Core** - Microsoft ecosystem
- **Python (FastAPI)** - High-performance Python API
- **Go (Gin)** - High-performance Go backend

#### Optional Components
- **Database**: PostgreSQL, MySQL, MongoDB, Cassandra, TimescaleDB, Neo4j, or None
- **Message Queue**: Kafka, RabbitMQ, Redis Streams, AWS SQS, MQTT, or None
- **Caching**: Redis, Memcached, Hazelcast, ElastiCache, Redis Cluster, or None
- **Monitoring**: Prometheus, Grafana, Datadog, New Relic, ELK Stack, or None

### Customization
- **Industry Compliance**: Add new industries in `validateAndEnhanceCompliance()`
- **Diagram Types**: Extend diagram generation in `DiagramGenerator.tsx`
- **AI Prompts**: Modify prompts in `openaiService.ts`
- **Component Options**: Add new options in project configuration

## 📊 API Integration

### OpenAI API
- **Model**: GPT-4
- **Tokens**: ~1000-2000 per request
- **Cost**: ~$0.03-0.06 per request
- **Rate Limiting**: Built-in error handling and fallbacks

### Error Handling
- **API Failures**: Graceful fallback to default recommendations
- **Network Issues**: Retry logic and user-friendly error messages
- **Invalid Responses**: JSON parsing with fallback recommendations

## 🛡️ Security

### Development
- **Environment Variables**: API keys stored in `.env.local`
- **No Hardcoded Secrets**: All sensitive data in environment variables
- **CORS Protection**: Frontend-only API calls

### Production Considerations
- **Backend API**: Implement server-side API calls to protect API keys
- **Rate Limiting**: Add request throttling
- **API Key Rotation**: Implement key rotation strategy
- **HTTPS**: Ensure all communications are encrypted

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Serve production build locally
npx serve -s build

# Deploy to hosting platform
# (Upload build/ folder to your hosting provider)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: See `OPENAI_SETUP.md` for detailed setup instructions
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions for help and ideas

## 🔄 Changelog

### v1.1.0 (Latest)
- ✅ Flexible project configuration with optional components
- ✅ "Not Required" options for database, message queue, caching, monitoring
- ✅ Improved compliance framework handling and normalization
- ✅ Enhanced industry synchronization between consultant and project config
- ✅ Better debugging and logging for compliance selection
- ✅ Comprehensive compliance framework mapping (30+ frameworks)

### v1.0.0
- ✅ AI-powered architecture recommendations
- ✅ Industry-specific compliance automation
- ✅ Interactive diagram generation
- ✅ Team review workflow
- ✅ Development standards generator
- ✅ Architecture validation
- ✅ 20+ industry support
- ✅ OpenAI GPT-4 integration

---

**Built with ❤️ for enterprise architects and development teams**

*Repository: [https://github.com/sumitdnew/EnterpriseArchitecture.git](https://github.com/sumitdnew/EnterpriseArchitecture.git)*
