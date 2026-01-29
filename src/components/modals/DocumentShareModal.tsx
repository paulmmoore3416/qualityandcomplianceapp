import React, { useState } from 'react';
import { X, Send, Users, Mail, Link, Copy, Check } from 'lucide-react';
import { DocumentMetadata } from '../../types';

interface DocumentShareModalProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (document: DocumentMetadata, shareOptions: ShareOptions) => void;
}

interface ShareOptions {
  recipients: string[];
  message: string;
  permissions: {
    view: boolean;
    edit: boolean;
    download: boolean;
  };
  expiryDate?: string;
  requirePassword: boolean;
}

export const DocumentShareModal: React.FC<DocumentShareModalProps> = ({
  document,
  isOpen,
  onClose,
  onShare
}) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [message, setMessage] = useState('');
  const [permissions, setPermissions] = useState({
    view: true,
    edit: false,
    download: true
  });
  const [expiryDate, setExpiryDate] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleAddRecipient = () => {
    const email = recipientInput.trim();
    if (email && !recipients.includes(email) && email.includes('@')) {
      setRecipients([...recipients, email]);
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleShare = () => {
    if (!document) return;

    const shareOptions: ShareOptions = {
      recipients,
      message,
      permissions,
      expiryDate: expiryDate || undefined,
      requirePassword
    };

    onShare(document, shareOptions);

    // Generate a mock share link
    const mockLink = `https://app.com/share/${document.id}/${Date.now()}`;
    setShareLink(mockLink);

    // Reset form
    setRecipients([]);
    setRecipientInput('');
    setMessage('');
    setPermissions({ view: true, edit: false, download: true });
    setExpiryDate('');
    setRequirePassword(false);
  };

  const copyShareLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-surface-900">Share Document</h2>
              <p className="text-sm text-surface-600">{document.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Recipients
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter email address"
              />
              <button
                onClick={handleAddRecipient}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
            </div>
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipients.map((email, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="hover:text-primary-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
              placeholder="Add a message to the recipients"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-3">
              Permissions
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissions.view}
                  onChange={(e) => setPermissions({...permissions, view: e.target.checked})}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Allow viewing</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissions.edit}
                  onChange={(e) => setPermissions({...permissions, edit: e.target.checked})}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Allow editing</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissions.download}
                  onChange={(e) => setPermissions({...permissions, download: e.target.checked})}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Allow downloading</span>
              </label>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-3">
              Advanced Options
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-surface-600 mb-1">
                  Link Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={(e) => setRequirePassword(e.target.checked)}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Require password to access</span>
              </label>
            </div>
          </div>

          {/* Share Link (shown after sharing) */}
          {shareLink && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Share Link Generated</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
                />
                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200 bg-surface-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-surface-600 hover:text-surface-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={recipients.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Share Document
          </button>
        </div>
      </div>
    </div>
  );
};
