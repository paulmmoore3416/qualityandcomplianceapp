import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { ComplaintSource, ComplaintSeverity } from '../../types';

interface ComplaintModalProps {
  onClose: () => void;
}

export default function ComplaintModal({ onClose }: ComplaintModalProps) {
  const [source, setSource] = useState<ComplaintSource>('Customer');
  const [severity, setSeverity] = useState<ComplaintSeverity>('Minor');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productCode, setProductCode] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [patientInvolved, setPatientInvolved] = useState(false);
  const [injuryReported, setInjuryReported] = useState(false);
  const [deathReported, setDeathReported] = useState(false);

  const handleSubmit = () => {
    // In a real app, this would save to the store
    console.log('Creating complaint:', {
      source,
      severity,
      title,
      description,
      productCode,
      lotNumber,
      patientInvolved,
      injuryReported,
      deathReported,
    });
    onClose();
  };

  // Auto-escalate severity based on safety flags
  const effectiveSeverity = deathReported
    ? 'Critical'
    : injuryReported
    ? 'Critical'
    : severity;

  const showRegulatoryWarning = injuryReported || deathReported || effectiveSeverity === 'Critical';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Log New Complaint</h2>
            <p className="text-sm text-gray-500">Per ISO 13485:8.2.2 - Complaint Handling</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Regulatory Warning */}
        {showRegulatoryWarning && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Regulatory Reporting Required</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This complaint involves a serious incident. Per EU MDR Article 87 and FDA 21 CFR 803,
              you may be required to submit a regulatory report within 15-30 days.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Source and Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as ComplaintSource)}
                className="input"
              >
                <option value="Customer">Customer</option>
                <option value="Healthcare Provider">Healthcare Provider</option>
                <option value="Distributor">Distributor</option>
                <option value="Internal">Internal</option>
                <option value="Regulatory">Regulatory Authority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
              <select
                value={effectiveSeverity}
                onChange={(e) => setSeverity(e.target.value as ComplaintSeverity)}
                disabled={injuryReported || deathReported}
                className="input disabled:bg-gray-100"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
              </select>
              {(injuryReported || deathReported) && (
                <p className="text-xs text-red-600 mt-1">Auto-escalated due to safety event</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Brief description of the complaint..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input"
              placeholder="Detailed description including who reported, what happened, when, and how..."
            />
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Code *</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="input"
                placeholder="MDV-XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="input"
                placeholder="LOT-XXXX-XXXX"
              />
            </div>
          </div>

          {/* Safety Flags */}
          <div className="bg-surface-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Safety Information</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={patientInvolved}
                  onChange={(e) => setPatientInvolved(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <span className="text-sm text-gray-700">Patient was involved in the event</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={injuryReported}
                  onChange={(e) => {
                    setInjuryReported(e.target.checked);
                    if (e.target.checked) setPatientInvolved(true);
                  }}
                  className="w-4 h-4 rounded text-orange-600"
                />
                <span className="text-sm text-gray-700">Injury was reported</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={deathReported}
                  onChange={(e) => {
                    setDeathReported(e.target.checked);
                    if (e.target.checked) {
                      setPatientInvolved(true);
                      setInjuryReported(true);
                    }
                  }}
                  className="w-4 h-4 rounded text-red-600"
                />
                <span className="text-sm text-gray-700 font-medium">Death was reported</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !description || !productCode}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showRegulatoryWarning ? 'Create & Flag for Regulatory' : 'Create Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
}
