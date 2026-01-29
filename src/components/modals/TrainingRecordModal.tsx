import { X, Download, FileText } from 'lucide-react';
import { TrainingRecord } from '../../types';
import { formatDate, formatDateTime } from '../../lib/utils';

interface TrainingRecordModalProps {
  record: TrainingRecord;
  onClose: () => void;
}

export default function TrainingRecordModal({ record, onClose }: TrainingRecordModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text report for download
    const reportContent = generateReportContent(record);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Training-Record-${record.employeeId}-${record.trainingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = (record: TrainingRecord) => {
    return `
MEDTECH COMPLIANCE SOLUTIONS LLC
Training & Competency Record
ISO 13485:2016 Compliance System

================================================================================

TRAINING RECORD DETAILS
================================================================================

Employee Information:
- Employee ID: ${record.employeeId}
- Employee Name: ${record.employeeName}
- Department: ${record.department}
- Role: ${record.role}

Training Information:
- Training ID: ${record.trainingId}
- Training Title: ${record.trainingTitle}
- Training Type: ${record.trainingType}
- Required By: ${formatDate(record.requiredBy)}
- Status: ${record.status}

Completion Details:
${record.completedDate ? `- Completed Date: ${formatDate(record.completedDate)}` : '- Completed Date: Not completed'}
${record.expiryDate ? `- Expiry Date: ${formatDate(record.expiryDate)}` : '- Expiry Date: N/A'}
${record.score !== undefined ? `- Score: ${record.score}%` : '- Score: N/A'}
${record.passingScore ? `- Passing Score: ${record.passingScore}%` : '- Passing Score: N/A'}

Verification:
${record.verifiedBy ? `- Verified By: ${record.verifiedBy}` : '- Verified By: Pending verification'}
${record.verificationDate ? `- Verification Date: ${formatDate(record.verificationDate)}` : '- Verification Date: N/A'}

================================================================================

COMPLIANCE STATEMENT
================================================================================

This training record confirms that the above employee has ${record.status === 'Completed' ? 'successfully completed' : 'been assigned'} the required training in accordance with ISO 13485:2016 Clause 6.2 (Human Resources) requirements for competence and training.

${record.status === 'Completed' ? 'The employee has demonstrated the necessary competence for their role.' : 'Training completion and competence verification is pending.'}

================================================================================

Report Generated: ${formatDateTime(new Date())}
MedTech Compliance Solutions LLC - Quality Management System
================================================================================
`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Training Record Report</h2>
              <p className="text-sm text-gray-500">{record.trainingTitle} - {record.employeeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="btn-ghost btn-sm gap-2"
              title="Download Report"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="btn-ghost btn-sm gap-2"
              title="Print Report"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="btn-ghost btn-sm p-2"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Letterhead */}
          <div className="text-center mb-8 pb-4 border-b-2 border-primary-600">
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              MEDTECH COMPLIANCE SOLUTIONS LLC
            </h1>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Training & Competency Record
            </h2>
            <p className="text-sm text-gray-600">
              ISO 13485:2016 Compliance Management System
            </p>
          </div>

          {/* Employee Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-900">{record.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employee Name</p>
                <p className="font-medium text-gray-900">{record.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{record.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium text-gray-900">{record.role}</p>
              </div>
            </div>
          </div>

          {/* Training Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Training Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Training ID</p>
                <p className="font-medium text-gray-900">{record.trainingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Training Title</p>
                <p className="font-medium text-gray-900">{record.trainingTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Training Type</p>
                <p className="font-medium text-gray-900">{record.trainingType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Required By</p>
                <p className="font-medium text-gray-900">{formatDate(record.requiredBy)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  record.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  record.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                  record.status === 'Expired' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.status}
                </span>
              </div>
            </div>
          </div>

          {/* Completion Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Completion Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {record.completedDate && (
                <div>
                  <p className="text-sm text-gray-500">Completed Date</p>
                  <p className="font-medium text-gray-900">{formatDate(record.completedDate)}</p>
                </div>
              )}
              {record.expiryDate && (
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium text-gray-900">{formatDate(record.expiryDate)}</p>
                </div>
              )}
              {record.score !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className={`font-medium ${record.score >= (record.passingScore || 80) ? 'text-green-600' : 'text-red-600'}`}>
                    {record.score}%
                  </p>
                </div>
              )}
              {record.passingScore && (
                <div>
                  <p className="text-sm text-gray-500">Passing Score</p>
                  <p className="font-medium text-gray-900">{record.passingScore}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Verification */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Verification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Verified By</p>
                <p className="font-medium text-gray-900">
                  {record.verifiedBy || 'Pending verification'}
                </p>
              </div>
              {record.verificationDate && (
                <div>
                  <p className="text-sm text-gray-500">Verification Date</p>
                  <p className="font-medium text-gray-900">{formatDate(record.verificationDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Statement */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Compliance Statement
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                This training record confirms that the above employee has{' '}
                <span className="font-medium">
                  {record.status === 'Completed' ? 'successfully completed' : 'been assigned'}
                </span>{' '}
                the required training in accordance with ISO 13485:2016 Clause 6.2 (Human Resources) requirements for competence and training.
              </p>
              <p className="text-sm text-gray-700">
                {record.status === 'Completed'
                  ? 'The employee has demonstrated the necessary competence for their role.'
                  : 'Training completion and competence verification is pending.'
                }
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
            <p>Report Generated: {formatDateTime(new Date())}</p>
            <p>MedTech Compliance Solutions LLC - Quality Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
}