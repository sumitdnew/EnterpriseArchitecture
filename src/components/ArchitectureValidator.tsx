import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Shield, 
  TestTube, 
  Rocket, 
  Monitor, 
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Clock,
  TrendingUp,
  Users,
  MessageCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BarChart3,
  Award,
  FileCode,
  Database,
  Lock,
  Zap,
  Globe,
  Settings,
  GitBranch,
  Cloud,
  Server,
  Cpu,
  HardDrive,
  Network,
  Eye,
  EyeOff,
  Share2,
  Printer,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation?: string;
}

interface ValidationCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  weight: number;
  checks: ValidationCheck[];
  score: number;
  color: string;
}

interface ValidationResult {
  id: string;
  timestamp: Date;
  overallScore: number;
  categories: ValidationCategory[];
  filesAnalyzed: string[];
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  recommendations: string[];
  exportData: any;
}

interface ArchitectureValidatorProps {
  onValidationComplete?: (result: ValidationResult) => void;
  projectConfig?: any;
}

const ArchitectureValidator: React.FC<ArchitectureValidatorProps> = ({ 
  onValidationComplete, 
  projectConfig 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [validationHistory, setValidationHistory] = useState<ValidationResult[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{id: string, text: string, author: string, timestamp: Date}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Validation categories with weights and checks
  const validationCategories: ValidationCategory[] = [
    {
      id: 'architecture',
      name: 'Architecture & Design',
      icon: FileCode,
      weight: 20,
      score: 0,
      color: 'blue',
      checks: [
        {
          id: 'clean-architecture',
          name: 'Clean Architecture Layers',
          description: 'Verifies proper separation of presentation, application, domain, and infrastructure layers',
          passed: false,
          details: '',
          priority: 'Critical'
        },
        {
          id: 'design-patterns',
          name: 'Design Patterns Implementation',
          description: 'Checks for proper use of enterprise design patterns (Repository, Factory, Strategy, etc.)',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'dependency-injection',
          name: 'Dependency Injection Setup',
          description: 'Validates dependency injection container configuration and usage',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'api-design',
          name: 'API Design Consistency',
          description: 'Ensures consistent API design patterns and RESTful principles',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'error-handling',
          name: 'Error Handling Framework',
          description: 'Validates comprehensive error handling and exception management',
          passed: false,
          details: '',
          priority: 'Critical'
        }
      ]
    },
    {
      id: 'security',
      name: 'Security & Compliance',
      icon: Shield,
      weight: 25,
      score: 0,
      color: 'red',
      checks: [
        {
          id: 'authentication',
          name: 'Authentication Implementation',
          description: 'Verifies OAuth 2.0/JWT implementation and token management',
          passed: false,
          details: '',
          priority: 'Critical'
        },
        {
          id: 'authorization',
          name: 'Authorization Controls',
          description: 'Checks role-based access control (RBAC) implementation',
          passed: false,
          details: '',
          priority: 'Critical'
        },
        {
          id: 'data-encryption',
          name: 'Data Encryption',
          description: 'Validates AES-256 encryption and TLS 1.3 implementation',
          passed: false,
          details: '',
          priority: 'Critical'
        },
        {
          id: 'input-validation',
          name: 'Input Validation & Sanitization',
          description: 'Ensures comprehensive input validation and XSS protection',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'audit-logging',
          name: 'Audit Logging Setup',
          description: 'Validates audit trail implementation for compliance',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'compliance-controls',
          name: 'Compliance-Specific Controls',
          description: 'Checks SOX/HIPAA/PCI/GDPR compliance requirements',
          passed: false,
          details: '',
          priority: 'Critical'
        }
      ]
    },
    {
      id: 'testing',
      name: 'Testing Framework',
      icon: TestTube,
      weight: 20,
      score: 0,
      color: 'purple',
      checks: [
        {
          id: 'unit-coverage',
          name: 'Unit Test Coverage',
          description: 'Ensures 90%+ unit test coverage with proper mocking',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'integration-tests',
          name: 'Integration Testing Setup',
          description: 'Validates integration test framework and database testing',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'e2e-tests',
          name: 'End-to-End Test Automation',
          description: 'Checks automated E2E testing for critical user journeys',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'performance-tests',
          name: 'Performance Testing Implementation',
          description: 'Validates load testing and performance benchmarking',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'security-tests',
          name: 'Security Testing (OWASP Top 10)',
          description: 'Ensures security testing against OWASP vulnerabilities',
          passed: false,
          details: '',
          priority: 'Critical'
        }
      ]
    },
    {
      id: 'cicd',
      name: 'CI/CD & DevOps',
      icon: Rocket,
      weight: 15,
      score: 0,
      color: 'green',
      checks: [
        {
          id: 'pipeline-automation',
          name: 'Pipeline Automation Setup',
          description: 'Validates automated CI/CD pipeline with quality gates',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'container-config',
          name: 'Container Configuration',
          description: 'Checks Docker containerization and security scanning',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'infrastructure-code',
          name: 'Infrastructure as Code',
          description: 'Validates Terraform/CloudFormation implementation',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'blue-green-deployment',
          name: 'Blue-Green Deployment',
          description: 'Ensures zero-downtime deployment strategy',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'rollback-procedures',
          name: 'Rollback Procedures',
          description: 'Validates automated rollback mechanisms',
          passed: false,
          details: '',
          priority: 'Critical'
        }
      ]
    },
    {
      id: 'observability',
      name: 'Observability',
      icon: Monitor,
      weight: 10,
      score: 0,
      color: 'indigo',
      checks: [
        {
          id: 'structured-logging',
          name: 'Structured Logging Implementation',
          description: 'Validates JSON logging with correlation IDs',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'metrics-collection',
          name: 'Metrics Collection Setup',
          description: 'Checks business and technical metrics collection',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'distributed-tracing',
          name: 'Distributed Tracing',
          description: 'Validates request correlation across services',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'alerting-config',
          name: 'Alerting Configuration',
          description: 'Ensures proper alerting and escalation procedures',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'monitoring-dashboards',
          name: 'Monitoring Dashboards',
          description: 'Validates operational dashboards and SLO monitoring',
          passed: false,
          details: '',
          priority: 'Medium'
        }
      ]
    },
    {
      id: 'documentation',
      name: 'Documentation',
      icon: BookOpen,
      weight: 10,
      score: 0,
      color: 'orange',
      checks: [
        {
          id: 'readme-completeness',
          name: 'README Completeness',
          description: 'Validates comprehensive project documentation',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'api-documentation',
          name: 'API Documentation (OpenAPI)',
          description: 'Checks OpenAPI/Swagger documentation quality',
          passed: false,
          details: '',
          priority: 'High'
        },
        {
          id: 'architecture-decisions',
          name: 'Architecture Decisions (ADRs)',
          description: 'Validates Architecture Decision Records',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'operational-runbooks',
          name: 'Operational Runbooks',
          description: 'Ensures deployment and troubleshooting guides',
          passed: false,
          details: '',
          priority: 'Medium'
        },
        {
          id: 'developer-onboarding',
          name: 'Developer Onboarding Docs',
          description: 'Validates new developer setup and contribution guides',
          passed: false,
          details: '',
          priority: 'Low'
        }
      ]
    }
  ];

  // File upload handlers
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setUploadedFiles(prev => [...prev, ...fileArray]);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Validation simulation
  const simulateValidation = async () => {
    setIsValidating(true);
    setValidationProgress(0);
    
    const steps = [
      'Analyzing file structure...',
      'Examining architecture patterns...',
      'Validating security implementations...',
      'Checking testing frameworks...',
      'Reviewing CI/CD configurations...',
      'Analyzing observability setup...',
      'Evaluating documentation quality...',
      'Generating comprehensive report...'
    ];

    const categories = validationCategories.map(category => ({
      ...category,
      checks: category.checks.map(check => ({
        ...check,
        passed: Math.random() > 0.3, // 70% pass rate for demo
        details: check.passed ? 
          '✅ Implementation found and validated' : 
          '❌ Implementation missing or incomplete',
        recommendation: check.passed ? undefined : 
          `Implement ${check.name.toLowerCase()} following enterprise standards`
      }))
    }));

    // Calculate scores
    const scoredCategories = categories.map(category => ({
      ...category,
      score: Math.round((category.checks.filter(c => c.passed).length / category.checks.length) * 100)
    }));

    // Calculate overall score
    const overallScore = Math.round(
      scoredCategories.reduce((total, category) => 
        total + (category.score * category.weight / 100), 0
      )
    );

    // Generate recommendations
    const failedChecks = scoredCategories.flatMap(cat => 
      cat.checks.filter(check => !check.passed)
    );
    
    const recommendations = failedChecks
      .filter(check => check.priority === 'Critical')
      .map(check => check.recommendation)
      .filter((rec): rec is string => rec !== undefined)
      .slice(0, 5);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setValidationProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const result: ValidationResult = {
      id: `validation-${Date.now()}`,
      timestamp: new Date(),
      overallScore,
      categories: scoredCategories,
      filesAnalyzed: uploadedFiles.map(f => f.name),
      totalChecks: scoredCategories.reduce((total, cat) => total + cat.checks.length, 0),
      passedChecks: scoredCategories.reduce((total, cat) => total + cat.checks.filter(c => c.passed).length, 0),
      failedChecks: scoredCategories.reduce((total, cat) => total + cat.checks.filter(c => !c.passed).length, 0),
      recommendations,
      exportData: {
        overallScore,
        categories: scoredCategories,
        timestamp: new Date().toISOString(),
        filesAnalyzed: uploadedFiles.map(f => f.name)
      }
    };

    setValidationResults(result);
    setValidationHistory(prev => [result, ...prev]);
    setIsValidating(false);
    setValidationProgress(0);
    setCurrentStep('');

    if (onValidationComplete) {
      onValidationComplete(result);
    }
  };

  // UI helpers
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const exportReport = (format: 'pdf' | 'json' | 'csv') => {
    if (!validationResults) return;

    const data = validationResults.exportData;
    
    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `architecture-validation-${Date.now()}.json`;
        jsonLink.click();
        break;
      
      case 'csv':
        const csvContent = [
          'Category,Score,Weight,Checks Passed,Total Checks',
          ...data.categories.map((cat: any) => 
            `${cat.name},${cat.score},${cat.weight},${cat.checks.filter((c: any) => c.passed).length},${cat.checks.length}`
          ),
          `Overall Score,${data.overallScore},100,${validationResults.passedChecks},${validationResults.totalChecks}`
        ].join('\n');
        
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `architecture-validation-${Date.now()}.csv`;
        csvLink.click();
        break;
      
      case 'pdf':
        // In a real implementation, you'd use a PDF library like jsPDF
        alert('PDF export would be implemented with jsPDF library');
        break;
    }
  };

  const filteredChecks = validationResults?.categories.flatMap((cat: any) => 
    cat.checks.map((check: any) => ({
      ...check,
      categoryName: cat.name,
      categoryColor: cat.color
    }))
  ).filter((check: any) => {
    const matchesPriority = filterPriority === 'all' || check.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      check.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Architecture Validator</h2>
            <p className="text-slate-600">Comprehensive enterprise architecture validation and scoring</p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-600">Enterprise Grade</span>
          </div>
        </div>

        {/* Validation Categories Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {validationCategories.map(category => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="text-center p-3 bg-slate-50 rounded-lg">
                <Icon className={`mx-auto mb-2 text-${category.color}-600`} size={20} />
                <div className="text-xs font-medium text-slate-700">{category.name}</div>
                <div className="text-xs text-slate-500">{category.weight}% weight</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* File Upload Section */}
      {!validationResults && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Project Files</h3>
          
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          >
            <Upload className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 mb-2">
              Drop files here or <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-slate-500">
              Supports: .java, .ts, .js, .py, .cs, .go, .yml, .yaml, .json, .md, .txt
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".java,.ts,.js,.py,.cs,.go,.yml,.yaml,.json,.md,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-slate-700 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="text-slate-500 mr-3" size={16} />
                      <span className="text-sm font-medium text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={simulateValidation}
                disabled={uploadedFiles.length === 0}
                className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
              >
                Start Architecture Validation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Validation Progress */}
      {isValidating && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Validating Architecture</h3>
            <p className="text-slate-600 mb-4">{currentStep}</p>
            
            <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${validationProgress}%` }}
              ></div>
            </div>
            
            <div className="text-sm text-slate-500">{Math.round(validationProgress)}% Complete</div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResults && (
        <div className="space-y-6">
          {/* Overall Score Dashboard */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Validation Results</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center px-3 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  <MessageCircle size={16} className="mr-1" />
                  Comments
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => exportReport('json')}
                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    title="Export as JSON"
                  >
                    <FileJson size={16} />
                  </button>
                  <button
                    onClick={() => exportReport('csv')}
                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    title="Export as CSV"
                  >
                    <FileSpreadsheet size={16} />
                  </button>
                  <button
                    onClick={() => exportReport('pdf')}
                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    title="Export as PDF"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className={`text-3xl font-bold px-4 py-2 rounded-full ${getScoreColor(validationResults.overallScore)}`}>
                  {validationResults.overallScore}/100
                </div>
                <div className="text-sm text-slate-600 mt-1">Overall Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResults.passedChecks}
                </div>
                <div className="text-sm text-slate-600">Passed Checks</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResults.failedChecks}
                </div>
                <div className="text-sm text-slate-600">Failed Checks</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResults.filesAnalyzed.length}
                </div>
                <div className="text-sm text-slate-600">Files Analyzed</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validationResults.categories.map(category => {
                const Icon = category.icon;
                const isExpanded = expandedCategories.includes(category.id);
                
                return (
                  <div key={category.id} className="border border-slate-200 rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center">
                        <Icon className={`text-${category.color}-600 mr-3`} size={20} />
                        <div>
                          <div className="font-medium text-slate-800">{category.name}</div>
                          <div className="text-sm text-slate-500">{category.weight}% weight</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(category.score)}`}>
                          {category.score}/100
                        </div>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 space-y-2">
                        {category.checks.map(check => (
                          <div key={check.id} className="flex items-start space-x-2 p-2 bg-slate-50 rounded">
                            {check.passed ? (
                              <CheckCircle className="text-green-600 mt-0.5" size={16} />
                            ) : (
                              <XCircle className="text-red-600 mt-0.5" size={16} />
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-700">{check.name}</div>
                              <div className="text-xs text-slate-500">{check.description}</div>
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getPriorityColor(check.priority)}`}>
                                {check.priority}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Findings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Detailed Findings</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search checks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="text-slate-500" size={16} />
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-1 border border-slate-300 rounded text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {filteredChecks.map((check, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg">
                  {check.passed ? (
                    <CheckCircle className="text-green-600 mt-1" size={20} />
                  ) : (
                    <XCircle className="text-red-600 mt-1" size={20} />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-slate-800">{check.name}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(check.priority)}`}>
                        {check.priority}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">{check.description}</div>
                    <div className="text-sm text-slate-500 mb-2">{check.details}</div>
                    {check.recommendation && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {check.recommendation}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2">Category: {check.categoryName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {validationResults.recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Critical Recommendations</h3>
              <div className="space-y-3">
                {validationResults.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="text-red-600 mt-1" size={20} />
                    <div className="text-sm text-red-800">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation History */}
          {validationHistory.length > 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Validation History</h3>
              <div className="space-y-3">
                {validationHistory.slice(1, 4).map((result, index) => (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="text-slate-500" size={16} />
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          Validation #{validationHistory.length - index - 1}
                        </div>
                        <div className="text-xs text-slate-500">
                          {result.timestamp.toLocaleDateString()} at {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(result.overallScore)}`}>
                        {result.overallScore}/100
                      </div>
                      <TrendingUp className="text-slate-500" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setValidationResults(null);
                setUploadedFiles([]);
              }}
              className="px-6 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Start New Validation
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Users size={16} className="mr-2" />
                Team Review
              </button>
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureValidator;
