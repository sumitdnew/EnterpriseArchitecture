import React, { useState, useCallback, useEffect } from 'react';
import { 
  ChevronRight, 
  Settings, 
  Code, 
  Shield, 
  TestTube, 
  Rocket, 
  Monitor, 
  FileText, 
  Download, 
  Copy, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Award, 
  RefreshCw, 
  BarChart3, 
  Home, 
  Brain, 
  MessageCircle, 
  Lightbulb, 
  ArrowRight,
  Map,
  Eye,
  FileCheck,
  Info,
  Palette
} from 'lucide-react';
import DiagramReview from './DiagramReview';
import ArchitectureValidator from './ArchitectureValidator';
import { callOpenAI } from '../services/openaiService';

// Simple debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const EnterprisePlatform = () => {
  const [activeTab, setActiveTab] = useState('consultant');
  const [activeStep, setActiveStep] = useState(0);
  const [workflowStep, setWorkflowStep] = useState(1); // 1: Consultant, 2: Review, 3: Generator, 4: Validator
     const [projectConfig, setProjectConfig] = useState({
     projectName: '',
     projectType: 'microservices',
     techStack: 'spring-boot',
     database: 'postgresql',
     messageQueue: 'kafka',
     caching: 'redis',
     monitoring: 'prometheus',
     deployment: 'kubernetes',
     securityLevel: 'standard',
     scalingStrategy: 'manual-scaling',
     dataRetention: '3-years',
     compliance: [] as string[],
     industry: 'general',
     dataClassification: 'internal',
     customRequirements: ''
   });
  
  const [generatedPrompts, setGeneratedPrompts] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [projectHistory, setProjectHistory] = useState<any[]>([]);
  const [promptFilter, setPromptFilter] = useState('all');
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());
  const [showBestPractices, setShowBestPractices] = useState(false);
  
  // AI Architect states
  const [architectureRecommendations, setArchitectureRecommendations] = useState<any>(null);
  const [consultantStep, setConsultantStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showDiagramReview, setShowDiagramReview] = useState(false);
  const [aiGenerationTime, setAiGenerationTime] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState({
    projectDescription: '',
    userVolume: '',
    dataTypes: [],
    industry: '',
    performanceNeeds: '',
    teamSize: '',
    timeline: '',
    budget: '',
    specificRequirements: '',
    keyFeatures: '',
    dataComplexity: '',
    securityRequirements: ''
  });

  // Simple update functions without useCallback
  const updateProblemDescription = (updates: Partial<typeof problemDescription>) => {
    setProblemDescription(prev => ({ ...prev, ...updates }));
  };

  const updateArchitectureRecommendations = (recommendations: any) => {
    setArchitectureRecommendations(recommendations);
    
    console.log('🤖 AI Recommendations received:', recommendations);
    
    // Normalize compliance frameworks to match checkbox IDs
    const normalizeCompliance = (complianceList: string[]) => {
      if (!complianceList || !Array.isArray(complianceList)) return [];
      
      const complianceMap: { [key: string]: string } = {
        'hipaa': 'hipaa',
        'HIPAA': 'hipaa',
        'HITECH': 'hitech',
        'hitech': 'hitech',
        'FDA': 'fda',
        'fda': 'fda',
        'SOX': 'sox',
        'sox': 'sox',
        'PCI': 'pci',
        'pci': 'pci',
        'PCI DSS': 'pci',
        'GDPR': 'gdpr',
        'gdpr': 'gdpr',
        'CCPA': 'ccpa',
        'ccpa': 'ccpa',
        'ISO 27001': 'iso27001',
        'ISO27001': 'iso27001',
        'iso27001': 'iso27001',
        'ISO 9001': 'iso9001',
        'ISO9001': 'iso9001',
        'iso9001': 'iso9001',
        'ISO 28000': 'iso28000',
        'ISO28000': 'iso28000',
        'iso28000': 'iso28000',
        'FedRAMP': 'fedramp',
        'fedramp': 'fedramp',
        'FISMA': 'fisma',
        'fisma': 'fisma',
        'NIST': 'nist',
        'nist': 'nist',
        'FERPA': 'ferpa',
        'ferpa': 'ferpa',
        'COPPA': 'coppa',
        'coppa': 'coppa',
        'DRM': 'drm',
        'drm': 'drm',
        'Copyright': 'copyright',
        'copyright': 'copyright',
        'Fair Housing': 'fair-housing',
        'fair-housing': 'fair-housing',
        'MLS Compliance': 'mls-compliance',
        'mls-compliance': 'mls-compliance',
        'ISO 26262': 'iso26262',
        'ISO26262': 'iso26262',
        'iso26262': 'iso26262',
        'AUTOSAR': 'autosar',
        'autosar': 'autosar',
        'NERC CIP': 'nerc-cip',
        'nerc-cip': 'nerc-cip',
        'California Privacy': 'california-privacy',
        'california-privacy': 'california-privacy',
        'FCC': 'fcc',
        'fcc': 'fcc',
        'Attorney-Client Privilege': 'attorney-client-privilege',
        'attorney-client-privilege': 'attorney-client-privilege',
        'Data Retention': 'data-retention',
        'data-retention': 'data-retention',
        'ESRB': 'esrb',
        'esrb': 'esrb',
        'Food Safety': 'food-safety',
        'food-safety': 'food-safety',
        'Traceability': 'traceability',
        'traceability': 'traceability'
      };
      
      return complianceList
        .map(comp => complianceMap[comp] || comp.toLowerCase())
        .filter((comp, index, arr) => arr.indexOf(comp) === index); // Remove duplicates
    };
    
    // Auto-populate project configuration with AI recommendations
    if (recommendations) {
      setProjectConfig(prev => {
        const normalizedCompliance = normalizeCompliance(recommendations.compliance);
        
        const updatedConfig = {
          ...prev,
          projectType: recommendations.architecture || prev.projectType,
          techStack: recommendations.techStack || prev.techStack,
          database: recommendations.database || prev.database,
          messageQueue: recommendations.messageQueue || prev.messageQueue,
          caching: recommendations.caching || prev.caching,
          deployment: recommendations.deployment || prev.deployment,
          monitoring: recommendations.monitoring || prev.monitoring,
          // Auto-check compliance recommendations (normalized)
          compliance: normalizedCompliance.length > 0 ? normalizedCompliance : prev.compliance,
          // Sync industry from problem description
          industry: problemDescription.industry || prev.industry
        };
        
        console.log('⚙️ Updated project config:', updatedConfig);
        console.log('📋 Original compliance from AI:', recommendations.compliance);
        console.log('📋 Normalized compliance:', normalizedCompliance);
        console.log('📋 Final compliance array:', updatedConfig.compliance);
        
        return updatedConfig;
      });
    }
  };

  const updateShowRecommendations = (show: boolean) => {
    setShowRecommendations(show);
  };

  // Sync industry from problem description to project config
  useEffect(() => {
    if (problemDescription.industry && problemDescription.industry !== projectConfig.industry) {
      console.log('🔄 Syncing industry from problem description:', problemDescription.industry);
      handleIndustryChange(problemDescription.industry);
    }
  }, [problemDescription.industry]);

  // Debug compliance state when navigating to compliance step
  useEffect(() => {
    if (activeTab === 'generator' && activeStep === 1) {
      console.log('🔍 Compliance step activated');
      console.log('🔍 Current projectConfig.compliance:', projectConfig.compliance);
      console.log('🔍 Available compliance standards:', complianceStandards.map(s => s.id));
    }
  }, [activeTab, activeStep, projectConfig.compliance]);

  // Validate and enhance compliance recommendations based on industry
  const validateAndEnhanceCompliance = (recommendations: any, industry: string) => {
    console.log('🔍 Validating compliance for industry:', industry);
    console.log('🔍 Original compliance:', recommendations.compliance);
    
    const industryComplianceMap: { [key: string]: string[] } = {
      'healthcare': ['hipaa', 'hitech', 'fda'],
      'financial': ['sox', 'pci', 'basel-iii', 'glba'],
      'government': ['fedramp', 'fisma', 'nist'],
      'education': ['ferpa', 'coppa'],
      'manufacturing': ['iso27001', 'iso9001'],
      'logistics': ['iso28000'],
      'media': ['drm', 'copyright'],
      'realestate': ['fair-housing', 'mls-compliance'],
      'travel': ['pci', 'gdpr'],
      'automotive': ['iso26262', 'autosar'],
      'energy': ['nerc-cip', 'iso27001'],
      'telecom': ['california-privacy', 'fcc'],
      'legal': ['attorney-client-privilege', 'data-retention'],
      'gaming': ['coppa', 'esrb'],
      'agriculture': ['food-safety', 'traceability']
    };

    const currentCompliance = recommendations.compliance || [];
    const requiredCompliance = industryComplianceMap[industry] || [];
    
    // Add missing industry-specific compliance
    let enhancedCompliance = [...currentCompliance];
    requiredCompliance.forEach(comp => {
      if (!enhancedCompliance.some(c => c.toLowerCase().includes(comp.toLowerCase()))) {
        enhancedCompliance.push(comp);
      }
    });

    // Remove GDPR unless it's travel/financial/healthcare industry
    if (!['travel', 'financial', 'healthcare'].includes(industry)) {
      // Remove all GDPR variations
      const gdprVariations = ['gdpr', 'general data protection', 'eu privacy'];
      enhancedCompliance = enhancedCompliance.filter(comp => 
        !gdprVariations.some(variation => comp.toLowerCase().includes(variation))
      );
      console.log('🔒 Removed GDPR variations for', industry, 'industry');
    }

    console.log('🔍 Enhanced compliance:', enhancedCompliance);
    
    return {
      ...recommendations,
      compliance: enhancedCompliance
    };
  };

  // Workflow steps for better navigation
  const workflowSteps = [
    { 
      id: 1, 
      title: 'AI Architect', 
      subtitle: 'Define your project requirements',
      icon: Brain,
      description: 'Describe your project and get AI-powered architecture recommendations',
      status: 'active' as const
    },
    { 
      id: 2, 
      title: 'Diagram Review', 
      subtitle: 'Review and approve architecture',
      icon: Eye,
      description: 'Review generated diagrams and approve your architecture',
      status: 'pending' as const
    },
    { 
      id: 3, 
      title: 'Standards Generator', 
      subtitle: 'Generate development standards',
      icon: Settings,
      description: 'Create enterprise development standards and prompts',
      status: 'pending' as const
    },
    { 
      id: 4, 
      title: 'Architecture Validator', 
      subtitle: 'Validate your implementation',
      icon: FileCheck,
      description: 'Upload your code and validate against enterprise standards',
      status: 'pending' as const
    }
  ];

  // Update workflow step when architecture recommendations are generated
  useEffect(() => {
    if (architectureRecommendations && workflowStep === 1) {
      setWorkflowStep(2);
    }
  }, [architectureRecommendations, workflowStep]);

  // Update workflow step when diagram is approved
  useEffect(() => {
    if (activeTab === 'generator' && architectureRecommendations) {
      setWorkflowStep(3);
    }
  }, [activeTab, architectureRecommendations]);

  // Update workflow step when validation is accessed
  useEffect(() => {
    if (activeTab === 'validator') {
      setWorkflowStep(4);
    }
  }, [activeTab]);

  const mainTabs = [
    { id: 'dashboard', title: 'Dashboard', icon: Home },
          { id: 'consultant', title: 'AI Architect', icon: Brain },
    { id: 'generator', title: 'Standards Generator', icon: Settings },
    { id: 'design', title: 'Visual Design', icon: Palette },
    { id: 'validator', title: 'Architecture Validator', icon: BarChart3 },
    { id: 'how-it-works', title: 'How It Works', icon: Lightbulb },
    { id: 'about', title: 'About', icon: Info }
  ];

  const generatorSteps = [
    { id: 'project', title: 'Project Setup', icon: Settings },
    { id: 'compliance', title: 'Compliance', icon: Shield },
    { id: 'architecture', title: 'Architecture', icon: Code },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'testing', title: 'Testing', icon: TestTube },
    { id: 'deployment', title: 'CI/CD', icon: Rocket },
    { id: 'monitoring', title: 'Monitoring', icon: Monitor },
    { id: 'documentation', title: 'Documentation', icon: FileText },
    { id: 'output', title: 'Generate', icon: Download }
  ];

  const complianceStandards = [
    { id: 'sox', name: 'SOX (Sarbanes-Oxley)', description: 'Financial reporting and internal controls' },
    { id: 'hipaa', name: 'HIPAA', description: 'Healthcare data protection' },
    { id: 'hitech', name: 'HITECH', description: 'Health information technology standards' },
    { id: 'fda', name: 'FDA', description: 'Food and Drug Administration regulations' },
    { id: 'pci', name: 'PCI DSS', description: 'Payment card industry security' },
    { id: 'basel-iii', name: 'Basel III', description: 'Banking regulatory framework' },
    { id: 'glba', name: 'GLBA', description: 'Gramm-Leach-Bliley Act' },
    { id: 'gdpr', name: 'GDPR', description: 'EU data protection regulation' },
    { id: 'ccpa', name: 'CCPA', description: 'California consumer privacy act' },
    { id: 'iso27001', name: 'ISO 27001', description: 'Information security management' },
    { id: 'iso9001', name: 'ISO 9001', description: 'Quality management systems' },
    { id: 'iso28000', name: 'ISO 28000', description: 'Supply chain security management' },
    { id: 'fedramp', name: 'FedRAMP', description: 'Federal cloud security requirements' },
    { id: 'fisma', name: 'FISMA', description: 'Federal information security' },
    { id: 'nist', name: 'NIST', description: 'National Institute of Standards and Technology' },
    { id: 'ferpa', name: 'FERPA', description: 'Family Educational Rights and Privacy Act' },
    { id: 'coppa', name: 'COPPA', description: 'Children\'s Online Privacy Protection Act' },
    { id: 'drm', name: 'DRM', description: 'Digital Rights Management' },
    { id: 'copyright', name: 'Copyright', description: 'Intellectual property protection' },
    { id: 'fair-housing', name: 'Fair Housing', description: 'Real estate anti-discrimination' },
    { id: 'mls-compliance', name: 'MLS Compliance', description: 'Multiple Listing Service rules' },
    { id: 'iso26262', name: 'ISO 26262', description: 'Automotive functional safety' },
    { id: 'autosar', name: 'AUTOSAR', description: 'Automotive software architecture' },
    { id: 'nerc-cip', name: 'NERC CIP', description: 'Critical infrastructure protection' },
    { id: 'california-privacy', name: 'California Privacy', description: 'California privacy laws' },
    { id: 'fcc', name: 'FCC', description: 'Federal Communications Commission' },
    { id: 'attorney-client-privilege', name: 'Attorney-Client Privilege', description: 'Legal confidentiality' },
    { id: 'data-retention', name: 'Data Retention', description: 'Legal data retention requirements' },
    { id: 'esrb', name: 'ESRB', description: 'Entertainment Software Rating Board' },
    { id: 'food-safety', name: 'Food Safety', description: 'Agricultural food safety standards' },
    { id: 'traceability', name: 'Traceability', description: 'Supply chain traceability' }
  ];

  const handleComplianceChange = (compliance: string) => {
    const newCompliance = projectConfig.compliance.includes(compliance)
      ? projectConfig.compliance.filter(c => c !== compliance)
      : [...projectConfig.compliance, compliance];
    setProjectConfig({...projectConfig, compliance: newCompliance});
  };

  const handleIndustryChange = (industry: string) => {
    // Auto-select compliance frameworks based on industry
    const industryComplianceMap: { [key: string]: string[] } = {
      'healthcare': ['hipaa', 'hitech', 'fda'],
      'financial': ['sox', 'pci', 'basel-iii', 'glba'],
      'government': ['fedramp', 'fisma', 'nist'],
      'education': ['ferpa', 'coppa'],
      'manufacturing': ['iso27001', 'iso9001'],
      'logistics': ['iso28000'],
      'media': ['drm', 'copyright'],
      'realestate': ['fair-housing', 'mls-compliance'],
      'travel': ['pci', 'gdpr'],
      'automotive': ['iso26262', 'autosar'],
      'energy': ['nerc-cip', 'iso27001'],
      'telecom': ['california-privacy', 'fcc'],
      'legal': ['attorney-client-privilege', 'data-retention'],
      'gaming': ['coppa', 'esrb'],
      'agriculture': ['food-safety', 'traceability']
    };

    const recommendedCompliance = industryComplianceMap[industry] || [];
    
    console.log('🏭 Industry changed to:', industry);
    console.log('📋 Recommended compliance:', recommendedCompliance);
    
    setProjectConfig(prev => ({
      ...prev,
      industry: industry,
      compliance: recommendedCompliance
    }));
  };

  const generateComplianceRequirements = () => {
    let requirements = [];
    
    if (projectConfig.compliance.includes('sox')) {
      requirements.push(`SOX COMPLIANCE REQUIREMENTS:
- Implement immutable audit trails for all financial data modifications
- Segregation of duties with role-based access controls
- Automated control testing and monitoring
- Change management controls with approval workflows
- Data retention policies for financial records (7+ years)
- Internal controls documentation and testing procedures`);
    }
    
    if (projectConfig.compliance.includes('hipaa')) {
      requirements.push(`HIPAA COMPLIANCE REQUIREMENTS:
- Encrypt all PHI (Protected Health Information) at rest and in transit
- Implement access controls with minimum necessary principle
- Audit logging for all PHI access and modifications
- Business Associate Agreements (BAA) for third-party services
- Risk assessment and vulnerability management procedures
- Breach notification procedures and incident response plans
- Employee training and access termination procedures`);
    }
    
    if (projectConfig.compliance.includes('pci')) {
      requirements.push(`PCI DSS COMPLIANCE REQUIREMENTS:
- Never store sensitive authentication data (CVV, PIN)
- Encrypt cardholder data using AES-256 or equivalent
- Implement strong access control measures with unique IDs
- Regular security testing and vulnerability assessments
- Network segmentation to isolate cardholder data environment
- Secure coding practices and regular security updates
- File integrity monitoring and intrusion detection systems`);
    }
    
    if (projectConfig.compliance.includes('gdpr')) {
      requirements.push(`GDPR COMPLIANCE REQUIREMENTS:
- Implement data subject rights (access, rectification, erasure, portability)
- Privacy by design and by default principles
- Data processing lawful basis documentation
- Data Protection Impact Assessments (DPIA) for high-risk processing
- Consent management with granular controls
- Data breach notification procedures (72-hour requirement)
- Data retention and deletion policies with automated enforcement`);
    }
    
    return requirements.join('\n\n');
  };

  const handleGeneratePrompts = () => {
    const prompts = [
      {
        phase: "Architecture Setup",
        priority: "Critical",
        prompt: `Create a ${projectConfig.projectType} architecture using ${projectConfig.techStack} with enterprise standards:

CORE SERVICES SETUP:
- Implement Clean Architecture with separate layers (presentation, application, domain, infrastructure)
- Set up API Gateway with rate limiting, authentication, and request routing
- Configure service discovery and load balancing
- Implement ${projectConfig.database} database per service pattern with connection pooling
- Set up ${projectConfig.messageQueue} for asynchronous communication with dead letter queues
- Configure ${projectConfig.caching} for distributed caching with TTL policies

ENTERPRISE PATTERNS:
- Circuit breaker pattern for external service calls with fallback mechanisms
- Retry logic with exponential backoff for transient failures
- Health check endpoints for all services (/health, /ready, /metrics)
- Correlation ID propagation across all service calls
- Structured logging with JSON format and correlation tracking

CODE QUALITY STANDARDS:
- Implement dependency injection container
- Set up exception handling middleware with proper error responses
- Create base classes for controllers, services, and repositories
- Include input validation with custom validators
- Set up automatic API documentation generation`
      },
      {
        phase: "Security Implementation",
        priority: "Critical", 
        prompt: `Implement comprehensive enterprise security framework:

AUTHENTICATION & AUTHORIZATION:
- OAuth 2.0 / OpenID Connect integration with JWT tokens
- Refresh token rotation with secure storage
- Role-based access control (RBAC) with fine-grained permissions
- API key management for service-to-service communication
- Session management with secure cookies and CSRF protection

DATA PROTECTION:
- AES-256 encryption for sensitive data at rest
- TLS 1.3 for all communications in transit
- Input validation and sanitization for all endpoints (OWASP guidelines)
- SQL injection prevention with parameterized queries
- XSS protection with content security policies

SECURITY MONITORING:
- Audit logging for all authentication attempts and data modifications
- Failed login attempt detection with account lockout policies
- Security event correlation and alerting
- Vulnerability scanning integration in CI/CD pipeline
- Security headers implementation (HSTS, CSP, X-Frame-Options)`
      },
      {
        phase: "Testing Framework",
        priority: "High",
        prompt: `Set up comprehensive testing strategy following enterprise standards:

UNIT TESTING (Target: 90% coverage):
- Test framework setup with parallel execution
- Mock all external dependencies (databases, APIs, message queues)
- Test data builders and fixtures for consistent test scenarios
- Parameterized tests for edge cases and boundary conditions
- Performance unit tests for critical business logic

INTEGRATION TESTING:
- API contract testing for all endpoints with request/response validation
- Database integration tests with test containers
- Message queue integration testing with embedded brokers
- External service integration tests with WireMock
- Cross-service communication testing

END-TO-END TESTING:
- Critical user journey automation covering main business flows
- Browser compatibility testing for web interfaces
- API workflow testing covering complete business processes
- Performance testing with load scenarios and stress testing
- Security testing including OWASP Top 10 validation

QUALITY GATES:
- Automated test execution in CI pipeline
- Code coverage reporting with quality gates
- Test result aggregation and reporting
- Flaky test detection and management`
      },
      {
        phase: "CI/CD Pipeline",
        priority: "Critical",
        prompt: `Create enterprise-grade CI/CD pipeline with ${projectConfig.deployment}:

CONTINUOUS INTEGRATION PIPELINE:
stages:
  - code-quality:
      - Static code analysis (SonarQube)
      - Dependency vulnerability scanning
      - Code formatting and linting validation
      - Unit test execution with coverage reporting
  
  - build-package:
      - Multi-stage Docker build with layer optimization
      - Container security scanning (Trivy/Snyk)
      - Artifact versioning with semantic versioning
      - Package signing and attestation
  
  - automated-testing:
      - Integration test suite execution
      - Performance benchmark validation
      - Security testing (SAST/DAST)
      - API contract validation

CONTINUOUS DEPLOYMENT STRATEGY:
- Blue-green deployment configuration for zero-downtime releases
- Canary deployment with automated rollback triggers
- Feature flag integration for gradual feature rollouts
- Database migration automation with rollback procedures
- Infrastructure as Code with Terraform/Helm charts
- Environment promotion pipeline (DEV → QA → STAGING → PROD)

MONITORING INTEGRATION:
- Deployment success/failure notifications
- Automated health checks post-deployment
- Performance monitoring during deployments
- Rollback automation based on error rate thresholds`
      },
      {
        phase: "Observability Setup", 
        priority: "High",
        prompt: `Implement comprehensive observability with ${projectConfig.monitoring}:

LOGGING STRATEGY:
- Structured JSON logging with correlation IDs
- Centralized log aggregation (ELK Stack or similar)
- Log levels and filtering for production environments
- PII data scrubbing from logs automatically
- Log retention policies based on compliance requirements

METRICS AND MONITORING:
- Business metrics tracking (KPIs, conversion rates, user activity)
- Technical health indicators (response time, throughput, error rates)
- Infrastructure metrics (CPU, memory, disk, network)
- Custom application metrics for business logic performance
- SLA/SLO monitoring with alerting thresholds

DISTRIBUTED TRACING:
- Request correlation across all microservices
- Performance bottleneck identification in service chains
- Error propagation tracking and root cause analysis
- Dependency mapping and service interaction visualization

ALERTING AND INCIDENT RESPONSE:
- Multi-level alerting (warning, critical, emergency)
- Escalation procedures with on-call rotations
- Automated incident creation and tracking
- Runbook automation for common issues
- Post-incident analysis and improvement tracking`
      },
      {
        phase: "Documentation Framework",
        priority: "High",
        prompt: `Create comprehensive documentation suite for enterprise standards:

PROJECT DOCUMENTATION:
- README.md with quick start guide, prerequisites, and local development setup
- CONTRIBUTING.md with code standards, pull request process, and development workflow
- CHANGELOG.md with versioning strategy and release notes format
- LICENSE file and compliance documentation
- Project structure documentation with folder organization rationale

ARCHITECTURE DOCUMENTATION:
- Architecture Decision Records (ADRs) template and initial decisions
- System architecture diagrams (C4 model: Context, Container, Component, Code)
- Data flow diagrams and entity relationship diagrams
- API design guidelines and OpenAPI/Swagger specifications
- Service dependencies and integration points documentation
- Security architecture and threat model documentation

CODE DOCUMENTATION STANDARDS:
- Inline code documentation standards (JSDoc, Javadoc, etc.)
- Function and class documentation requirements
- API endpoint documentation with examples
- Database schema documentation with migration guides
- Configuration management documentation
- Error codes and troubleshooting guides

OPERATIONAL DOCUMENTATION:
- Deployment guides for each environment (dev, staging, production)
- Infrastructure setup and configuration management
- Monitoring and alerting runbooks
- Incident response procedures and escalation paths
- Backup and disaster recovery procedures
- Performance tuning and optimization guidelines

DEVELOPER ONBOARDING:
- New developer setup checklist and environment configuration
- Codebase walkthrough and key concepts explanation
- Testing strategy and how to run tests locally
- Debugging guides and common development issues
- Code review checklist and quality standards
- Development tools and IDE setup recommendations

BUSINESS DOCUMENTATION:
- Business requirements and user stories documentation
- Domain model and business logic explanation
- User acceptance criteria and testing scenarios
- Stakeholder communication and reporting templates
- Project roadmap and milestone tracking`
      }
    ];

    if (projectConfig.compliance.length > 0) {
      prompts.splice(2, 0, {
        phase: "Compliance Implementation",
        priority: "Critical",
        prompt: `Implement comprehensive compliance framework for: ${projectConfig.compliance.join(', ')}

${generateComplianceRequirements()}

COMPLIANCE ARCHITECTURE PATTERNS:
- Implement compliance-aware data models with classification tags
- Create audit event sourcing for immutable compliance trails
- Set up automated compliance monitoring and reporting
- Implement data lifecycle management with automated retention/deletion
- Create compliance dashboards and violation alerting
- Set up regular compliance scanning and assessment automation

DATA GOVERNANCE FRAMEWORK:
- Data classification system (Public, Internal, Confidential, Restricted)
- Data lineage tracking and impact analysis
- Automated policy enforcement at application and database levels
- Privacy-preserving data processing techniques (anonymization, pseudonymization)
- Cross-border data transfer controls and documentation
- Vendor risk assessment and third-party compliance validation

COMPLIANCE TESTING:
- Automated compliance rule testing in CI/CD pipeline
- Compliance regression testing for policy changes
- Data privacy impact testing for new features
- Security control effectiveness testing
- Compliance audit preparation and evidence collection automation`
      });
    }

    setGeneratedPrompts(prompts);
    setActiveStep(8);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Dashboard Component
  const DashboardView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Total Projects</h3>
              <p className="text-3xl font-bold text-blue-600">{projectHistory.length}</p>
            </div>
            <Code className="text-blue-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Avg. Score</h3>
              <p className="text-3xl font-bold text-green-600">
                {projectHistory.length > 0 
                  ? Math.round(projectHistory.reduce((acc, p) => acc + p.score, 0) / projectHistory.length)
                  : '—'
                }
              </p>
            </div>
            <Award className="text-green-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Compliance Ready</h3>
              <p className="text-3xl font-bold text-purple-600">
                {projectHistory.length > 0 
                  ? projectHistory.filter(p => p.score >= 85).length
                  : '—'
                }
              </p>
            </div>
            <Shield className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Recent Projects</h2>
        {projectHistory.length > 0 ? (
          <div className="space-y-4">
            {projectHistory.map(project => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-slate-800">{project.name}</h3>
                  <p className="text-sm text-slate-600">
                    Compliance: {project.compliance.join(', ')} • Last validated: {project.lastValidated}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(project.score)}`}>
                    {project.score}/100
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">View Details</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Code className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Projects Yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Start by getting architecture advice for your first project. 
              Once you validate your implementation, projects will appear here.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Get Architecture Advice
            </button>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start a New Project?</h2>
        <p className="text-blue-100 mb-6">
          Use the workflow navigation above to get started with your enterprise development project.
        </p>
        <div className="text-center">
          <button
            onClick={() => setActiveTab('consultant')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            Start New Project
          </button>
        </div>
      </div>
    </div>
  );

                                               // Simple Form Component with uncontrolled inputs to prevent focus loss
    const ConsultantForm = ({ 
      problemDescription, 
      updateProblemDescription, 
      updateArchitectureRecommendations,
      updateShowRecommendations
    }: {
      problemDescription: any;
      updateProblemDescription: (updates: any) => void;
      updateArchitectureRecommendations: (recommendations: any) => void;
      updateShowRecommendations: (show: boolean) => void;
         }) => {

     return (
       <div className="max-w-2xl mx-auto space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
               Project Type
             </label>
               <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={problemDescription.projectDescription}
                onChange={(e) => updateProblemDescription({ projectDescription: e.target.value })}
              >
               <option value="">Select Project Type</option>
               <option value="web-application">Web Application</option>
               <option value="mobile-app">Mobile Application</option>
               <option value="api-platform">API Platform</option>
               <option value="data-analytics">Data Analytics Platform</option>
               <option value="ecommerce-platform">E-commerce Platform</option>
               <option value="crm-system">CRM System</option>
               <option value="content-management">Content Management System</option>
               <option value="collaboration-tool">Collaboration Tool</option>
               <option value="iot-platform">IoT Platform</option>
               <option value="ai-ml-platform">AI/ML Platform</option>
               <option value="blockchain-platform">Blockchain Platform</option>
               <option value="microservices-platform">Microservices Platform</option>
               <option value="real-time-system">Real-time System</option>
               <option value="enterprise-integration">Enterprise Integration</option>
               <option value="other">Other</option>
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
               Key Features
             </label>
             <select 
               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
               value={problemDescription.keyFeatures}
               onChange={(e) => {
                 const features = e.target.value;
                 updateProblemDescription({ keyFeatures: features });
               }}
             >
               <option value="">Select Key Features</option>
               <option value="user-authentication">User Authentication & Authorization</option>
               <option value="real-time-messaging">Real-time Messaging</option>
               <option value="file-upload">File Upload & Storage</option>
               <option value="payment-processing">Payment Processing</option>
               <option value="reporting-analytics">Reporting & Analytics</option>
               <option value="notifications">Push Notifications</option>
               <option value="search-functionality">Search Functionality</option>
               <option value="data-visualization">Data Visualization</option>
               <option value="workflow-automation">Workflow Automation</option>
               <option value="api-integration">Third-party API Integration</option>
               <option value="multi-tenancy">Multi-tenancy</option>
               <option value="offline-capability">Offline Capability</option>
               <option value="video-streaming">Video Streaming</option>
               <option value="ai-chatbot">AI Chatbot</option>
               <option value="other">Other</option>
             </select>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
               Data Complexity
             </label>
             <select 
               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
               value={problemDescription.dataComplexity}
               onChange={(e) => {
                 const complexity = e.target.value;
                 updateProblemDescription({ dataComplexity: complexity });
               }}
             >
               <option value="">Select Data Complexity</option>
               <option value="simple">Simple (Basic CRUD operations)</option>
               <option value="moderate">Moderate (Complex relationships)</option>
               <option value="complex">Complex (Big data, real-time processing)</option>
               <option value="very-complex">Very Complex (AI/ML, predictive analytics)</option>
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
               Security Requirements
             </label>
             <select 
               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
               value={problemDescription.securityRequirements}
               onChange={(e) => {
                 const security = e.target.value;
                 updateProblemDescription({ securityRequirements: security });
               }}
             >
               <option value="">Select Security Level</option>
               <option value="basic">Basic (Standard web security)</option>
               <option value="enhanced">Enhanced (Multi-factor auth, encryption)</option>
               <option value="enterprise">Enterprise (Compliance, audit trails)</option>
               <option value="government">Government (High security, certifications)</option>
             </select>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
               Industry
             </label>
                                                                                                               <select 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={problemDescription.industry}
                  onChange={(e) => updateProblemDescription({ industry: e.target.value })}
                >
               <option value="">Select Industry</option>
               <option value="healthcare">Healthcare & Life Sciences</option>
               <option value="financial">Financial Services & Banking</option>
               <option value="education">Education & EdTech</option>
               <option value="ecommerce">E-commerce & Retail</option>
               <option value="social">Social Media & Networking</option>
               <option value="enterprise">Enterprise Software & SaaS</option>
               <option value="government">Government & Public Sector</option>
               <option value="manufacturing">Manufacturing & Industrial</option>
               <option value="logistics">Logistics & Supply Chain</option>
               <option value="media">Media & Entertainment</option>
               <option value="realestate">Real Estate & Property</option>
               <option value="travel">Travel & Hospitality</option>
               <option value="automotive">Automotive & Transportation</option>
               <option value="energy">Energy & Utilities</option>
               <option value="telecom">Telecommunications</option>
               <option value="legal">Legal & Compliance</option>
               <option value="nonprofit">Non-profit & NGO</option>
               <option value="gaming">Gaming & Interactive</option>
               <option value="agriculture">Agriculture & Food</option>
               <option value="construction">Construction & Engineering</option>
               <option value="other">Other</option>
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
               Expected Users
             </label>
                                                                                                               <select 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={problemDescription.userVolume}
                  onChange={(e) => updateProblemDescription({ userVolume: e.target.value })}
                >
               <option value="">Select Range</option>
               <option value="1000">Less than 1,000</option>
               <option value="10000">1K - 10K</option>
               <option value="100000">10K - 100K</option>
               <option value="1000000">100K - 1M</option>
               <option value="10000000">1M+</option>
             </select>
           </div>
         </div>

                  <button
           onClick={async () => {
             // Get current values from state
             const currentProjectDescription = problemDescription.projectDescription;
             const currentIndustry = problemDescription.industry;
             const currentUserVolume = problemDescription.userVolume;
             
             console.log('Button clicked!', { currentProjectDescription, currentIndustry, currentUserVolume });
             
             // Show loading state
             setIsAnalyzing(true);
             
             try {
               console.log('🤖 Starting OpenAI analysis...');
               console.log('📝 Project Description:', currentProjectDescription);
               console.log('🏭 Industry:', currentIndustry);
               console.log('👥 Expected Users:', currentUserVolume);
               
               // OpenAI-powered intelligent recommendations
               const generateAIRecommendations = async () => {
                const userVolume = parseInt(currentUserVolume);
                const industry = currentIndustry;
                const projectType = currentProjectDescription;
                const keyFeatures = problemDescription.keyFeatures;
                const dataComplexity = problemDescription.dataComplexity;
                const securityRequirements = problemDescription.securityRequirements;
                
                try {
                  // Prepare the input JSON for OpenAI
                  const inputData = {
                    projectType: projectType,
                    industry: industry,
                    expectedUsers: parseInt(String(userVolume || '0')),
                    keyFeatures: keyFeatures,
                    dataComplexity: dataComplexity,
                    securityRequirements: securityRequirements
                  };

                  const prompt = `You are an expert enterprise architect. Analyze the following project requirements and generate architecture recommendations.

INPUT (JSON):
${JSON.stringify(inputData, null, 2)}

RULES:
1. For web applications: use monolith if <10K users, microservices if >100K users
2. For mobile apps: use backend-for-frontend pattern
3. For API platforms: use API Gateway pattern
4. For data analytics: use data lake architecture
5. For e-commerce: use event-driven architecture
6. For IoT: use edge computing with MQTT
7. For AI/ML: use ML pipeline architecture

Database selection:
- Simple data: PostgreSQL or MySQL
- Moderate data: PostgreSQL with Redis
- Complex data: MongoDB or distributed PostgreSQL
- Very complex data: multi-database architecture

Scaling strategy:
- <10K users: manual scaling
- 10K-100K users: auto-scaling
- 100K-1M users: microservices scaling
- >1M users: global scaling

Compliance requirements:
- Healthcare: ["hipaa", "hitech", "fda"]
- Financial: ["sox", "pci", "basel-iii", "glba"]
- Government: ["fedramp", "fisma", "nist"]
- Education: ["ferpa", "coppa"]

OUTPUT: Return ONLY a valid JSON object with this exact structure:
{
  "architecture": "monolith|microservices|event-driven|api-gateway|data-lake|edge-computing|ml-pipeline",
  "techStack": "spring-boot|nodejs|python|golang|dotnet|java",
  "database": "postgresql|mysql|mongodb|distributed-postgresql|multi-database",
  "messageQueue": "kafka",
  "caching": "redis",
  "deployment": "kubernetes",
  "compliance": ["array", "of", "compliance", "frameworks"],
  "securityLevel": "standard|enhanced|enterprise|government",
  "scalingStrategy": "manual-scaling|auto-scaling|microservices-scaling|global-scaling",
  "dataRetention": "7-years",
  "backupStrategy": "daily-incremental-weekly-full",
  "disasterRecovery": "multi-region",
  "performanceTargets": {
    "responseTime": "200ms",
    "throughput": "1000-rps",
    "availability": "99.9%"
  },
  "testingStrategy": {
    "unitCoverage": "95%",
    "integrationTests": "comprehensive",
    "e2eTests": "critical-paths",
    "performanceTests": "load-stress"
  },
  "additionalRecommendations": ["Follow enterprise best practices"],
  "aiInsights": {
    "complexity": "medium",
    "riskLevel": "medium",
    "estimatedTimeline": "6-12 months",
    "teamSize": "8-15 developers",
    "costEstimate": "$500K-$2M"
  }
}`;

                  // Call OpenAI API using the service
                  const data = await callOpenAI({
                    prompt: prompt,
                    max_tokens: 2000,
                    temperature: 0.3
                  });
                  
                  const aiResponse = data.choices?.[0]?.message?.content;
                  
                  if (!aiResponse) {
                    throw new Error('Invalid AI response');
                  }

                  // Parse the JSON response from OpenAI
                  let recommendations;
                  try {
                    if (!aiResponse || aiResponse.trim() === '') {
                      throw new Error('Empty AI response received');
                    }
                    
                    // Try to parse directly first
                    try {
                      recommendations = JSON.parse(aiResponse.trim());
                    } catch (directParseError) {
                      // Clean the response and extract JSON
                      let cleanedResponse = aiResponse.trim();
                      
                      // Remove any markdown code blocks
                      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
                      
                      // Find JSON object in the response
                      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        recommendations = JSON.parse(jsonMatch[0]);
                      } else {
                        throw new Error('No valid JSON found in AI response');
                      }
                    }
                    
                    // Validate required fields
                    const requiredFields = ['architecture', 'techStack', 'database', 'compliance'];
                    for (const field of requiredFields) {
                      if (!recommendations[field]) {
                        throw new Error(`Missing required field: ${field}`);
                      }
                    }
                    
                  } catch (parseError) {
                    console.error('Failed to parse AI response:', parseError);
                    throw new Error('Failed to parse AI recommendations. Please try again.');
                  }

                  return recommendations;
                } catch (error) {
                  console.error('OpenAI API error:', error);
                  throw new Error('Failed to get AI recommendations. Please try again.');
                }
             };
             
               const recommendations = await generateAIRecommendations();
               
               updateArchitectureRecommendations(recommendations);
               updateShowRecommendations(true);
               setAiGenerationTime(new Date().toLocaleString());
             } catch (error) {
               console.error('❌ Error generating recommendations:', error);
               alert('Failed to generate recommendations. Please try again.');
             } finally {
               setIsAnalyzing(false);
             }
           }}
                                               disabled={!problemDescription.projectDescription || !problemDescription.industry || !problemDescription.keyFeatures || !problemDescription.dataComplexity || !problemDescription.securityRequirements || isAnalyzing}
           className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold"
         >
           {isAnalyzing ? (
             <div className="flex items-center justify-center">
               <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
               Analyzing with AI...
             </div>
           ) : (
             'Get Architecture Recommendations'
           )}
         </button>
       </div>
     );
   };

           // Simple AI Architect Component
    const ArchitectureConsultantView = ({ 
      problemDescription, 
      setProblemDescription, 
      setProjectConfig, 
      setActiveTab,
      projectConfig,
      showRecommendations,
      setShowRecommendations,
      architectureRecommendations,
      setArchitectureRecommendations
    }: {
      problemDescription: any;
      setProblemDescription: any;
      setProjectConfig: any;
      setActiveTab: any;
      projectConfig: any;
      showRecommendations: boolean;
      setShowRecommendations: any;
      architectureRecommendations: any;
      setArchitectureRecommendations: any;
    }) => {
     // Show recommendations if they exist
     if (showRecommendations && architectureRecommendations) {
       return (
         <div className="bg-white rounded-xl shadow-lg p-8">
           <div className="text-center">
             <Brain className="mx-auto text-purple-600 mb-6" size={64} />
             <h2 className="text-3xl font-bold text-slate-800 mb-4">
               Architecture Recommendations
             </h2>
             <div className="flex items-center justify-center mb-4">
               <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                 <Brain size={16} className="mr-2" />
                 Powered by OpenAI GPT-4
               </div>
             </div>
                           <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Based on your project description, here are our AI-powered recommendations:
              </p>
              
              {/* User Input Summary */}
              <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Project Requirements</h3>
                <div className="text-slate-700 space-y-2">
                  <p><strong>Project Type:</strong> {problemDescription.projectDescription || 'Not specified'}</p>
                  <p><strong>Industry:</strong> {problemDescription.industry || 'Not specified'}</p>
                  <p><strong>Expected Users:</strong> {problemDescription.userVolume ? `${parseInt(problemDescription.userVolume).toLocaleString()}+ users` : 'Not specified'}</p>
                  <p><strong>Key Features:</strong> {problemDescription.keyFeatures || 'Not specified'}</p>
                  <p><strong>Data Complexity:</strong> {problemDescription.dataComplexity || 'Not specified'}</p>
                  <p><strong>Security Requirements:</strong> {problemDescription.securityRequirements || 'Not specified'}</p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Summary:</strong> You're building a {problemDescription.projectDescription || 'project'} for the {problemDescription.industry || 'general'} industry, 
                    expecting {problemDescription.userVolume ? `${parseInt(problemDescription.userVolume).toLocaleString()}+ users` : 'an unspecified number of users'}, 
                    with {problemDescription.keyFeatures || 'standard'} features, 
                    {problemDescription.dataComplexity || 'moderate'} data complexity, 
                    and {problemDescription.securityRequirements || 'standard'} security requirements.
                  </p>
                </div>
              </div>
             
             <div className="max-w-4xl mx-auto space-y-6">
               {/* Core Architecture */}
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                 <h3 className="text-xl font-semibold text-blue-800 mb-4">Core Architecture</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="font-medium">Architecture Pattern:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.architecture}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Technology Stack:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.techStack}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Database:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.database}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Message Queue:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.messageQueue}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Caching:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.caching}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Deployment:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.deployment}</span>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="font-medium">Security Level:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.securityLevel}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Scaling Strategy:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.scalingStrategy}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Data Retention:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.dataRetention}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Backup Strategy:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.backupStrategy}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Disaster Recovery:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.disasterRecovery}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Monitoring:</span>
                       <span className="text-blue-600 font-semibold">{architectureRecommendations.monitoring}</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Performance Targets */}
               <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                 <h3 className="text-xl font-semibold text-green-800 mb-4">Performance Targets</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="text-center">
                     <div className="text-2xl font-bold text-green-600">{architectureRecommendations.performanceTargets.responseTime}</div>
                     <div className="text-sm text-green-700">Response Time</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-green-600">{architectureRecommendations.performanceTargets.throughput}</div>
                     <div className="text-sm text-green-700">Throughput</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-green-600">{architectureRecommendations.performanceTargets.availability}</div>
                     <div className="text-sm text-green-700">Availability</div>
                   </div>
                 </div>
               </div>

               {/* Testing Strategy */}
               <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                 <h3 className="text-xl font-semibold text-purple-800 mb-4">Testing Strategy</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="font-medium">Unit Coverage:</span>
                       <span className="text-purple-600 font-semibold">{architectureRecommendations.testingStrategy.unitCoverage}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Integration Tests:</span>
                       <span className="text-purple-600 font-semibold">{architectureRecommendations.testingStrategy.integrationTests}</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="font-medium">E2E Tests:</span>
                       <span className="text-purple-600 font-semibold">{architectureRecommendations.testingStrategy.e2eTests}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Performance Tests:</span>
                       <span className="text-purple-600 font-semibold">{architectureRecommendations.testingStrategy.performanceTests}</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* AI Insights */}
               <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                 <h3 className="text-xl font-semibold text-indigo-800 mb-4">AI Project Insights</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="font-medium">Project Complexity:</span>
                       <span className={`font-semibold ${
                         architectureRecommendations.aiInsights.complexity === 'high' ? 'text-red-600' : 'text-yellow-600'
                       }`}>
                         {architectureRecommendations.aiInsights.complexity.toUpperCase()}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Risk Level:</span>
                       <span className={`font-semibold ${
                         architectureRecommendations.aiInsights.riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'
                       }`}>
                         {architectureRecommendations.aiInsights.riskLevel.toUpperCase()}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Estimated Timeline:</span>
                       <span className="text-indigo-600 font-semibold">{architectureRecommendations.aiInsights.estimatedTimeline}</span>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="font-medium">Recommended Team Size:</span>
                       <span className="text-indigo-600 font-semibold">{architectureRecommendations.aiInsights.teamSize}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-medium">Cost Estimate:</span>
                       <span className="text-indigo-600 font-semibold">{architectureRecommendations.aiInsights.costEstimate}</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Additional AI Recommendations */}
               {architectureRecommendations.additionalRecommendations && architectureRecommendations.additionalRecommendations.length > 0 && (
                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                   <h3 className="text-xl font-semibold text-orange-800 mb-4">AI-Generated Additional Recommendations</h3>
                   <div className="space-y-2">
                     {architectureRecommendations.additionalRecommendations.map((rec: string, index: number) => (
                       <div key={index} className="flex items-start">
                         <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                         <span className="text-orange-700">{rec}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Compliance */}
               {architectureRecommendations.compliance.length > 0 && (
                 <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                   <h3 className="text-xl font-semibold text-red-800 mb-4">Compliance Requirements</h3>
                   <div className="flex flex-wrap gap-2">
                     {architectureRecommendations.compliance.map((comp: string) => (
                       <span key={comp} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                         {comp.toUpperCase()}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
             
               <div className="flex space-x-4">
                 <button
                   onClick={() => {
                     // Apply all recommendations to project config
                     setProjectConfig({
                       ...projectConfig,
                                               projectName: problemDescription.projectDescription.split(' ').slice(0, 3).join('-').toLowerCase(),
                       projectType: architectureRecommendations.architecture,
                       techStack: architectureRecommendations.techStack,
                       database: architectureRecommendations.database,
                       messageQueue: architectureRecommendations.messageQueue,
                       caching: architectureRecommendations.caching,
                       monitoring: architectureRecommendations.monitoring,
                       deployment: architectureRecommendations.deployment,
                       compliance: architectureRecommendations.compliance,
                                               industry: problemDescription.industry,
                       dataClassification: architectureRecommendations.securityLevel === 'enterprise' ? 'confidential' : 'internal',
                       customRequirements: `AI-Generated Requirements: Performance Targets: ${architectureRecommendations.performanceTargets.responseTime} response time, ${architectureRecommendations.performanceTargets.throughput} throughput, ${architectureRecommendations.performanceTargets.availability} availability. Testing: ${architectureRecommendations.testingStrategy.unitCoverage} unit coverage, ${architectureRecommendations.testingStrategy.integrationTests} integration tests, ${architectureRecommendations.testingStrategy.e2eTests} E2E tests, ${architectureRecommendations.testingStrategy.performanceTests} performance tests. Scaling: ${architectureRecommendations.scalingStrategy}. Data Retention: ${architectureRecommendations.dataRetention}. Backup: ${architectureRecommendations.backupStrategy}. Disaster Recovery: ${architectureRecommendations.disasterRecovery}. ${architectureRecommendations.additionalRecommendations ? 'Additional Recommendations: ' + architectureRecommendations.additionalRecommendations.join(', ') : ''} Project Insights: Complexity: ${architectureRecommendations.aiInsights.complexity}, Risk Level: ${architectureRecommendations.aiInsights.riskLevel}, Timeline: ${architectureRecommendations.aiInsights.estimatedTimeline}, Team Size: ${architectureRecommendations.aiInsights.teamSize}, Cost: ${architectureRecommendations.aiInsights.costEstimate}.`
                     });
                     setShowDiagramReview(true);
                   }}
                   className="flex-1 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                 >
                   Review Architecture & Generate Diagrams
                 </button>
                 <button
                   onClick={() => {
                     setShowRecommendations(false);
                     setArchitectureRecommendations(null);
                   }}
                   className="flex-1 px-8 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
                 >
                   Modify Requirements
                 </button>
               </div>
               
               {/* AI Generation Info */}
               <div className="mt-8 pt-6 border-t border-gray-200">
                 <div className="flex items-center justify-between text-sm text-gray-500">
                   <div className="flex items-center">
                     <Brain size={14} className="mr-2" />
                     <span>Generated by OpenAI GPT-4</span>
                   </div>
                   <div className="flex items-center">
                     <span>Generated at: {aiGenerationTime}</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       );
     }

     // Show the form
     return (
       <div className="bg-white rounded-xl shadow-lg p-8">
         <div className="text-center">
           <Brain className="mx-auto text-purple-600 mb-6" size={64} />
           <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            AI Architect
           </h2>
           <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
             Describe your project and get intelligent architecture recommendations 
             tailored to your specific requirements and constraints.
           </p>
           
           <ConsultantForm 
             problemDescription={problemDescription}
             updateProblemDescription={updateProblemDescription}
             updateArchitectureRecommendations={updateArchitectureRecommendations}
             updateShowRecommendations={updateShowRecommendations}
           />
         </div>
       </div>
     );
   };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
                          <h1 className="text-4xl font-bold text-slate-800">
                Previbe - Enterprise Development Platform
              </h1>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home size={16} className="mr-2" />
              Dashboard
            </button>
          </div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Get AI-powered architecture recommendations, generate enterprise-standard development prompts, and validate your implementation.
          </p>
        </div>

        {/* Workflow Progress Indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Project Workflow</h2>
              <div className="flex items-center space-x-2">
                <Map className="text-blue-600" size={20} />
                <span className="text-sm text-slate-600">Step {workflowStep} of 4</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = workflowStep === step.id;
                const isCompleted = workflowStep > step.id;
                const isAccessible = workflowStep >= step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-blue-600 bg-blue-50' 
                        : isCompleted 
                        ? 'border-green-600 bg-green-50' 
                        : isAccessible 
                        ? 'border-slate-300 bg-slate-50 hover:border-blue-400' 
                        : 'border-slate-200 bg-slate-100 opacity-50'
                    }`}
                    onClick={() => {
                      if (isAccessible) {
                        if (step.id === 1) setActiveTab('consultant');
                        if (step.id === 2 && architectureRecommendations) setShowDiagramReview(true);
                        if (step.id === 3 && architectureRecommendations) setActiveTab('generator');
                        if (step.id === 4) setActiveTab('validator');
                      }
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : isCompleted 
                          ? 'bg-green-600 text-white' 
                          : 'bg-slate-300 text-slate-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold text-sm ${
                          isActive ? 'text-blue-800' : isCompleted ? 'text-green-800' : 'text-slate-700'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-slate-500">{step.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">{step.description}</div>
                    
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="text-green-600" size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-500">You are here:</span>
                <span className="text-slate-700 font-medium">Enterprise Platform</span>
                <ChevronRight className="text-slate-400" size={16} />
                <span className="text-slate-700 font-medium">
                                     {activeTab === 'consultant' && 'AI Architect'}
                   {activeTab === 'dashboard' && 'Dashboard'}
                   {activeTab === 'generator' && 'Standards Generator'}
                   {activeTab === 'design' && 'Visual Design'}
                   {activeTab === 'validator' && 'Architecture Validator'}
                   {activeTab === 'how-it-works' && 'How It Works'}
                   {activeTab === 'about' && 'About'}
                </span>
                {showDiagramReview && (
                  <>
                    <ChevronRight className="text-slate-400" size={16} />
                    <span className="text-blue-600 font-medium">Diagram Review</span>
                  </>
                )}
                {activeTab === 'generator' && activeStep > 0 && (
                  <>
                    <ChevronRight className="text-slate-400" size={16} />
                    <span className="text-blue-600 font-medium">
                      {generatorSteps[activeStep]?.title}
                    </span>
                  </>
                )}
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1">
                {mainTabs.filter(tab => ['dashboard', 'about', 'how-it-works'].includes(tab.id)).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {tab.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>


        <div className="max-w-6xl mx-auto">
                     {/* Diagram Review Screen */}
           {showDiagramReview && (
             <div>
               
               <DiagramReview
                 architectureRecommendations={architectureRecommendations}
                 projectConfig={projectConfig}
                 problemDescription={problemDescription}
                 onApprove={() => {
                   setShowDiagramReview(false);
                   setActiveTab('generator');
                   setWorkflowStep(3);
                 }}
                 onReject={() => {
                   setShowDiagramReview(false);
                   setShowRecommendations(false);
                   setArchitectureRecommendations(null);
                   setWorkflowStep(1);
                 }}
                 onBackToRecommendations={() => {
                   setShowDiagramReview(false);
                 }}
               />
             </div>
           )}
          
          {/* AI Architect */}
          {activeTab === 'consultant' && !showDiagramReview && (
            <div>
              <ArchitectureConsultantView 
                key="consultant-view"
                problemDescription={problemDescription}
                setProblemDescription={setProblemDescription}
                setProjectConfig={setProjectConfig}
                setActiveTab={setActiveTab}
                projectConfig={projectConfig}
                showRecommendations={showRecommendations}
                setShowRecommendations={setShowRecommendations}
                architectureRecommendations={architectureRecommendations}
                setArchitectureRecommendations={setArchitectureRecommendations}
              />
              
              {/* Next Step Guidance */}
              {!showRecommendations && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Next Step: Get Architecture Recommendations
                      </h3>
                      <p className="text-blue-700">
                        Fill out the project requirements form above to receive AI-powered architecture recommendations tailored to your needs.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="text-blue-600" size={24} />
                      <ArrowRight className="text-blue-600" size={20} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'dashboard' && !showDiagramReview && <DashboardView key="dashboard-view" />}
          
          {activeTab === 'design' && !showDiagramReview && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Palette className="text-purple-600 mr-3" size={24} />
                <h2 className="text-2xl font-semibold text-slate-800">Visual Design Standards</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Design System */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">Design System</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Color Palette</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded"></div>
                        <div className="w-8 h-8 bg-purple-600 rounded"></div>
                        <div className="w-8 h-8 bg-green-600 rounded"></div>
                        <div className="w-8 h-8 bg-red-600 rounded"></div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">Primary, secondary, success, and error colors</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Typography</h4>
                      <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Heading 1</h1>
                        <h2 className="text-xl font-semibold">Heading 2</h2>
                        <h3 className="text-lg font-medium">Heading 3</h3>
                        <p className="text-base">Body text with proper line height</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Spacing Scale</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded mr-2"></div>
                          <span className="text-sm">4px (xs)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                          <span className="text-sm">8px (sm)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
                          <span className="text-sm">16px (md)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded mr-2"></div>
                          <span className="text-sm">24px (lg)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* UI Components */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">UI Components</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Buttons</h4>
                      <div className="space-y-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Primary Button</button>
                        <button className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Secondary Button</button>
                        <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">Danger Button</button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Form Elements</h4>
                      <div className="space-y-2">
                        <input type="text" placeholder="Text input" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option>Select option</option>
                        </select>
                        <div className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <label className="text-sm">Checkbox option</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Cards & Containers</h4>
                      <div className="space-y-2">
                        <div className="p-4 border border-slate-200 rounded-lg">
                          <h5 className="font-medium mb-2">Card Title</h5>
                          <p className="text-sm text-slate-600">Card content with proper padding and borders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Accessibility Guidelines */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Accessibility Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">WCAG 2.1 Compliance</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Minimum contrast ratio of 4.5:1 for normal text</li>
                      <li>• Keyboard navigation support for all interactive elements</li>
                      <li>• Screen reader compatibility with proper ARIA labels</li>
                      <li>• Focus indicators for all interactive elements</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Responsive Design</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Mobile-first approach with breakpoints at 768px, 1024px, 1280px</li>
                      <li>• Touch-friendly targets (minimum 44px)</li>
                      <li>• Flexible layouts that adapt to screen sizes</li>
                      <li>• Optimized typography scaling</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Brand Guidelines */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Brand Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Logo Usage</h4>
                    <p className="text-sm text-slate-600">Maintain clear space around logo equal to the height of the logo. Never distort or modify the logo proportions.</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Voice & Tone</h4>
                    <p className="text-sm text-slate-600">Professional yet approachable. Use clear, concise language. Avoid jargon unless necessary for technical accuracy.</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Visual Hierarchy</h4>
                    <p className="text-sm text-slate-600">Use size, weight, and color to guide users through content. Important actions should be prominent and easily discoverable.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
                     {activeTab === 'generator' && !showDiagramReview && (
             <div>
               {/* Success Banner from Diagram Review */}
               {architectureRecommendations && (
                 <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                   <div className="flex items-center">
                     <CheckCircle className="text-green-600 mr-3" size={24} />
                     <div>
                       <h3 className="font-semibold text-green-800">Architecture Approved!</h3>
                       <p className="text-sm text-green-700">
                         Your architecture has been reviewed and approved. Now let's generate enterprise development standards.
                       </p>
                     </div>
                   </div>
                 </div>
               )}
               
               {/* Progress Steps */}
               <div className="flex flex-wrap items-center justify-between mb-8 bg-white rounded-lg p-4 shadow-sm">
                {generatorSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center mb-2">
                      <div 
                        className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all ${
                          index <= activeStep 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-200 text-slate-500'
                        }`}
                        onClick={() => setActiveStep(index)}
                      >
                        <Icon size={20} />
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        index <= activeStep ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </span>
                      {index < generatorSteps.length - 1 && (
                        <ChevronRight className="ml-4 text-slate-400" size={16} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Generator Content */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {activeStep < 8 && (
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <Settings className="text-blue-600 mr-3" size={24} />
                      <h2 className="text-2xl font-semibold text-slate-800">
                        {generatorSteps[activeStep].title} Configuration
                      </h2>
                    </div>

                                         {/* Project Setup Step */}
                     {activeStep === 0 && (
                       <div className="space-y-6">
                         <div>
                           <label className="block text-sm font-medium text-slate-700 mb-2">
                             Project Name
                           </label>
                           <input
                             type="text"
                             className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                             placeholder="e.g., payment-service, user-management-api"
                             value={projectConfig.projectName}
                             onChange={(e) => setProjectConfig({...projectConfig, projectName: e.target.value})}
                           />
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Architecture Pattern
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.projectType}
                               onChange={(e) => setProjectConfig({...projectConfig, projectType: e.target.value})}
                             >
                               <option value="">Choose Architecture Pattern</option>
                               <option value="microservices">Microservices</option>
                               <option value="monolith">Modular Monolith</option>
                               <option value="serverless">Serverless</option>
                               <option value="event-driven">Event-Driven Architecture</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Technology Stack
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.techStack}
                               onChange={(e) => setProjectConfig({...projectConfig, techStack: e.target.value})}
                             >
                               <option value="">Choose Technology Stack</option>
                               <option value="spring-boot">Spring Boot (Java)</option>
                               <option value="nodejs">Node.js (Express)</option>
                               <option value="dotnet">.NET Core</option>
                               <option value="python">Python (FastAPI)</option>
                               <option value="golang">Go (Gin)</option>
                             </select>
                           </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Database
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.database}
                               onChange={(e) => setProjectConfig({...projectConfig, database: e.target.value})}
                             >
                               <option value="">Choose Database</option>
                               <option value="none">No Database Required</option>
                               <option value="postgresql">PostgreSQL</option>
                               <option value="mysql">MySQL</option>
                               <option value="mongodb">MongoDB</option>
                               <option value="cassandra">Cassandra</option>
                               <option value="timescaledb">TimescaleDB</option>
                               <option value="neo4j">Neo4j (Graph)</option>
                               <option value="distributed-postgresql">Distributed PostgreSQL</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Message Queue
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.messageQueue}
                               onChange={(e) => setProjectConfig({...projectConfig, messageQueue: e.target.value})}
                             >
                               <option value="">Choose Message Queue</option>
                               <option value="none">No Message Queue Required</option>
                               <option value="kafka">Apache Kafka</option>
                               <option value="rabbitmq">RabbitMQ</option>
                               <option value="redis-streams">Redis Streams</option>
                               <option value="aws-sqs">AWS SQS</option>
                               <option value="mqtt">MQTT</option>
                             </select>
                           </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Caching Solution
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.caching}
                               onChange={(e) => setProjectConfig({...projectConfig, caching: e.target.value})}
                             >
                               <option value="">Choose Caching Solution</option>
                               <option value="none">No Caching Required</option>
                               <option value="redis">Redis</option>
                               <option value="memcached">Memcached</option>
                               <option value="hazelcast">Hazelcast</option>
                               <option value="elasticache">AWS ElastiCache</option>
                               <option value="redis-cluster">Redis Cluster</option>
                               <option value="cdn-redis">CDN + Redis</option>
                               <option value="redis-timeseries">Redis TimeSeries</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Deployment Strategy
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.deployment}
                               onChange={(e) => setProjectConfig({...projectConfig, deployment: e.target.value})}
                             >
                               <option value="">Choose Deployment Strategy</option>
                               <option value="kubernetes">Kubernetes</option>
                               <option value="docker-swarm">Docker Swarm</option>
                               <option value="ecs">AWS ECS</option>
                               <option value="cloud-run">Google Cloud Run</option>
                               <option value="docker-compose">Docker Compose</option>
                               <option value="serverless">Serverless</option>
                               <option value="edge-computing">Edge Computing</option>
                             </select>
                           </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Monitoring Stack
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.monitoring}
                               onChange={(e) => setProjectConfig({...projectConfig, monitoring: e.target.value})}
                             >
                               <option value="">Choose Monitoring Stack</option>
                               <option value="none">No Monitoring Required</option>
                               <option value="prometheus">Prometheus</option>
                               <option value="prometheus-grafana">Prometheus + Grafana</option>
                               <option value="datadog">Datadog</option>
                               <option value="newrelic">New Relic</option>
                               <option value="elastic">ELK Stack</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Security Level
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.securityLevel || 'standard'}
                               onChange={(e) => setProjectConfig({...projectConfig, securityLevel: e.target.value})}
                             >
                               <option value="standard">Standard</option>
                               <option value="enhanced">Enhanced</option>
                               <option value="enterprise">Enterprise</option>
                             </select>
                           </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Scaling Strategy
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.scalingStrategy || 'manual-scaling'}
                               onChange={(e) => setProjectConfig({...projectConfig, scalingStrategy: e.target.value})}
                             >
                               <option value="manual-scaling">Manual Scaling</option>
                               <option value="auto-scaling">Auto Scaling</option>
                               <option value="cdn-scaling">CDN Scaling</option>
                               <option value="edge-scaling">Edge Scaling</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">
                               Data Retention Policy
                             </label>
                             <select 
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               value={projectConfig.dataRetention || '3-years'}
                               onChange={(e) => setProjectConfig({...projectConfig, dataRetention: e.target.value})}
                             >
                               <option value="1-year">1 Year</option>
                               <option value="3-years">3 Years</option>
                               <option value="7-years">7 Years</option>
                               <option value="indefinite">Indefinite</option>
                             </select>
                           </div>
                         </div>
                       </div>
                     )}

                                         {/* Compliance Step */}
                     {activeStep === 1 && (
                       <div className="space-y-6">
                         {/* User Input Summary */}
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                           <h4 className="font-semibold text-blue-800 mb-2">Original AI Recommendations:</h4>
                           <p className="text-sm text-blue-700 mb-2">
                             <strong>Project:</strong> {problemDescription.projectDescription || 'Not specified'} for {problemDescription.industry || 'general'} industry
                           </p>
                           <p className="text-sm text-blue-700 mb-2">
                             <strong>AI Recommended Compliance:</strong> {architectureRecommendations?.compliance?.length > 0 ? architectureRecommendations.compliance.join(', ') : 'None'}
                           </p>
                           <p className="text-sm text-blue-700">
                             <strong>Current Compliance:</strong> {projectConfig.compliance.length > 0 ? projectConfig.compliance.join(', ') : 'None'}
                           </p>
                         </div>
                         
                         <div>
                           <label className="block text-sm font-medium text-slate-700 mb-3">
                             Compliance Requirements
                           </label>
                           <p className="text-sm text-slate-600 mb-4">
                             Select all compliance standards that apply to your project.
                           </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {complianceStandards.map((standard) => (
                              <div 
                                key={standard.id}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  projectConfig.compliance.includes(standard.id)
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                                onClick={() => handleComplianceChange(standard.id)}
                              >
                                <div className="flex items-start">
                                  <input
                                    type="checkbox"
                                    checked={projectConfig.compliance.includes(standard.id)}
                                    onChange={() => handleComplianceChange(standard.id)}
                                    className="mt-1 mr-3"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-slate-800">{standard.name}</h4>
                                    <p className="text-sm text-slate-600">{standard.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Industry Sector
                            </label>
                            <select 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={projectConfig.industry}
                              onChange={(e) => handleIndustryChange(e.target.value)}
                            >
                              <option value="general">General Technology</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="financial">Financial Services</option>
                              <option value="government">Government</option>
                              <option value="education">Education</option>
                              <option value="retail">Retail/E-commerce</option>
                              <option value="manufacturing">Manufacturing</option>
                              <option value="logistics">Logistics & Transportation</option>
                              <option value="media">Media & Entertainment</option>
                              <option value="realestate">Real Estate</option>
                              <option value="travel">Travel & Hospitality</option>
                              <option value="automotive">Automotive</option>
                              <option value="energy">Energy & Utilities</option>
                              <option value="telecom">Telecommunications</option>
                              <option value="legal">Legal & Compliance</option>
                              <option value="gaming">Gaming</option>
                              <option value="agriculture">Agriculture</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Data Classification
                            </label>
                            <select 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={projectConfig.dataClassification}
                              onChange={(e) => setProjectConfig({...projectConfig, dataClassification: e.target.value})}
                            >
                              <option value="public">Public Data</option>
                              <option value="internal">Internal Use</option>
                              <option value="confidential">Confidential</option>
                              <option value="restricted">Restricted/Sensitive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                                         {/* Architecture Step */}
                     {activeStep === 2 && (
                       <div className="space-y-6">
                         <div className="text-center py-12">
                           <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                             <Code className="text-blue-600" size={32} />
                           </div>
                           <h3 className="text-xl font-semibold text-slate-800 mb-2">
                             Architecture Configuration Complete
                           </h3>
                           <p className="text-slate-600 mb-4">
                             Your architecture settings have been configured in the Project Setup step. 
                             You can review and modify them there if needed.
                           </p>
                           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                             <h4 className="font-semibold text-blue-800 mb-2">Current Architecture Settings:</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                               <div><span className="font-medium">Pattern:</span> {projectConfig.projectType || 'Not selected'}</div>
                               <div><span className="font-medium">Tech Stack:</span> {projectConfig.techStack || 'Not selected'}</div>
                               <div><span className="font-medium">Database:</span> {projectConfig.database === 'none' ? 'Not required' : (projectConfig.database || 'Not selected')}</div>
                               <div><span className="font-medium">Message Queue:</span> {projectConfig.messageQueue === 'none' ? 'Not required' : (projectConfig.messageQueue || 'Not selected')}</div>
                               <div><span className="font-medium">Caching:</span> {projectConfig.caching === 'none' ? 'Not required' : (projectConfig.caching || 'Not selected')}</div>
                               <div><span className="font-medium">Deployment:</span> {projectConfig.deployment || 'Not selected'}</div>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}

                    {/* Other steps placeholder */}
                    {(activeStep >= 3 && activeStep <= 7) && (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                          <Settings className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          {generatorSteps[activeStep].title} Standards
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Enterprise-grade {generatorSteps[activeStep].title.toLowerCase()} patterns will be included in your generated prompts.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between mt-8">
                      <button
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        className="px-6 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      
                      {activeStep < 7 ? (
                        <button
                          onClick={() => setActiveStep(activeStep + 1)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          onClick={handleGeneratePrompts}
                          className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Generate Enterprise Prompts
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Generated Prompts */}
                {activeStep === 8 && generatedPrompts.length > 0 && (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-slate-800">
                        Generated Enterprise Development Prompts
                      </h2>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowBestPractices(!showBestPractices)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Lightbulb size={16} className="mr-2" />
                          {showBestPractices ? 'Hide' : 'Show'} Best Practices
                        </button>
                        <button
                          onClick={() => setActiveTab('validator')}
                          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <BarChart3 size={16} className="mr-2" />
                          Validate Implementation
                        </button>
                      </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-700">Filter by Priority:</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPromptFilter('all')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                              promptFilter === 'all' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            All ({generatedPrompts.length})
                          </button>
                          <button
                            onClick={() => setPromptFilter('critical')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                              promptFilter === 'critical' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-white text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Critical ({generatedPrompts.filter(p => p.priority === 'Critical').length})
                          </button>
                          <button
                            onClick={() => setPromptFilter('high')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                              promptFilter === 'high' 
                                ? 'bg-yellow-600 text-white' 
                                : 'bg-white text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            High ({generatedPrompts.filter(p => p.priority === 'High').length})
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Best Practices Section */}
                    {showBestPractices && (
                      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                          <Lightbulb className="mr-2" size={24} />
                          Development Best Practices Guide
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-semibold text-slate-800 mb-2">Architecture Patterns</h4>
                              <ul className="text-sm text-slate-600 space-y-1">
                                <li>• Use Clean Architecture with clear layer separation</li>
                                <li>• Implement domain-driven design principles</li>
                                <li>• Follow single responsibility principle</li>
                                <li>• Use dependency injection for loose coupling</li>
                              </ul>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-semibold text-slate-800 mb-2">Security Standards</h4>
                              <ul className="text-sm text-slate-600 space-y-1">
                                <li>• Implement OAuth 2.0 with PKCE</li>
                                <li>• Use parameterized queries to prevent SQL injection</li>
                                <li>• Validate all inputs on client and server</li>
                                <li>• Implement proper error handling</li>
                              </ul>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-semibold text-slate-800 mb-2">Testing Strategy</h4>
                              <ul className="text-sm text-slate-600 space-y-1">
                                <li>• Follow AAA pattern (Arrange, Act, Assert)</li>
                                <li>• Aim for 90%+ code coverage</li>
                                <li>• Use test containers for integration tests</li>
                                <li>• Implement API contract testing</li>
                              </ul>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-semibold text-slate-800 mb-2">Performance & Monitoring</h4>
                              <ul className="text-sm text-slate-600 space-y-1">
                                <li>• Use structured logging with correlation IDs</li>
                                <li>• Implement distributed tracing</li>
                                <li>• Set up comprehensive monitoring</li>
                                <li>• Use caching strategies effectively</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {generatedPrompts
                        .filter(prompt => {
                          if (promptFilter === 'all') return true;
                          if (promptFilter === 'critical') return prompt.priority === 'Critical';
                          if (promptFilter === 'high') return prompt.priority === 'High';
                          return true;
                        })
                        .map((prompt, index) => (
                          <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedPrompts);
                                      if (newExpanded.has(index)) {
                                        newExpanded.delete(index);
                                      } else {
                                        newExpanded.add(index);
                                      }
                                      setExpandedPrompts(newExpanded);
                                    }}
                                    className="text-slate-600 hover:text-slate-800"
                                  >
                                    {expandedPrompts.has(index) ? '−' : '+'}
                                  </button>
                                  <div>
                                    <h3 className="text-lg font-semibold text-slate-800">
                                      {prompt.phase}
                                    </h3>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                      prompt.priority === 'Critical' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {prompt.priority} Priority
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(prompt.prompt)}
                                  className="flex items-center px-3 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <Copy size={14} className="mr-1" />
                                  Copy
                                </button>
                              </div>
                            </div>
                            {expandedPrompts.has(index) && (
                              <div className="p-6">
                                <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded border overflow-x-auto max-h-96 overflow-y-auto">
                                  {prompt.prompt}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Implementation Workflow
                      </h3>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Use the Architecture Setup prompt first to establish the foundation</li>
                        <li>2. Implement Security Framework before adding business logic</li>
                        <li>3. Set up Testing Framework alongside development</li>
                        <li>4. Configure CI/CD Pipeline for automated deployments</li>
                        <li>5. Implement Observability for production monitoring</li>
                        <li>6. Create comprehensive documentation using the Documentation Framework</li>
                      </ol>
                    </div>

                    {projectConfig.compliance.length > 0 && (
                      <div className="mt-6 p-6 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                          Compliance Standards Included: {projectConfig.compliance.map(c => c.toUpperCase()).join(', ')}
                        </h3>
                        <p className="text-sm text-red-700">
                          All generated prompts include specific requirements for the selected compliance standards.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Next Step Guidance */}
              {activeStep === 8 && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Next Step: Validate Your Implementation
                      </h3>
                      <p className="text-green-700">
                        Now that you have your development standards, use the Architecture Validator to check your implementation against enterprise standards.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileCheck className="text-green-600" size={24} />
                      <ArrowRight className="text-green-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveTab('validator')}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <BarChart3 size={20} className="mr-2" />
                      Go to Architecture Validator
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

                     {activeTab === 'validator' && !showDiagramReview && (
             <div>
               <ArchitectureValidator 
                 onValidationComplete={(result) => {
                   console.log('Validation completed:', result);
                   // You can add additional logic here to handle validation results
                 }}
                 projectConfig={projectConfig}
               />
               
               {/* Next Step Guidance */}
               <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold text-purple-800 mb-2">
                       Workflow Complete!
                     </h3>
                     <p className="text-purple-700">
                       You've successfully completed the enterprise development workflow. Your architecture has been validated and you're ready for production deployment.
                     </p>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Award className="text-purple-600" size={24} />
                     <CheckCircle className="text-purple-600" size={20} />
                   </div>
                 </div>
                 <div className="mt-4 flex space-x-4">
                   <button
                     onClick={() => {
                       setActiveTab('consultant');
                       setWorkflowStep(1);
                       setArchitectureRecommendations(null);
                       setShowRecommendations(false);
                       setShowDiagramReview(false);
                     }}
                     className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                   >
                     <RefreshCw size={20} className="mr-2" />
                     Start New Project
                   </button>
                   <button
                     onClick={() => setActiveTab('dashboard')}
                     className="flex items-center px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
                   >
                     <Home size={20} className="mr-2" />
                     View Dashboard
                   </button>
                 </div>
               </div>
             </div>
           )}

          {/* How It Works Section */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                <div className="text-center">
                  <Lightbulb className="mx-auto mb-6" size={64} />
                  <h2 className="text-3xl font-bold mb-4">
                    Start with Structure, End Development Chaos
                  </h2>
                  <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
                    Previbe helps developers plan, build, and validate enterprise applications with AI-powered guidance. 
                    From architecture design to production deployment and beyond.
                  </p>
                  <div className="flex justify-center space-x-8 text-center">
                    <div>
                      <div className="text-3xl font-bold">10x</div>
                      <div className="text-blue-100">Faster Planning</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">30+</div>
                      <div className="text-blue-100">Compliance Standards</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">100%</div>
                      <div className="text-blue-100">AI-Powered</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Previbe Manifesto */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">The Previbe Manifesto</h3>
                <div className="space-y-6">
                  <blockquote className="text-lg text-slate-700 italic border-l-4 border-blue-500 pl-6">
                    "The future of enterprise development isn't about better prompts. It's about better architecture."
                  </blockquote>
                  <p className="text-slate-600">
                    The manifesto lays out a simple foundation for modern AI-driven enterprise development: 
                    <strong> architecture before code</strong>. Previbe helps you design comprehensive architecture 
                    documents that your AI tools and development teams can reliably use—so you get consistent, 
                    scalable, and compliant code instead of one-off experiments.
                  </p>
                  <blockquote className="text-lg text-slate-700 italic border-l-4 border-purple-500 pl-6">
                    "Architecture is the new documentation. Prompt engineering is duct tape."
                  </blockquote>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">Why it matters</h4>
                    <p className="text-blue-700">
                      Teams that lead with architecture ship faster, integrate cleaner, and maintain 
                      architectural coherence as they scale. Enterprise compliance becomes a natural 
                      byproduct of good design, not an afterthought.
                    </p>
                  </div>
                </div>
              </div>

              {/* How It Works Steps */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">How Previbe Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="text-blue-600" size={32} />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-3">1. Define Your Vision</h4>
                    <p className="text-slate-600">
                      Input your project requirements and industry context. Our AI analyzes your concept 
                      and identifies key architectural components and compliance needs.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="text-purple-600" size={32} />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-3">2. AI-Generated Architecture</h4>
                    <p className="text-slate-600">
                      Get comprehensive architecture recommendations, interactive diagrams, and 
                      enterprise development standards tailored to your specific requirements.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileCheck className="text-green-600" size={32} />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-3">3. Build & Validate</h4>
                    <p className="text-slate-600">
                      Use generated standards and prompts to build your application, then validate 
                      your implementation against enterprise standards with continuous AI guidance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">Powerful Features for Enterprise Development</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">AI Architect</h4>
                    <p className="text-slate-600">
                      Get intelligent architecture recommendations based on your industry, scale, and requirements.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Interactive Diagrams</h4>
                    <p className="text-slate-600">
                      Visualize your architecture with dynamic, industry-specific diagrams that adapt to your choices.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Enterprise Standards Generator</h4>
                    <p className="text-slate-600">
                      Generate comprehensive development standards and implementation prompts for your team.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Compliance Integration</h4>
                    <p className="text-slate-600">
                      Built-in support for 30+ compliance frameworks including HIPAA, SOX, GDPR, and more.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Architecture Validator</h4>
                    <p className="text-slate-600">
                      Validate your implementation against enterprise standards and best practices.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Best Practices Guide</h4>
                    <p className="text-slate-600">
                      Access comprehensive development best practices for architecture, security, testing, and more.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              {/* About Hero */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
                <div className="text-center">
                  <Info className="mx-auto mb-6" size={64} />
                  <h2 className="text-3xl font-bold mb-4">
                    About Previbe
                  </h2>
                  <p className="text-xl text-purple-100 mb-6 max-w-3xl mx-auto">
                    The intelligent enterprise development platform that transforms how teams build 
                    scalable, compliant, and maintainable applications.
                  </p>
                </div>
              </div>

              {/* Mission & Vision */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h3>
                    <p className="text-slate-600 mb-4">
                      To democratize enterprise-grade architecture and development practices, making 
                      it accessible for teams of all sizes to build applications that scale, comply, 
                      and succeed in production.
                    </p>
                    <p className="text-slate-600">
                      We believe that every development team deserves access to the same architectural 
                      rigor and compliance standards that Fortune 500 companies use, without the 
                      complexity and overhead.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Our Vision</h3>
                    <p className="text-slate-600 mb-4">
                      A world where enterprise development is not just about writing code, but about 
                      creating robust, scalable, and compliant systems that drive business value.
                    </p>
                    <p className="text-slate-600">
                      We envision a future where AI-powered architecture guidance becomes the standard, 
                      enabling teams to focus on innovation while ensuring their applications meet 
                      the highest standards of quality and compliance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Principles */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Our Key Principles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="text-blue-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Intelligence First</h4>
                    <p className="text-slate-600 text-sm">
                      Leverage AI to make informed architectural decisions and generate comprehensive 
                      development standards.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="text-purple-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Compliance by Design</h4>
                    <p className="text-slate-600 text-sm">
                      Build compliance into your architecture from the start, not as an afterthought. 
                      Support for 30+ industry standards.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Code className="text-green-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Developer Experience</h4>
                    <p className="text-slate-600 text-sm">
                      Focus on creating tools that developers love to use, with intuitive interfaces 
                      and actionable insights.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Built with Modern Technology</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-800">React</div>
                    <div className="text-sm text-slate-600">Frontend Framework</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-800">TypeScript</div>
                    <div className="text-sm text-slate-600">Type Safety</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-800">OpenAI GPT-4</div>
                    <div className="text-sm text-slate-600">AI Intelligence</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-800">Tailwind CSS</div>
                    <div className="text-sm text-slate-600">Styling</div>
                  </div>
                </div>
              </div>

              {/* Contact & Support */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Get Started Today</h3>
                <div className="text-center">
                  <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                    Ready to transform your development process? Start building enterprise-grade 
                    applications with AI-powered architecture guidance.
                  </p>
                  <button
                    onClick={() => setActiveTab('consultant')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Start Your First Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterprisePlatform;