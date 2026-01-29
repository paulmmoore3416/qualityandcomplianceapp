import { useState } from 'react';
import { X, AlertTriangle, Shield, Lock } from 'lucide-react';
import { ChangeType, ChangeClassification } from '../../types';

interface ChangeControlModalProps {
  onClose: () => void;
}

export default function ChangeControlModal({ onClose }: ChangeControlModalProps) {
  const [type, setType] = useState<ChangeType>('Process');
  const [classification, setClassification] = useState<ChangeClassification>('Minor');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [requestedBy, setRequestedBy] = useState('');

  // Impact assessment
  const [safetyImpact, setSafetyImpact] = useState<'High' | 'Medium' | 'Low' | 'None'>('Low');
  const [qualityImpact, setQualityImpact] = useState<'High' | 'Medium' | 'Low' | 'None'>('Low');
  const [regulatoryImpact, setRegulatoryImpact] = useState<'High' | 'Medium' | 'Low' | 'None'>('None');
  const [riskAssessmentRequired, setRiskAssessmentRequired] = useState(false);
  const [validationRequired, setValidationRequired] = useState(false);
  const [regulatorySubmissionRequired, setRegulatorySubmissionRequired] = useState(false);

  // Digital signature
  const [signaturePassword, setSignaturePassword] = useState('');
  const [signatureMeaning, setSignatureMeaning] = useState('I certify that this change request is necessary and the impact assessment is accurate.');

  const highImpact = safetyImpact === 'High' || qualityImpact === 'High' || regulatoryImpact === 'High';

  const handleSubmit = () => {
    if (!title || !description || !justification || !requestedBy || !signaturePassword) return;
    // In production this would save to the store with proper digital signature hash
    console.log('Creating change control with digital signature');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Change Control Request</h2>
            <p className="text-sm text-gray-500">
              Per ISO 13485:7.3.9 & 21 CFR Part 11 - Electronic Signatures
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
          {/* Section 1: Change Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-surface-200 pb-2">
              Change Details
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value as ChangeType)} className="input">
                  <option value="Design">Design</option>
                  <option value="Process">Process</option>
                  <option value="Material">Material</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Document">Document</option>
                  <option value="Software">Software</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classification *</label>
                <select value={classification} onChange={(e) => setClassification(e.target.value as ChangeClassification)} className="input">
                  <option value="Administrative">Administrative</option>
                  <option value="Minor">Minor</option>
                  <option value="Major">Major</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested By *</label>
                <input type="text" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} className="input" placeholder="Name / Role" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Brief description of the change..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" placeholder="What is being changed and how..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Justification *</label>
              <textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={2} className="input" placeholder="Why is this change necessary..." />
            </div>
          </div>

          {/* Section 2: Impact Assessment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-surface-200 pb-2">
              Impact Assessment
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Safety Impact
                </label>
                <select value={safetyImpact} onChange={(e) => setSafetyImpact(e.target.value as typeof safetyImpact)} className="input">
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Impact</label>
                <select value={qualityImpact} onChange={(e) => setQualityImpact(e.target.value as typeof qualityImpact)} className="input">
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Impact</label>
                <select value={regulatoryImpact} onChange={(e) => setRegulatoryImpact(e.target.value as typeof regulatoryImpact)} className="input">
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {highImpact && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    High impact detected - additional reviews may be required
                  </span>
                </div>
              </div>
            )}

            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Required Actions</h4>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={riskAssessmentRequired} onChange={(e) => setRiskAssessmentRequired(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Risk Assessment Required (ISO 14971)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={validationRequired} onChange={(e) => setValidationRequired(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Validation Required (IQ/OQ/PQ)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={regulatorySubmissionRequired} onChange={(e) => setRegulatorySubmissionRequired(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Regulatory Submission Required</span>
              </label>
            </div>
          </div>

          {/* Section 3: Digital Signature (21 CFR Part 11) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-surface-200 pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Digital Signature (21 CFR Part 11)
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meaning of Signature</label>
                <textarea value={signatureMeaning} onChange={(e) => setSignatureMeaning(e.target.value)} rows={2} className="input text-sm" />
                <p className="text-xs text-gray-500 mt-1">Per 21 CFR 11.50 - Signature Manifestations</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password / PIN *</label>
                <input type="password" value={signaturePassword} onChange={(e) => setSignaturePassword(e.target.value)} className="input" placeholder="Enter your credentials to sign..." />
                <p className="text-xs text-gray-500 mt-1">
                  Your identity will be verified and linked to this record per 21 CFR 11.70
                </p>
              </div>

              <div className="text-xs text-blue-700 bg-blue-100 rounded p-2">
                <strong>Audit Trail:</strong> This submission will record your User ID, timestamp ({new Date().toLocaleString()}),
                meaning of signature, and IP address in a non-editable audit log.
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!title || !description || !justification || !requestedBy || !signaturePassword}
            className="btn-primary flex-1 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            Sign & Submit
          </button>
        </div>
      </div>
    </div>
  );
}
