import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Grid,
  List,
  Download,
  Share2,
  FolderOpen,
  File,
  Image,
  FileCode,
  Lock,
  Eye,
  Edit3,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Filter,
  MoreVertical,
  Copy,
  Archive,
  History,
  Star,
  StarOff,
} from 'lucide-react';
import { DocumentMetadata, FileFormat, DocumentType } from '../../types';
import { useAuthStore } from '../../stores/auth-store';
import { DocumentViewerModal } from '../modals/DocumentViewerModal';
import { DocumentEditorModal } from '../modals/DocumentEditorModal';
import { DocumentShareModal } from '../modals/DocumentShareModal';
import { DocumentUploadModal } from '../modals/DocumentUploadModal';

export const DocumentsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Draft' | 'Approved' | 'Obsolete'>('All');

  // New state for modals and interactions
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { currentUser, checkPermission } = useAuthStore();

  // Mock documents - in production, this would come from a backend
  const mockDocuments: DocumentMetadata[] = [
    {
      id: 'doc-001',
      documentNumber: 'DWG-2024-001',
      title: 'Main Assembly Drawing Rev C',
      description: 'Complete assembly drawing for cardiac stent delivery system',
      type: 'CAD Model',
      format: 'DWG',
      revision: 'C',
      status: 'Approved',
      effectiveDate: new Date('2025-11-01'),
      author: 'Michael Chen',
      reviewers: ['Sarah Johnson', 'Lisa Anderson'],
      approvers: ['Sarah Johnson'],
      owner: 'Engineering',
      department: 'Engineering',
      tags: ['Assembly', 'Critical', 'ISO 13485'],
      relatedProducts: ['STENT-CS-001'],
      isoReferences: [{ standard: 'ISO 13485:2016', clause: '4.2.4', description: 'Control of Records' }],
      linkedDocuments: ['doc-002', 'doc-003'],
      linkedChangeControls: ['CC-2025-042'],
      filePath: '/documents/engineering/DWG-2024-001-C.dwg',
      fileSize: 15728640,
      checksum: 'sha256:abc123...',
      version: 3,
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2025-11-01'),
      accessControl: {
        isRestricted: true,
        allowedRoles: ['Admin', 'Engineer', 'QA Manager'],
        allowedUsers: [],
        requiresAuthentication: true,
        viewPermissions: ['view_documents'],
        editPermissions: ['edit_documents'],
        deletePermissions: ['delete_documents'],
        sharePermissions: ['share_documents'],
      },
    },
    {
      id: 'doc-002',
      documentNumber: 'SPEC-2024-015',
      title: 'Material Specification - Biocompatible Polymer',
      description: 'Technical specification for USP Class VI polymer material',
      type: 'Specification',
      format: 'PDF',
      revision: 'B',
      status: 'Approved',
      effectiveDate: new Date('2025-09-15'),
      author: 'Sarah Johnson',
      reviewers: ['Michael Chen'],
      approvers: ['Sarah Johnson'],
      owner: 'Quality Assurance',
      department: 'QA',
      tags: ['Material', 'Biocompatibility', 'ISO 10993'],
      relatedProducts: ['STENT-CS-001', 'CATH-BC-002'],
      isoReferences: [
        { standard: 'ISO 10993', clause: '1', description: 'Biological evaluation of medical devices' },
        { standard: 'ISO 13485:2016', clause: '7.4.2', description: 'Purchasing information' },
      ],
      linkedDocuments: ['doc-001'],
      linkedChangeControls: [],
      filePath: '/documents/specifications/SPEC-2024-015-B.pdf',
      fileSize: 2457600,
      checksum: 'sha256:def456...',
      version: 2,
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2025-09-15'),
      accessControl: {
        isRestricted: false,
        allowedRoles: ['Admin', 'Engineer', 'QA Manager', 'Auditor'],
        allowedUsers: [],
        requiresAuthentication: true,
        viewPermissions: ['view_documents'],
        editPermissions: ['edit_documents'],
        deletePermissions: ['delete_documents'],
        sharePermissions: ['share_documents'],
      },
    },
    {
      id: 'doc-003',
      documentNumber: 'VISIO-2025-008',
      title: 'Process Flow Diagram - Sterilization Cycle',
      description: 'Visio diagram showing EtO sterilization process flow per ISO 11135',
      type: 'Visio Diagram',
      format: 'VSDX',
      revision: 'A',
      status: 'In Review',
      author: 'John Smith',
      reviewers: ['Sarah Johnson'],
      approvers: [],
      owner: 'Quality Assurance',
      department: 'QA',
      tags: ['Process', 'Sterilization', 'ISO 11135'],
      relatedProducts: ['STENT-CS-001'],
      isoReferences: [{ standard: 'ISO 11135', clause: '7', description: 'Sterilization process validation' }],
      linkedDocuments: ['doc-001'],
      linkedChangeControls: [],
      filePath: '/documents/processes/VISIO-2025-008-A.vsdx',
      fileSize: 1048576,
      checksum: 'sha256:ghi789...',
      version: 1,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15'),
      accessControl: {
        isRestricted: false,
        allowedRoles: ['Admin', 'Engineer', 'QA Manager', 'Auditor'],
        allowedUsers: [],
        requiresAuthentication: true,
        viewPermissions: ['view_documents'],
        editPermissions: ['edit_documents'],
        deletePermissions: ['delete_documents'],
        sharePermissions: ['share_documents'],
      },
    },
    {
      id: 'doc-004',
      documentNumber: 'DHF-001-2024',
      title: 'Design History File - Cardiac Stent v2.1',
      description: 'Complete design history file per FDA 21 CFR 820.30',
      type: 'Design History File',
      format: 'PDF',
      revision: 'D',
      status: 'Approved',
      effectiveDate: new Date('2025-12-01'),
      author: 'Michael Chen',
      reviewers: ['Sarah Johnson', 'Lisa Anderson'],
      approvers: ['Sarah Johnson'],
      owner: 'Engineering',
      department: 'Engineering',
      tags: ['DHF', 'Critical', 'FDA', 'ISO 13485'],
      relatedProducts: ['STENT-CS-001'],
      isoReferences: [
        { standard: 'ISO 13485:2016', clause: '7.3', description: 'Design and development' },
        { standard: 'FDA 21 CFR 820', clause: '820.30', description: 'Design controls' },
      ],
      linkedDocuments: ['doc-001', 'doc-002'],
      linkedChangeControls: ['CC-2025-038', 'CC-2025-042'],
      filePath: '/documents/dhf/DHF-001-2024-D.pdf',
      fileSize: 52428800,
      checksum: 'sha256:jkl012...',
      version: 4,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2025-12-01'),
      accessControl: {
        isRestricted: true,
        allowedRoles: ['Admin', 'QA Manager'],
        allowedUsers: ['Michael Chen', 'Lisa Anderson'],
        requiresAuthentication: true,
        viewPermissions: ['view_documents'],
        editPermissions: ['edit_documents'],
        deletePermissions: ['delete_documents'],
        sharePermissions: ['share_documents'],
      },
    },
  ];

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || doc.type === filterType;
    const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getFileIcon = (format: FileFormat) => {
    switch (format) {
      case 'DWG':
      case 'DXF':
      case 'STEP':
      case 'IGES':
      case 'STL':
        return <FileCode className="w-8 h-8 text-blue-600" />;
      case 'VSDX':
      case 'VSD':
        return <FileCode className="w-8 h-8 text-purple-600" />;
      case 'PDF':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'PNG':
      case 'JPG':
      case 'SVG':
        return <Image className="w-8 h-8 text-green-600" />;
      default:
        return <File className="w-8 h-8 text-surface-600" />;
    }
  };

  const getStatusBadge = (status: DocumentMetadata['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            In Review
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Edit3 className="w-3 h-3" />
            Draft
          </span>
        );
      case 'Obsolete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Obsolete
          </span>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const canViewDocument = (doc: DocumentMetadata): boolean => {
    if (!currentUser) return false;
    if (!doc.accessControl.requiresAuthentication) return true;

    const hasRole = doc.accessControl.allowedRoles.includes(currentUser.role);
    const isAllowedUser = doc.accessControl.allowedUsers.includes(currentUser.id);
    const hasPermission = doc.accessControl.viewPermissions.every((perm) =>
      checkPermission(perm as any)
    );

    return (hasRole || isAllowedUser) && hasPermission;
  };

  const canEditDocument = (doc: DocumentMetadata): boolean => {
    if (!currentUser) return false;

    const hasRole = doc.accessControl.allowedRoles.includes(currentUser.role);
    const isAllowedUser = doc.accessControl.allowedUsers.includes(currentUser.id);
    const hasPermission = doc.accessControl.editPermissions.every((perm) =>
      checkPermission(perm as any)
    );

    return (hasRole || isAllowedUser) && hasPermission;
  };

  // Handler functions for document actions
  const handleViewDocument = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleEditDocument = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setShowEditModal(true);
  };

  const handleDownloadDocument = (document: DocumentMetadata) => {
    // Mock download - in production, this would trigger actual file download
    alert(`Downloading ${document.documentNumber} - ${document.title}`);
  };

  const handleShareDocument = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  const handleToggleFavorite = (documentId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(documentId)) {
        newFavorites.delete(documentId);
      } else {
        newFavorites.add(documentId);
      }
      return newFavorites;
    });
  };

  const handleCloseModals = () => {
    setShowDocumentModal(false);
    setShowUploadModal(false);
    setShowShareModal(false);
    setShowEditModal(false);
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">
            Document Control (eDMS)
          </h1>
          <p className="text-surface-600 mt-1">
            Engineering Files • CAD/Visio • Technical Documentation
          </p>
        </div>
        {checkPermission('edit_documents') && (
          <button 
            onClick={handleUploadDocument}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Total Documents</p>
              <p className="text-3xl font-bold text-surface-900 mt-1">
                {mockDocuments.length}
              </p>
            </div>
            <FolderOpen className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">CAD Drawings</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {mockDocuments.filter((d) => d.type === 'CAD Model').length}
              </p>
            </div>
            <FileCode className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">In Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {mockDocuments.filter((d) => d.status === 'In Review').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Restricted</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {mockDocuments.filter((d) => d.accessControl.isRestricted).length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search documents, tags, or numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DocumentType | 'All')}
              className="px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Types</option>
              <option value="CAD Model">CAD Model</option>
              <option value="Visio Diagram">Visio Diagram</option>
              <option value="Specification">Specification</option>
              <option value="Design History File">DHF</option>
              <option value="Test Report">Test Report</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Obsolete">Obsolete</option>
            </select>
            <div className="flex border border-surface-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-white text-surface-600 hover:bg-surface-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-white text-surface-600 hover:bg-surface-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const hasAccess = canViewDocument(doc);
            return (
              <div
                key={doc.id}
                className={`card hover:shadow-lg transition-shadow ${
                  !hasAccess ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.format)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-surface-900 line-clamp-1">
                          {doc.documentNumber}
                        </h3>
                        {doc.accessControl.isRestricted && (
                          <Lock className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-surface-600">Rev {doc.revision}</p>
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>

                <h4 className="font-medium text-surface-900 mb-2 line-clamp-2">
                  {doc.title}
                </h4>
                <p className="text-sm text-surface-600 mb-4 line-clamp-2">
                  {doc.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-surface-100 text-surface-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="px-2 py-1 bg-surface-100 text-surface-700 rounded text-xs">
                      +{doc.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-surface-600 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {doc.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-xs text-surface-600 mb-4">
                  {formatFileSize(doc.fileSize)} • {doc.format}
                </div>

                <div className="flex gap-2">
                  {hasAccess ? (
                    <>
                      <button 
                        onClick={() => handleViewDocument(doc)}
                        className="btn-sm btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {canEditDocument(doc) && (
                        <button 
                          onClick={() => handleEditDocument(doc)}
                          className="btn-sm btn-outline"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {checkPermission('share_documents') && (
                        <button 
                          onClick={() => handleShareDocument(doc)}
                          className="btn-sm btn-outline"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownloadDocument(doc)}
                        className="btn-sm btn-outline"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center py-2 px-4 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Access Restricted
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-surface-200">
                {filteredDocuments.map((doc) => {
                  const hasAccess = canViewDocument(doc);
                  return (
                    <tr key={doc.id} className={`hover:bg-surface-50 ${!hasAccess ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.format)}
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-surface-900">
                                {doc.documentNumber}
                              </div>
                              {doc.accessControl.isRestricted && (
                                <Lock className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div className="text-sm text-surface-600 line-clamp-1">
                              {doc.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {doc.owner}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-6 py-4">
                        {hasAccess ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleViewDocument(doc)}
                              className="text-primary-600 hover:text-primary-800 p-1"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canEditDocument(doc) && (
                              <button 
                                onClick={() => handleEditDocument(doc)}
                                className="text-surface-600 hover:text-surface-800 p-1"
                                title="Edit Document"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDownloadDocument(doc)}
                              className="text-surface-600 hover:text-surface-800 p-1"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {checkPermission('share_documents') && (
                              <button 
                                onClick={() => handleShareDocument(doc)}
                                className="text-surface-600 hover:text-surface-800 p-1"
                                title="Share Document"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">
                            <Lock className="w-3 h-3 inline" /> Restricted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 mb-2">
            No documents found
          </h3>
          <p className="text-surface-600">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Modals */}
      <DocumentViewerModal
        document={selectedDocument}
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onEdit={(doc) => {
          setSelectedDocument(doc);
          setShowDocumentModal(false);
          setShowEditModal(true);
        }}
        onDownload={handleDownloadDocument}
        onShare={(doc) => {
          setSelectedDocument(doc);
          setShowDocumentModal(false);
          setShowShareModal(true);
        }}
      />

      <DocumentEditorModal
        document={selectedDocument}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={(doc, content) => {
          // In a real application, this would save the document
          console.log('Saving document:', doc, content);
          setShowEditModal(false);
        }}
      />

      <DocumentShareModal
        document={selectedDocument}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(doc, options) => {
          // In a real application, this would handle sharing
          console.log('Sharing document:', doc, options);
          setShowShareModal(false);
        }}
      />

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(doc, file) => {
          // In a real application, this would upload the document
          console.log('Uploading document:', doc, file);
          setShowUploadModal(false);
        }}
      />
    </div>
  );
};

export default DocumentsView;
