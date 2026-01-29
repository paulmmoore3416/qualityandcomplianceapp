import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { X } from 'lucide-react';
import { NCRType, NCR } from '../../types';

interface NCRModalProps {
  onClose: () => void;
}

export default function NCRModal({ onClose }: NCRModalProps) {
  const { addNCR } = useAppStore();

  const [type, setType] = useState<NCRType>('Product');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [disposition, setDisposition] = useState<NCR['disposition']>('Pending');

  const handleSubmit = () => {
    if (!title || !description) return;

    addNCR({
      type,
      title,
      description,
      detectedAt: new Date(),
      lotNumber: lotNumber || undefined,
      productCode: productCode || undefined,
      quantity: quantity ? parseInt(quantity) : undefined,
      disposition,
      status: 'Open',
      linkedCAPAs: [],
      isoReferences: [
        {
          standard: 'ISO 13485:2016',
          clause: '8.3',
          description: 'Control of nonconforming product',
        },
      ],
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Non-Conformance Report</h2>
            <p className="text-sm text-gray-500">Per ISO 13485:2016 Clause 8.3</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NCR Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NCRType)}
              className="input"
            >
              <option value="Product">Product Nonconformance</option>
              <option value="Process">Process Deviation</option>
              <option value="Documentation">Documentation Error</option>
              <option value="Supplier">Supplier Nonconformance</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Brief description of the nonconformance..."
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
              placeholder="Detailed description of the nonconformance, including how it was detected..."
            />
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="input"
                placeholder="LOT-XXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="input"
                placeholder="PROD-XXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Affected</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          {/* Disposition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Disposition</label>
            <select
              value={disposition}
              onChange={(e) => setDisposition(e.target.value as NCR['disposition'])}
              className="input"
            >
              <option value="Pending">Pending Investigation</option>
              <option value="Rework">Rework</option>
              <option value="Scrap">Scrap</option>
              <option value="Use As Is">Use As Is (with concession)</option>
              <option value="Return to Supplier">Return to Supplier</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Per ISO 13485:8.3 - Appropriate action shall be taken based on the nature of the nonconformity
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !description}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create NCR
          </button>
        </div>
      </div>
    </div>
  );
}
