import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Tag, User, Calendar } from 'lucide-react';
import { DocumentMetadata } from '../../types';

interface DocumentEditorModalProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: DocumentMetadata, content: string) => void;
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  document,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (document && isOpen) {
      setTitle(document.title);
      setDescription(document.description || '');
      setTags(document.tags || []);
      // In a real application, this would load the actual document content
      setContent(`Document content for: ${document.title}\n\nThis is a placeholder for the actual document content. In a real implementation, this would load the document from the file system or database.`);
    }
  }, [document, isOpen]);

  const handleSave = () => {
    if (!document) return;

    const updatedDocument: DocumentMetadata = {
      ...document,
      title,
      description,
      tags,
      updatedAt: new Date()
    };

    onSave(updatedDocument, content);
    onClose();
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

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-surface-900">Edit Document</h2>
              <p className="text-sm text-surface-600">{document.type} • Rev {document.revision}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {/* Metadata Section */}
            <div className="p-6 border-b border-surface-200 bg-surface-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Document Title
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
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter document description"
                  />
                </div>

                <div className="md:col-span-2">
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
            </div>

            {/* Content Editor */}
            <div className="flex-1 p-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Document Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-none"
                placeholder="Enter document content"
              />
            </div>
          </div>

          {/* Info Sidebar */}
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
                  <p className="text-sm font-medium text-surface-900">Created</p>
                  <p className="text-sm text-surface-600">
                    {document.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Last Modified</p>
                  <p className="text-sm text-surface-600">
                    {document.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
