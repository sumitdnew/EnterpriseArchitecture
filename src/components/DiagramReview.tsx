import React, { useState } from 'react';
import { 
  Users, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';
import DiagramGenerator from './DiagramGenerator';

interface ReviewComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
  type: 'comment' | 'approval' | 'rejection';
  diagramType?: string;
  position?: { x: number; y: number };
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
}

interface DiagramReviewProps {
  architectureRecommendations: any;
  projectConfig: any;
  problemDescription?: any;
  onApprove?: (diagrams: any) => void;
  onReject?: (reason: string) => void;
  onBackToRecommendations?: () => void;
}

const DiagramReview = ({ 
  architectureRecommendations, 
  projectConfig, 
  problemDescription,
  onApprove, 
  onReject,
  onBackToRecommendations 
}: DiagramReviewProps) => {
  const [activeTab, setActiveTab] = useState('diagrams');
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedDiagramType, setSelectedDiagramType] = useState('system');
  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Chen', role: 'Lead Architect', avatar: 'SC', status: 'reviewing' },
    { id: '2', name: 'Mike Johnson', role: 'Security Engineer', avatar: 'MJ', status: 'pending' },
    { id: '3', name: 'Lisa Rodriguez', role: 'DevOps Engineer', avatar: 'LR', status: 'pending' },
    { id: '4', name: 'David Kim', role: 'Product Manager', avatar: 'DK', status: 'pending' },
    { id: '5', name: 'Emma Wilson', role: 'QA Lead', avatar: 'EW', status: 'pending' }
  ]);

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: ReviewComment = {
      id: Date.now().toString(),
      author: 'Current User',
      role: 'Architect',
      text: newComment,
      timestamp: new Date().toISOString(),
      type: 'comment',
      diagramType: selectedDiagramType
    };
    
    setReviewComments([...reviewComments, comment]);
    setNewComment('');
  };

  const approveReview = () => {
    const approval: ReviewComment = {
      id: Date.now().toString(),
      author: 'Current User',
      role: 'Architect',
      text: 'Architecture approved for implementation',
      timestamp: new Date().toISOString(),
      type: 'approval'
    };
    
    setReviewComments([...reviewComments, approval]);
    onApprove && onApprove({ approved: true, comments: reviewComments });
  };

  const rejectReview = () => {
    const rejection: ReviewComment = {
      id: Date.now().toString(),
      author: 'Current User',
      role: 'Architect',
      text: 'Architecture requires modifications',
      timestamp: new Date().toISOString(),
      type: 'rejection'
    };
    
    setReviewComments([...reviewComments, rejection]);
    onReject && onReject('Architecture requires modifications');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'reviewing': return <Clock size={16} />;
      default: return <User size={16} />;
    }
  };

  const tabs = [
    { id: 'diagrams', name: 'Architecture Diagrams', icon: FileText },
    { id: 'team', name: 'Team Review', icon: Users },
    { id: 'comments', name: 'Comments & Feedback', icon: MessageCircle }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              Architecture Review & Approval
            </h2>
            <p className="text-gray-600">
              Review generated diagrams and collaborate with your team
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onBackToRecommendations}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Recommendations
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Diagrams Tab */}
        {activeTab === 'diagrams' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Generated Architecture Diagrams
              </h3>
              <p className="text-gray-600 text-sm">
                Review the automatically generated diagrams based on your architecture recommendations
              </p>
            </div>
            
            <DiagramGenerator
              architectureRecommendations={architectureRecommendations}
              projectConfig={projectConfig}
              problemDescription={problemDescription}
              onApprove={approveReview}
              onEdit={() => setActiveTab('comments')}
            />
          </div>
        )}

        {/* Team Review Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Team Review Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map(member => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                          {member.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {getStatusIcon(member.status)}
                        <span className="ml-1 capitalize">{member.status}</span>
                      </div>
                    </div>
                    
                    {member.status === 'pending' && (
                      <button className="w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Send Review Request
                      </button>
                    )}
                    
                    {member.status === 'reviewing' && (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center mb-1">
                          <Clock size={12} className="mr-1" />
                          Reviewing since 2 hours ago
                        </div>
                        <button className="w-full px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                          Send Reminder
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Review Workflow</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3">1</div>
                  <span>Lead Architect reviews and approves architecture</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs mr-3">2</div>
                  <span>Security Engineer validates security controls</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs mr-3">3</div>
                  <span>DevOps Engineer reviews deployment strategy</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs mr-3">4</div>
                  <span>Product Manager approves business requirements</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs mr-3">5</div>
                  <span>QA Lead validates testing strategy</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Comments & Feedback
              </h3>
              
              {/* Add Comment */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or feedback..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <button
                    onClick={addComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {reviewComments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No comments yet. Start the discussion!</p>
                  </div>
                ) : (
                  reviewComments.map(comment => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{comment.author}</div>
                            <div className="text-sm text-gray-600">{comment.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {comment.type === 'approval' && (
                            <div className="flex items-center text-green-600">
                              <ThumbsUp size={16} className="mr-1" />
                              <span className="text-sm">Approved</span>
                            </div>
                          )}
                          {comment.type === 'rejection' && (
                            <div className="flex items-center text-red-600">
                              <ThumbsDown size={16} className="mr-1" />
                              <span className="text-sm">Rejected</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-11">
                        <p className="text-slate-700">{comment.text}</p>
                        {comment.diagramType && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {comment.diagramType} diagram
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Approval Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-slate-800 mb-4">Review Actions</h4>
              <div className="flex space-x-4">
                <button
                  onClick={approveReview}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve Architecture
                </button>
                <button
                  onClick={rejectReview}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle size={16} className="mr-2" />
                  Request Changes
                </button>
                <button
                  onClick={() => setActiveTab('diagrams')}
                  className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FileText size={16} className="mr-2" />
                  View Diagrams
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramReview;
