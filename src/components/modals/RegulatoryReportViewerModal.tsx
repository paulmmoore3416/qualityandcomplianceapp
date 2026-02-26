import { X, Printer, FileText, CalendarDays, Building2, CheckCircle } from 'lucide-react';
import { ReportEntry } from '../../types';
import { cn, formatDate } from '../../lib/utils';

interface RegulatoryReportViewerModalProps {
  report: ReportEntry;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Pending Submission':
      return 'bg-orange-100 text-orange-700';
    case 'Submitted':
      return 'bg-blue-100 text-blue-700';
    case 'Acknowledged':
      return 'bg-green-100 text-green-700';
    case 'Closed':
      return 'bg-surface-100 text-gray-600';
    default:
      return 'bg-surface-100 text-gray-600';
  }
}

export default function RegulatoryReportViewerModal({ report, isOpen, onClose }: RegulatoryReportViewerModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:static" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col print:max-w-none print:max-h-none print:shadow-none print:rounded-none" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 print:border-b-2 print:border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Regulatory Report Initiation</h2>
              <p className="text-sm text-gray-500">Professional regulatory submission outline</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-surface-100 rounded-md transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-md" title="Close">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:overflow-visible">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
              <div className="mt-2 inline-flex items-center gap-2">
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusBadge(report.status))}>{report.status}</span>
              </div>
            </div>
            <div className="bg-surface-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Authority</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-800">
                <Building2 className="w-4 h-4 text-gray-500" />
                {report.authority || 'Not specified'}
              </div>
            </div>
            <div className="bg-surface-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-800">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                {report.dueDate ? formatDate(report.dueDate) : 'Not specified'}
              </div>
            </div>
          </div>

          {/* Report Overview */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.reportType ? `${report.reportType} Report` : 'Regulatory report initiation'}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Created by</p>
                <p className="font-medium text-gray-800">{report.createdBy}</p>
                <p className="text-xs">{formatDate(report.createdAt)}</p>
              </div>
            </div>

            <div className="bg-white border border-surface-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Initiation Summary</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.summary || 'Regulatory report initiation recorded.'}</p>
            </div>
          </div>

          {/* Submission Checklist */}
          <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Submission Checklist</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Confirm report scope and classification',
                'Attach complaint investigation summary',
                'Verify device identification details',
                'Collect supporting evidence and test data',
                'Prepare authority-specific submission forms',
                'Obtain QA/RA approval and sign-off',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Approval */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-surface-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Review & Approval</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Pending QA/RA review
              </div>
            </div>
            <div className="border border-surface-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Submission Status</h4>
              <p className="text-sm text-gray-600">Track and update the submission details within the Vigilance module.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
