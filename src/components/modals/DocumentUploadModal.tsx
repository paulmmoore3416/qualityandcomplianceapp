import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Tag, User } from 'lucide-react';
import { DocumentMetadata, DocumentType, FileFormat } from '../../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: Omit<DocumentMetadata, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'accessControl'>, file: File) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DocumentType>('Other');
  const [department, setDepartment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes: DocumentType[] = [
    'CAD Model',
    'Design History File',
    'Process Instruction',
    'Quality Manual',
    'SOP',
    'Work Instruction',
    'Specification',
    'Test Method',
    'Validation Protocol',
    'Risk Management File',
    'Technical File',
    'Regulatory Submission',
    'Training Material',
    'Audit Report',
    'Change Control',
    'CAPA',
    'NCR',
    'Supplier Qualification',
    'Equipment Qualification',
    'Software Validation',
    'Label',
    'Packaging',
    'Other'
  ];

  const departments = [
    'Engineering',
    'Quality',
    'Regulatory',
    'Production',
    'Supply Chain',
    'IT',
    'HR',
    'Finance',
    'Legal',
    'Other'
  ];

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      // Auto-fill title from filename (remove extension)
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleUpload = () => {
    if (!file || !title.trim() || !type) return;

    const documentData: Omit<DocumentMetadata, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'accessControl'> = {
      documentNumber: `DOC-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      format: getFileFormat(file),
      revision: 'A',
      status: 'Draft',
      author: 'Current User', // In a real app, this would come from auth context
      reviewers: [],
      approvers: [],
      owner: 'Current User',
      department,
      tags: tags.length > 0 ? tags : undefined,
      isoReferences: [],
      filePath: `/uploads/${Date.now()}-${file.name}`,
      fileSize: file.size,
      checksum: `sha256:${Date.now()}`, // In real app, calculate actual checksum
    };

    onUpload(documentData, file);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('Other');
    setDepartment('');
    setTags([]);
    setTagInput('');
    setFile(null);
    setDragActive(false);
    onClose();
  };

  const getFileFormat = (file: File): FileFormat => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'doc': return 'DOC';
      case 'docx': return 'DOCX';
      case 'xls': return 'XLS';
      case 'xlsx': return 'XLSX';
      case 'ppt': return 'PPT';
      case 'pptx': return 'PPTX';
      case 'vsd': return 'VSD';
      case 'vsdx': return 'VSDX';
      case 'dwg': return 'DWG';
      case 'dxf': return 'DXF';
      case 'step': return 'STEP';
      case 'iges': return 'IGES';
      case 'stl': return 'STL';
      case 'png': return 'PNG';
      case 'jpg':
      case 'jpeg': return 'JPG';
      case 'svg': return 'SVG';
      case 'txt': return 'TXT';
      case 'xml': return 'XML';
      case 'json': return 'JSON';
      case 'zip': return 'ZIP';
      default: return 'Other';
    }
  };
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'txt':
        return '📄';
      default:
        return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-surface-900">Upload Document</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Document File *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-surface-300 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="text-lg font-medium text-surface-900">{file.name}</p>
                    <p className="text-sm text-surface-600">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-12 h-12 text-surface-400" />
                  <div>
                    <p className="text-lg font-medium text-surface-900">
                      Drop your file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-800 underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-surface-600">
                      Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT and more
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Document Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a type</option>
                {documentTypes.map((docType) => (
                  <option key={docType} value={docType}>{docType}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
              placeholder="Enter document description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add a tag"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200 bg-surface-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-surface-600 hover:text-surface-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim() || !type}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};
