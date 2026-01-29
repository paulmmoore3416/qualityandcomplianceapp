import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { X, Plus, Trash2 } from 'lucide-react';
import { CAPAType, CAPAPriority, CAPAAction } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface CAPAModalProps {
  onClose: () => void;
}

export default function CAPAModal({ onClose }: CAPAModalProps) {
  const { addCAPA } = useAppStore();

  const [type, setType] = useState<CAPAType>('Corrective');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [priority, setPriority] = useState<CAPAPriority>('Medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [actions, setActions] = useState<Partial<CAPAAction>[]>([]);

  const addAction = () => {
    setActions([
      ...actions,
      {
        id: uuidv4(),
        description: '',
        assignee: '',
        dueDate: new Date(),
        status: 'Pending',
        verificationRequired: false,
      },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<CAPAAction>) => {
    setActions(
      actions.map((action, i) => (i === index ? { ...action, ...updates } : action))
    );
  };

  const handleSubmit = () => {
    if (!title || !description || !assignee || !dueDate) return;

    addCAPA({
      type,
      title,
      description,
      rootCause,
      status: 'Open',
      priority,
      assignee,
      dueDate: new Date(dueDate),
      linkedNCRs: [],
      linkedRiskAssessments: [],
      isoReferences: [
        {
          standard: 'ISO 13485:2016',
          clause: type === 'Corrective' ? '8.5.2' : '8.5.3',
          description: type === 'Corrective' ? 'Corrective action' : 'Preventive action',
        },
      ],
      actions: actions.map((a) => ({
        id: a.id || uuidv4(),
        description: a.description || '',
        assignee: a.assignee || assignee,
        dueDate: a.dueDate || new Date(dueDate),
        status: 'Pending',
        verificationRequired: a.verificationRequired || false,
      })),
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New CAPA</h2>
            <p className="text-sm text-gray-500">
              Per ISO 13485:2016 Clause 8.5.2/8.5.3
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CAPAType)}
                className="input"
              >
                <option value="Corrective">Corrective (8.5.2)</option>
                <option value="Preventive">Preventive (8.5.3)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CAPAPriority)}
                className="input"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
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
              placeholder="Brief description of the issue..."
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
              placeholder="Detailed description of the nonconformity or potential issue..."
            />
          </div>

          {/* Root Cause */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Root Cause Analysis
            </label>
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              rows={2}
              className="input"
              placeholder="Identified root cause (use 5-Why or Fishbone analysis)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Per ISO 13485:8.5.2 - Action to eliminate the cause of nonconformities
            </p>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee *</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="input"
                placeholder="Responsible person..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Action Items</label>
              <button onClick={addAction} className="btn-ghost btn-sm gap-1">
                <Plus className="w-4 h-4" />
                Add Action
              </button>
            </div>
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div key={action.id} className="p-3 bg-surface-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={action.description}
                        onChange={(e) => updateAction(index, { description: e.target.value })}
                        className="input text-sm"
                        placeholder="Action description..."
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={action.assignee}
                          onChange={(e) => updateAction(index, { assignee: e.target.value })}
                          className="input text-sm"
                          placeholder="Assignee..."
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={action.verificationRequired}
                            onChange={(e) =>
                              updateAction(index, { verificationRequired: e.target.checked })
                            }
                            className="rounded"
                          />
                          Verification Required
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAction(index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
            disabled={!title || !description || !assignee || !dueDate}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create CAPA
          </button>
        </div>
      </div>
    </div>
  );
}
