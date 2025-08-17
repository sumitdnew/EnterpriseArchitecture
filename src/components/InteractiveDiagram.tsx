import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeToolbar,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Server, 
  Database, 
  Globe, 
  Shield, 
  Users, 
  MessageSquare, 
  Activity,
  Info,
  Settings,
  Zap
} from 'lucide-react';

interface ComponentDetails {
  id: string;
  name: string;
  type: string;
  description: string;
  technology: string;
  status: 'active' | 'planned' | 'deprecated';
  performance: {
    responseTime: string;
    throughput: string;
    availability: string;
  };
  security: {
    authentication: string;
    authorization: string;
    encryption: string;
  };
  dependencies: string[];
  configuration: Record<string, string>;
}

interface InteractiveDiagramProps {
  diagramType: string;
  architectureRecommendations: any;
  projectConfig: any;
  onComponentClick?: (componentId: string) => void;
}

const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  diagramType,
  architectureRecommendations,
  projectConfig,
  onComponentClick
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Generate nodes and edges based on diagram type
  const generateDiagramData = useCallback(() => {
    const { architecture, database, messageQueue, caching, deployment, compliance } = architectureRecommendations;
    
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    
    switch (diagramType) {
      case 'system':
        nodes = [
          {
            id: 'users',
            type: 'input',
            position: { x: 250, y: 0 },
            data: { 
              label: 'Users',
              icon: Users,
              details: {
                id: 'users',
                name: 'External Users',
                type: 'External',
                description: 'End users accessing the system',
                technology: 'Web/Mobile',
                status: 'active',
                performance: { responseTime: 'N/A', throughput: 'N/A', availability: 'N/A' },
                security: { authentication: 'OAuth 2.0', authorization: 'RBAC', encryption: 'TLS 1.3' },
                dependencies: [],
                configuration: {}
              }
            }
          },
          {
            id: 'api-gateway',
            position: { x: 250, y: 100 },
            data: { 
              label: 'API Gateway',
              icon: Globe,
              details: {
                id: 'api-gateway',
                name: 'API Gateway',
                type: 'Infrastructure',
                description: 'Central entry point for all API requests',
                technology: 'Kong/AWS API Gateway',
                status: 'active',
                performance: { responseTime: '50ms', throughput: '10K RPS', availability: '99.9%' },
                security: { authentication: 'JWT', authorization: 'API Keys', encryption: 'TLS 1.3' },
                dependencies: ['load-balancer'],
                configuration: { 'rate-limit': '1000/min', 'timeout': '30s' }
              }
            }
          },
          {
            id: 'load-balancer',
            position: { x: 250, y: 200 },
            data: { 
              label: 'Load Balancer',
              icon: Activity,
              details: {
                id: 'load-balancer',
                name: 'Load Balancer',
                type: 'Infrastructure',
                description: 'Distributes traffic across multiple instances',
                technology: 'HAProxy/Nginx',
                status: 'active',
                performance: { responseTime: '5ms', throughput: '50K RPS', availability: '99.99%' },
                security: { authentication: 'N/A', authorization: 'N/A', encryption: 'TLS 1.3' },
                dependencies: [],
                configuration: { 'algorithm': 'round-robin', 'health-check': '5s' }
              }
            }
          }
        ];
        
        if (architecture === 'microservices') {
          nodes.push(
            {
              id: 'user-service',
              position: { x: 100, y: 300 },
              data: { 
                label: 'User Service',
                icon: Users,
                details: {
                  id: 'user-service',
                  name: 'User Management Service',
                  type: 'Microservice',
                  description: 'Handles user authentication and profile management',
                  technology: projectConfig.techStack,
                  status: 'active',
                  performance: { responseTime: '200ms', throughput: '5K RPS', availability: '99.9%' },
                  security: { authentication: 'JWT', authorization: 'RBAC', encryption: 'AES-256' },
                  dependencies: ['user-database', 'cache'],
                  configuration: { 'port': '8081', 'replicas': '3' }
                }
              }
            },
            {
              id: 'product-service',
              position: { x: 250, y: 300 },
              data: { 
                label: 'Product Service',
                icon: Server,
                details: {
                  id: 'product-service',
                  name: 'Product Catalog Service',
                  type: 'Microservice',
                  description: 'Manages product information and inventory',
                  technology: projectConfig.techStack,
                  status: 'active',
                  performance: { responseTime: '150ms', throughput: '8K RPS', availability: '99.9%' },
                  security: { authentication: 'JWT', authorization: 'RBAC', encryption: 'AES-256' },
                  dependencies: ['product-database', 'cache'],
                  configuration: { 'port': '8082', 'replicas': '3' }
                }
              }
            },
            {
              id: 'order-service',
              position: { x: 400, y: 300 },
              data: { 
                label: 'Order Service',
                icon: MessageSquare,
                details: {
                  id: 'order-service',
                  name: 'Order Management Service',
                  type: 'Microservice',
                  description: 'Processes orders and payment transactions',
                  technology: projectConfig.techStack,
                  status: 'active',
                  performance: { responseTime: '300ms', throughput: '2K RPS', availability: '99.95%' },
                  security: { authentication: 'JWT', authorization: 'RBAC', encryption: 'AES-256' },
                  dependencies: ['order-database', 'message-queue'],
                  configuration: { 'port': '8083', 'replicas': '3' }
                }
              }
            }
          );
        } else {
          nodes.push({
            id: 'application',
            position: { x: 250, y: 300 },
            data: { 
              label: 'Application Server',
              icon: Server,
              details: {
                id: 'application',
                name: 'Monolithic Application',
                type: 'Application',
                description: 'Single application handling all business logic',
                technology: projectConfig.techStack,
                status: 'active',
                performance: { responseTime: '500ms', throughput: '1K RPS', availability: '99.9%' },
                security: { authentication: 'JWT', authorization: 'RBAC', encryption: 'AES-256' },
                dependencies: ['database', 'cache'],
                configuration: { 'port': '8080', 'replicas': '2' }
              }
            }
          });
        }
        
        // Add data layer nodes
        nodes.push(
          {
            id: 'database',
            position: { x: 250, y: 450 },
            data: { 
              label: database.toUpperCase(),
              icon: Database,
              details: {
                id: 'database',
                name: `${database.toUpperCase()} Database`,
                type: 'Data Store',
                description: `Primary ${database} database for data persistence`,
                technology: database,
                status: 'active',
                performance: { responseTime: '10ms', throughput: '20K QPS', availability: '99.99%' },
                security: { authentication: 'Database Auth', authorization: 'Schema-level', encryption: 'AES-256' },
                dependencies: [],
                configuration: { 'max-connections': '100', 'backup-schedule': 'daily' }
              }
            }
          },
          {
            id: 'cache',
            position: { x: 100, y: 450 },
            data: { 
              label: caching.toUpperCase(),
              icon: Zap,
              details: {
                id: 'cache',
                name: `${caching.toUpperCase()} Cache`,
                type: 'Cache',
                description: `Distributed ${caching} cache for performance`,
                technology: caching,
                status: 'active',
                performance: { responseTime: '1ms', throughput: '100K OPS', availability: '99.9%' },
                security: { authentication: 'Redis Auth', authorization: 'N/A', encryption: 'TLS' },
                dependencies: [],
                configuration: { 'max-memory': '2GB', 'ttl': '3600s' }
              }
            }
          },
          {
            id: 'message-queue',
            position: { x: 400, y: 450 },
            data: { 
              label: messageQueue.toUpperCase(),
              icon: MessageSquare,
              details: {
                id: 'message-queue',
                name: `${messageQueue.toUpperCase()} Message Queue`,
                type: 'Message Broker',
                description: `Asynchronous messaging with ${messageQueue}`,
                technology: messageQueue,
                status: 'active',
                performance: { responseTime: '5ms', throughput: '50K MSG/s', availability: '99.9%' },
                security: { authentication: 'SASL', authorization: 'ACLs', encryption: 'TLS' },
                dependencies: [],
                configuration: { 'partitions': '3', 'replication': '3' }
              }
            }
          }
        );
        
        // Add edges
        edges = [
          { id: 'users-gateway', source: 'users', target: 'api-gateway' },
          { id: 'gateway-lb', source: 'api-gateway', target: 'load-balancer' },
          { id: 'lb-database', source: 'load-balancer', target: 'database' },
          { id: 'lb-cache', source: 'load-balancer', target: 'cache' },
          { id: 'lb-queue', source: 'load-balancer', target: 'message-queue' }
        ];
        
        if (architecture === 'microservices') {
          edges.push(
            { id: 'lb-user-service', source: 'load-balancer', target: 'user-service' },
            { id: 'lb-product-service', source: 'load-balancer', target: 'product-service' },
            { id: 'lb-order-service', source: 'load-balancer', target: 'order-service' },
            { id: 'user-service-db', source: 'user-service', target: 'database' },
            { id: 'product-service-db', source: 'product-service', target: 'database' },
            { id: 'order-service-db', source: 'order-service', target: 'database' },
            { id: 'order-service-queue', source: 'order-service', target: 'message-queue' }
          );
        } else {
          edges.push({ id: 'lb-application', source: 'load-balancer', target: 'application' });
        }
        break;
        
      // Add other diagram types here...
      default:
        nodes = [];
        edges = [];
    }
    
    return { nodes, edges };
  }, [diagramType, architectureRecommendations, projectConfig]);

  const { nodes, edges } = generateDiagramData();
  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    setShowDetails(true);
    onComponentClick && onComponentClick(node.id);
  }, [onComponentClick]);

  const CustomNode = ({ data }: { data: any }) => {
    const Icon = data.icon || Server;
    
    return (
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
        <div className="flex items-center">
          <Icon className="w-5 h-5 mr-2 text-blue-600" />
          <div className="text-sm font-medium">{data.label}</div>
        </div>
      </div>
    );
  };

  const nodeTypes = {
    custom: CustomNode
  };

  const selectedNodeData = selectedNode ? 
    nodesState.find(node => node.id === selectedNode)?.data.details : null;

  return (
    <div className="h-96 w-full relative">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
      
      {/* Component Details Panel */}
      {showDetails && selectedNodeData && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {selectedNodeData.name}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedNodeData.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Technology</h4>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {selectedNodeData.technology}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Performance</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">{selectedNodeData.performance.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Throughput:</span>
                    <span className="font-medium">{selectedNodeData.performance.throughput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="font-medium">{selectedNodeData.performance.availability}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Security</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Authentication:</span>
                    <span className="font-medium">{selectedNodeData.security.authentication}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Authorization:</span>
                    <span className="font-medium">{selectedNodeData.security.authorization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Encryption:</span>
                    <span className="font-medium">{selectedNodeData.security.encryption}</span>
                  </div>
                </div>
              </div>
              
              {selectedNodeData.dependencies.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNodeData.dependencies.map((dep: string) => (
                      <span key={dep} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {Object.keys(selectedNodeData.configuration).length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Configuration</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(selectedNodeData.configuration).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveDiagram;
