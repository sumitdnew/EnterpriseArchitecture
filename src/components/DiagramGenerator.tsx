import React, { useState, useEffect } from 'react';
import { Download, Eye, Edit3, Share2, ZoomIn, ZoomOut, RotateCcw, MousePointer } from 'lucide-react';
import InteractiveDiagram from './InteractiveDiagram';

interface DiagramGeneratorProps {
  architectureRecommendations: any;
  projectConfig: any;
  problemDescription?: any;
  onApprove?: (diagrams: any) => void;
  onEdit?: (diagram: any) => void;
}

const DiagramGenerator = ({ architectureRecommendations, projectConfig, problemDescription, onApprove, onEdit }: DiagramGeneratorProps) => {
  // Suppress ResizeObserver errors globally
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Suppress ResizeObserver errors
    console.error = (...args) => {
      if (args[0]?.includes?.('ResizeObserver loop completed with undelivered notifications')) {
        return;
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      if (args[0]?.includes?.('ResizeObserver loop completed with undelivered notifications')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    // Add global error handler for ResizeObserver
    const handleResizeObserverError = (event: ErrorEvent) => {
      if (event.message?.includes?.('ResizeObserver loop completed with undelivered notifications')) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleResizeObserverError);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleResizeObserverError);
    };
  }, []);
  const [selectedDiagramType, setSelectedDiagramType] = useState('system');
  const [generatedDiagrams, setGeneratedDiagrams] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [useInteractiveDiagram, setUseInteractiveDiagram] = useState(false);

  const diagramTypes = [
    { id: 'system', name: 'System Architecture', description: 'High-level system overview' },
    { id: 'component', name: 'Component Diagram', description: 'Service components and relationships' },
    { id: 'data', name: 'Data Flow', description: 'Data movement through system' },
    { id: 'deployment', name: 'Deployment', description: 'Infrastructure and deployment view' },
    { id: 'security', name: 'Security Architecture', description: 'Security boundaries and controls' },
    { id: 'compliance', name: 'Compliance Flow', description: 'Compliance data and audit trails' }
  ];

  useEffect(() => {
    generateAllDiagrams();
  }, [architectureRecommendations, projectConfig, problemDescription]);

  const generateAllDiagrams = async () => {
    setIsGenerating(true);
    const diagrams: Record<string, any> = {};
    
    for (const type of diagramTypes) {
      diagrams[type.id] = generateDiagram(type.id);
    }
    
    setGeneratedDiagrams(diagrams);
    setIsGenerating(false);
  };

  const generateDiagram = (type: string) => {
    const { architecture, database, messageQueue, caching, deployment, compliance } = architectureRecommendations;
    const industry = problemDescription?.industry || 'general';
    const projectDesc = problemDescription?.projectDescription || '';
    
    switch (type) {
      case 'system':
        return generateSystemDiagram(architecture, database, messageQueue, caching, industry, projectDesc);
      case 'component':
        return generateComponentDiagram(architecture, projectConfig.techStack, industry, projectDesc);
      case 'data':
        return generateDataFlowDiagram(database, messageQueue, caching, industry, projectDesc);
      case 'deployment':
        return generateDeploymentDiagram(deployment, architecture, industry, projectDesc);
      case 'security':
        return generateSecurityDiagram(compliance, industry, projectDesc);
      case 'compliance':
        return generateComplianceDiagram(compliance, industry, projectDesc);
      default:
        return generateSystemDiagram(architecture, database, messageQueue, caching, industry, projectDesc);
    }
  };

  const generateSystemDiagram = (architecture: string, database: string, messageQueue: string, caching: string, industry: string, projectDesc: string) => {
    const mermaidCode = `
graph TB
    subgraph "External"
        U[Users] 
        E[External APIs]
    end
    
    subgraph "API Layer"
        AG[API Gateway]
        LB[Load Balancer]
    end
    
    subgraph "Application Layer"
        ${architecture === 'microservices' ? `
        ${industry === 'healthcare' ? `
        PS[Patient Service]
        MS[Medical Service]
        BS[Billing Service]
        NS[Notification Service]
        ` : industry === 'financial' ? `
        AS[Account Service]
        TS[Transaction Service]
        PS[Payment Service]
        NS[Notification Service]
        ` : industry === 'manufacturing' ? `
        PS[Production Service]
        QS[Quality Service]
        IS[Inventory Service]
        MS[Monitoring Service]
        ` : industry === 'logistics' ? `
        TS[Tracking Service]
        DS[Delivery Service]
        IS[Inventory Service]
        RS[Route Service]
        ` : industry === 'media' ? `
        CS[Content Service]
        US[User Service]
        RS[Recommendation Service]
        PS[Playback Service]
        ` : industry === 'gaming' ? `
        GS[Game Service]
        US[User Service]
        MS[Matchmaking Service]
        PS[Payment Service]
        ` : `
        US[User Service]
        PS[Product Service]
        OS[Order Service]
        NS[Notification Service]
        `}
        ` : `
        APP[Application Server]
        `}
    end
    
    subgraph "Data Layer"
        ${database && database !== 'none' ? `DB[(${database.toUpperCase()}<br/>Database)]` : ''}
        ${caching && caching !== 'none' ? `CACHE[(${caching.toUpperCase()}<br/>Cache)]` : ''}
        ${messageQueue && messageQueue !== 'none' ? `MQ[${messageQueue.toUpperCase()}<br/>Message Queue]` : ''}
    end
    
    subgraph "Monitoring"
        MON[Monitoring]
        LOG[Logging]
    end
    
    U --> AG
    AG --> LB
    ${architecture === 'microservices' ? `
    LB --> US
    LB --> PS
    LB --> OS
    ${database && database !== 'none' ? `
    US --> DB
    PS --> DB
    OS --> DB
    ` : ''}
    ${messageQueue && messageQueue !== 'none' ? `
    OS --> MQ
    MQ --> NS
    ` : ''}
    ${caching && caching !== 'none' ? `
    US --> CACHE
    PS --> CACHE
    ` : ''}
    ` : `
    LB --> APP
    ${database && database !== 'none' ? `APP --> DB` : ''}
    ${caching && caching !== 'none' ? `APP --> CACHE` : ''}
    ${messageQueue && messageQueue !== 'none' ? `APP --> MQ` : ''}
    `}
    E --> AG
    
    ${architecture === 'microservices' ? `
    US --> MON
    PS --> MON
    OS --> MON
    NS --> MON
    ` : `
    APP --> MON
    `}
    
    classDef external fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef app fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef monitor fill:#fce4ec
    
    class U,E external
    class AG,LB api
    class US,PS,OS,NS,APP app
    class DB,CACHE,MQ data
    class MON,LOG monitor
`;

    return {
      type: 'mermaid',
      code: mermaidCode,
      title: 'System Architecture Overview',
      description: `${architecture} architecture with ${database} database, ${caching} caching, and ${messageQueue} messaging`
    };
  };

  const generateComponentDiagram = (architecture: string, techStack: string, industry: string, projectDesc: string) => {
    const mermaidCode = `
graph TD
    subgraph "Presentation Layer"
        UI[User Interface]
        API[API Controllers]
    end
    
    subgraph "Business Logic Layer"
        SVC[Service Layer]
        DOM[Domain Models]
        VAL[Validation]
    end
    
    subgraph "Data Access Layer"
        REPO[Repository Pattern]
        ORM[ORM/Data Mapper]
        CACHE[Cache Manager]
    end
    
    subgraph "Infrastructure Layer"
        AUTH[Authentication]
        LOG[Logging]
        CONFIG[Configuration]
        QUEUE[Message Handler]
    end
    
    UI --> API
    API --> SVC
    SVC --> DOM
    SVC --> VAL
    SVC --> REPO
    REPO --> ORM
    SVC --> CACHE
    API --> AUTH
    SVC --> LOG
    SVC --> QUEUE
    
    classDef presentation fill:#e3f2fd
    classDef business fill:#e8f5e8
    classDef data fill:#fff8e1
    classDef infrastructure fill:#fce4ec
    
    class UI,API presentation
    class SVC,DOM,VAL business
    class REPO,ORM,CACHE data
    class AUTH,LOG,CONFIG,QUEUE infrastructure
`;

    return {
      type: 'mermaid',
      code: mermaidCode,
      title: 'Component Architecture',
      description: `Clean Architecture components for ${techStack} implementation`
    };
  };

  const generateDataFlowDiagram = (database: string, messageQueue: string, caching: string, industry: string, projectDesc: string) => {
    const mermaidCode = `
graph LR
    subgraph "Data Sources"
        ${industry === 'healthcare' ? `
        PAT[Patient Data]
        MED[Medical Records]
        INS[Insurance Data]
        ` : industry === 'financial' ? `
        ACC[Account Data]
        TXN[Transaction Data]
        MKT[Market Data]
        ` : industry === 'manufacturing' ? `
        PROD[Production Data]
        SENS[Sensor Data]
        QUAL[Quality Data]
        ` : industry === 'logistics' ? `
        TRACK[Tracking Data]
        INVENT[Inventory Data]
        ROUTE[Route Data]
        ` : industry === 'media' ? `
        CONT[Content Data]
        USER[User Data]
        ANALYT[Analytics Data]
        ` : industry === 'gaming' ? `
        GAME[Game Data]
        USER[User Data]
        PAY[Payment Data]
        ` : `
        USER[User Input]
        EXT[External APIs]
        FILE[File Uploads]
        `}
    end
    
    subgraph "Processing"
        VAL[Validation]
        TRANS[Transformation]
        BIZ[Business Logic]
    end
    
    subgraph "Storage"
        CACHE[(${caching.toUpperCase()}<br/>Cache)]
        DB[(${database.toUpperCase()}<br/>Primary DB)]
        QUEUE[${messageQueue.toUpperCase()}<br/>Message Queue]
    end
    
    subgraph "Output"
        API[API Response]
        EVENT[Events]
        REPORT[Reports]
    end
    
    USER --> VAL
    EXT --> VAL
    FILE --> VAL
    VAL --> TRANS
    TRANS --> BIZ
    BIZ --> CACHE
    BIZ --> DB
    BIZ --> QUEUE
    CACHE --> API
    DB --> API
    QUEUE --> EVENT
    DB --> REPORT
    
    classDef source fill:#e1f5fe
    classDef process fill:#e8f5e8
    classDef storage fill:#fff3e0
    classDef output fill:#f3e5f5
    
    class USER,EXT,FILE source
    class VAL,TRANS,BIZ process
    class CACHE,DB,QUEUE storage
    class API,EVENT,REPORT output
`;

    return {
      type: 'mermaid',
      code: mermaidCode,
      title: 'Data Flow Architecture',
      description: `Data movement through ${database} and ${caching} with ${messageQueue} messaging`
    };
  };

  const generateDeploymentDiagram = (deployment: string, architecture: string, industry: string, projectDesc: string) => {
    const mermaidCode = `
graph TB
    subgraph "External"
        CDN[CDN]
        DNS[DNS]
    end
    
    subgraph "Load Balancing"
        LB[Load Balancer]
        SSL[SSL Termination]
    end
    
    subgraph "${deployment.toUpperCase()} Cluster"
        subgraph "Application Pods"
            ${architecture === 'microservices' ? `
            POD1[User Service Pod]
            POD2[Product Service Pod]
            POD3[Order Service Pod]
            ` : `
            POD1[Application Pod]
            POD2[Application Pod]
            POD3[Application Pod]
            `}
        end
        
        subgraph "Data Pods"
            DBPOD[Database Pod]
            CACHEPOD[Cache Pod]
            QUEUEPOD[Message Queue Pod]
        end
        
        subgraph "Monitoring"
            MONPOD[Monitoring Pod]
            LOGPOD[Logging Pod]
        end
    end
    
    subgraph "Persistent Storage"
        PV1[Database Volume]
        PV2[Log Volume]
    end
    
    DNS --> CDN
    CDN --> LB
    LB --> SSL
    SSL --> POD1
    SSL --> POD2
    SSL --> POD3
    
    POD1 --> DBPOD
    POD2 --> DBPOD
    POD3 --> DBPOD
    POD1 --> CACHEPOD
    POD2 --> CACHEPOD
    POD3 --> CACHEPOD
    POD3 --> QUEUEPOD
    
    POD1 --> MONPOD
    POD2 --> MONPOD
    POD3 --> MONPOD
    
    DBPOD --> PV1
    LOGPOD --> PV2
    
    classDef external fill:#e1f5fe
    classDef lb fill:#f3e5f5
    classDef app fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef monitor fill:#fce4ec
    classDef storage fill:#f1f8e9
    
    class CDN,DNS external
    class LB,SSL lb
    class POD1,POD2,POD3 app
    class DBPOD,CACHEPOD,QUEUEPOD data
    class MONPOD,LOGPOD monitor
    class PV1,PV2 storage
`;

    return {
      type: 'mermaid',
      code: mermaidCode,
      title: 'Deployment Architecture',
      description: `${deployment} deployment with ${architecture} services`
    };
  };

  const generateSecurityDiagram = (compliance: string[], industry: string, projectDesc: string) => {
    const mermaidCode = `
graph TB
    subgraph "External Zone"
        USER[Users]
        THREAT[Threats]
    end
    
    subgraph "DMZ"
        WAF[Web Application Firewall]
        LB[Load Balancer]
    end
    
    subgraph "Application Zone"
        AUTH[Authentication Service]
        API[API Gateway]
        APP[Application Services]
    end
    
    subgraph "Data Zone"
        ENCRYPT[Encryption Service]
        DB[(Encrypted Database)]
        AUDIT[Audit Logger]
    end
    
    subgraph "Security Controls"
        IDS[Intrusion Detection]
        SCAN[Vulnerability Scanner]
        SIEM[SIEM]
    end
    
    USER -->|HTTPS| WAF
    THREAT -.->|Blocked| WAF
    WAF --> LB
    LB --> AUTH
    AUTH --> API
    API --> APP
    APP --> ENCRYPT
    ENCRYPT --> DB
    APP --> AUDIT
    
    IDS --> SIEM
    SCAN --> SIEM
    AUDIT --> SIEM
    
    ${compliance.includes('hipaa') ? 'APP --> |PHI Protection| ENCRYPT' : ''}
    ${compliance.includes('pci') ? 'APP --> |PCI Compliance| ENCRYPT' : ''}
    ${compliance.includes('sox') ? 'AUDIT --> |SOX Audit Trail| DB' : ''}
    
    classDef external fill:#ffebee
    classDef dmz fill:#fff3e0
    classDef app fill:#e8f5e8
    classDef data fill:#e3f2fd
    classDef security fill:#fce4ec
    
    class USER,THREAT external
    class WAF,LB dmz
    class AUTH,API,APP app
    class ENCRYPT,DB,AUDIT data
    class IDS,SCAN,SIEM security
`;

    return {
      type: 'mermaid',
      code: mermaidCode,
      title: 'Security Architecture',
      description: `Security layers and controls with ${compliance.join(', ')} compliance`
    };
  };

  const generateComplianceDiagram = (compliance: string[], industry: string, projectDesc: string) => {
    const mermaidCode = `
graph TD
    subgraph "Data Collection"
        INPUT[User Input]
        API[API Calls]
        SYS[System Events]
    end
    
    subgraph "Processing & Validation"
        VAL[Data Validation]
        CLASS[Data Classification]
        CONSENT[Consent Management]
    end
    
    subgraph "Storage & Protection"
        ENCRYPT[Encryption]
        DB[(Secure Database)]
        BACKUP[(Encrypted Backups)]
    end
    
    subgraph "Audit & Compliance"
        AUDIT[Audit Logger]
        TRAIL[(Audit Trail)]
        REPORT[Compliance Reports]
    end
    
    subgraph "Access Control"
        AUTH[Authentication]
        AUTHZ[Authorization]
        RBAC[Role-Based Access]
    end
    
    INPUT --> VAL
    API --> VAL
    SYS --> VAL
    VAL --> CLASS
    CLASS --> CONSENT
    CONSENT --> ENCRYPT
    ENCRYPT --> DB
    DB --> BACKUP
    
    VAL --> AUDIT
    CLASS --> AUDIT
    ENCRYPT --> AUDIT
    AUDIT --> TRAIL
    TRAIL --> REPORT
    
    VAL --> AUTH
    AUTH --> AUTHZ
    AUTHZ --> RBAC
    RBAC --> DB
    
    ${compliance.includes('gdpr') ? `
    CONSENT --> |GDPR Rights| REPORT
    CLASS --> |Data Minimization| ENCRYPT
    ` : ''}
    
    ${compliance.includes('hipaa') ? `
    CLASS --> |PHI Classification| ENCRYPT
    RBAC --> |Minimum Necessary| DB
    ` : ''}
    
    ${compliance.includes('sox') ? `
    AUDIT --> |SOX Controls| TRAIL
    RBAC --> |Segregation of Duties| DB
    ` : ''}
    
    classDef collection fill:#e1f5fe
    classDef processing fill:#e8f5e8
    classDef storage fill:#fff3e0
    classDef audit fill:#fce4ec
    classDef access fill:#f3e5f5
    
    class INPUT,API,SYS collection
    class VAL,CLASS,CONSENT processing
    class ENCRYPT,DB,BACKUP storage
    class AUDIT,TRAIL,REPORT audit
    class AUTH,AUTHZ,RBAC access
`;

    return {
      type: 'mermaid',
      code: mermaidCode,
      title: 'Compliance Architecture',
      description: `Compliance data flow for ${compliance.join(', ')} requirements`
    };
  };

  const exportDiagram = async (format: string) => {
    const diagram = generatedDiagrams[selectedDiagramType];
    if (!diagram) return;

    try {
      if (format === 'svg') {
        const svgElement = document.querySelector('.mermaid-diagram svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          
          const downloadLink = document.createElement('a');
          downloadLink.href = svgUrl;
          downloadLink.download = `${diagram.title.replace(/\s+/g, '_')}.svg`;
          downloadLink.click();
          
          URL.revokeObjectURL(svgUrl);
        }
      } else if (format === 'png') {
        const svgElement = document.querySelector('.mermaid-diagram svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `${diagram.title.replace(/\s+/g, '_')}.png`;
                downloadLink.click();
                URL.revokeObjectURL(url);
              }
            });
          };
          
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
      } else if (format === 'mermaid') {
        const blob = new Blob([diagram.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${diagram.title.replace(/\s+/g, '_')}.mmd`;
        downloadLink.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  const addComment = (x: number, y: number, text: string) => {
    const newComment = {
      id: Date.now(),
      x,
      y,
      text,
      author: 'Current User',
      timestamp: new Date().toISOString()
    };
    setComments([...comments, newComment]);
  };

  const MermaidDiagram = ({ code, title }: { code: string; title: string }) => {
    const [svgContent, setSvgContent] = useState<string>('');
    const [isRendering, setIsRendering] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
      let isMounted = true;
      let mermaidInstance: any = null;
      
      const renderDiagram = async () => {
        if (!isMounted) return;
        
        setIsRendering(true);
        setError('');
        
        try {
          // Import mermaid dynamically
          const mermaid = await import('mermaid');
          mermaidInstance = mermaid.default;
          
          // Initialize mermaid with stable configuration
          mermaidInstance.initialize({
            startOnLoad: false,
            theme: 'default',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis'
            },
            securityLevel: 'loose',
            // Disable ResizeObserver to prevent errors
            suppressResizeObserverError: true
          });

          // Use a unique ID for each diagram
          const diagramId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Generate SVG with error handling
          const { svg } = await mermaidInstance.render(diagramId, code);
          
          if (isMounted) {
            setSvgContent(svg);
          }
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error);
          if (isMounted) {
            setError('Failed to render diagram');
            setSvgContent('');
          }
        } finally {
          if (isMounted) {
            setIsRendering(false);
          }
        }
      };

      if (code) {
        renderDiagram();
      }

      return () => {
        isMounted = false;
        // Clean up mermaid instance
        if (mermaidInstance) {
          try {
            mermaidInstance.reset();
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      };
    }, [code]);

    return (
      <div className="mermaid-diagram relative">
        <div 
          className="border border-gray-200 rounded-lg p-4 bg-white min-h-96"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
          
          {isRendering ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Rendering diagram...</span>
            </div>
                     ) : svgContent ? (
             <div 
               className="flex justify-center"
               dangerouslySetInnerHTML={{ __html: svgContent }}
             />
           ) : error ? (
             <div className="text-center py-8">
               <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                 <p className="text-red-600 mb-4">Failed to render diagram</p>
                 <button 
                   onClick={() => window.location.reload()}
                   className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                 >
                   Retry
                 </button>
               </div>
             </div>
           ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">Visual Diagram Preview</p>
                <div className="bg-white p-6 rounded border">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex space-x-4">
                      <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 text-center">
                        <div className="font-semibold text-blue-800">Users</div>
                        <div className="text-xs text-blue-600">External</div>
                      </div>
                      <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center">
                        <div className="font-semibold text-green-800">API Gateway</div>
                        <div className="text-xs text-green-600">API Layer</div>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-3 text-center">
                        <div className="font-semibold text-purple-800">Application</div>
                        <div className="text-xs text-purple-600">Services</div>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-3 text-center">
                        <div className="font-semibold text-orange-800">Database</div>
                        <div className="text-xs text-orange-600">Data Layer</div>
                      </div>
                      <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 text-center">
                        <div className="font-semibold text-red-800">Cache</div>
                        <div className="text-xs text-red-600">Storage</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Simplified visual representation of the architecture
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Comments overlay */}
        {showComments && comments.map(comment => (
          <div
            key={comment.id}
            className="absolute bg-yellow-100 border border-yellow-300 rounded p-2 text-xs max-w-48 z-10"
            style={{ left: comment.x, top: comment.y }}
          >
            <div className="font-medium">{comment.author}</div>
            <div>{comment.text}</div>
            <div className="text-gray-500 text-xs">
              {new Date(comment.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const currentDiagram = generatedDiagrams[selectedDiagramType];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">
            Architecture Diagrams
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setUseInteractiveDiagram(!useInteractiveDiagram)}
              className={`flex items-center px-3 py-1 text-sm rounded transition-colors ${
                useInteractiveDiagram ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <MousePointer size={14} className="mr-1" />
              Interactive
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center px-3 py-1 text-sm rounded transition-colors ${
                showComments ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Edit3 size={14} className="mr-1" />
              Comments
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
        
        {/* Diagram Type Selector */}
        <div className="flex flex-wrap gap-2">
          {diagramTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedDiagramType(type.id)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedDiagramType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {isGenerating ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Generating diagrams...</span>
          </div>
        ) : currentDiagram ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {currentDiagram.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentDiagram.description}
              </p>
            </div>
            
                         {useInteractiveDiagram ? (
               <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-96">
                 <h3 className="text-lg font-semibold mb-4 text-center">Interactive Architecture Diagram</h3>
                 <InteractiveDiagram
                   diagramType={selectedDiagramType}
                   architectureRecommendations={architectureRecommendations}
                   projectConfig={projectConfig}
                   onComponentClick={(componentId) => {
                     console.log('Component clicked:', componentId);
                   }}
                 />
               </div>
             ) : (
              <MermaidDiagram 
                code={currentDiagram.code} 
                title={currentDiagram.title}
              />
            )}
            
            <div className="mt-6 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => exportDiagram('svg')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Export SVG
                </button>
                <button
                  onClick={() => exportDiagram('png')}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Export PNG
                </button>
                <button
                  onClick={() => exportDiagram('mermaid')}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Export Code
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit && onEdit(currentDiagram)}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Architecture
                </button>
                <button
                  onClick={() => onApprove && onApprove(generatedDiagrams)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Eye size={16} className="mr-2" />
                  Approve & Continue
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No diagram available for this type
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramGenerator;