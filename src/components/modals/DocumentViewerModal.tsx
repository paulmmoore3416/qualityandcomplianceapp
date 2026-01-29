import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Edit3, FileText, Calendar, User, Tag } from 'lucide-react';
import { DocumentMetadata } from '../../types';

interface DocumentViewerModalProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (document: DocumentMetadata) => void;
  onDownload?: (document: DocumentMetadata) => void;
  onShare?: (document: DocumentMetadata) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  onEdit,
  onDownload,
  onShare
}) => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (document && isOpen) {
      // In a real application, this would fetch the document content
      // For now, we'll show a placeholder
      setContent(`Document content for: ${document.title}\n\nThis is a placeholder for the actual document content. In a real implementation, this would load the document from the file system or database.`);
    }
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentIcon = (format: string) => {
    switch (format.toLowerCase()) {
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
      default:
        return '📄';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getDocumentIcon(document.format)}</span>
            <div>
              <h2 className="text-xl font-semibold text-surface-900">{document.title}</h2>
              <p className="text-sm text-surface-600">{document.format.toUpperCase()} • Rev {document.revision}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(document)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
            {onDownload && (
              <button
                onClick={() => onDownload(document)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-surface-600 text-white rounded-md hover:bg-surface-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(document)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Document Content */}
          <div className="flex-1 p-6">
            <div className="bg-surface-50 rounded-lg p-4 min-h-[400px] font-mono text-sm whitespace-pre-wrap">
              {content}
            </div>
          </div>

          {/* Document Info Sidebar */}
          <div className="w-full lg:w-80 bg-surface-50 p-6 border-t lg:border-t-0 lg:border-l border-surface-200">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Document Information</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Type</p>
                  <p className="text-sm text-surface-600">{document.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Format</p>
                  <p className="text-sm text-surface-600">{document.format}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Author</p>
                  <p className="text-sm text-surface-600">{document.author}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Last Modified</p>
                  <p className="text-sm text-surface-600">{formatDate(document.updatedAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Created</p>
                  <p className="text-sm text-surface-600">{formatDate(document.createdAt)}</p>
                </div>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-surface-900 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {document.description && (
                <div>
                  <p className="text-sm font-medium text-surface-900 mb-2">Description</p>
                  <p className="text-sm text-surface-600">{document.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
