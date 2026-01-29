import { X } from 'lucide-react';

interface AIAgentRunModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  response?: string;
  loading?: boolean;
}

export default function AIAgentRunModal({ open, onClose, title, response, loading }: AIAgentRunModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">AI Response</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm p-2">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">Running...</div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-surface-50 p-4 rounded">{response || 'No response'}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
