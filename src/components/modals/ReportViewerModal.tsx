import { useState } from 'react';
import { X, Printer, Download, CheckCircle, XCircle, AlertTriangle, Clock, FileText, FlaskConical } from 'lucide-react';
import { ValidationReport } from '../../types';
import { cn, formatDate } from '../../lib/utils';

interface ReportViewerModalProps {
  report: ValidationReport;
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'requirements' | 'methods' | 'results' | 'traceability' | 'discussion';

function getOutcomeStyle(outcome: string): string {
  switch (outcome) {
    case 'Pass': return 'bg-green-100 text-green-700';
    case 'Fail': return 'bg-red-100 text-red-700';
    case 'Conditional Pass': return 'bg-yellow-100 text-yellow-700';
    case 'In Progress': return 'bg-blue-100 text-blue-700';
    case 'Not Tested': return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100 text-gray-500';
  }
}

function getOutcomeIcon(outcome: string) {
  switch (outcome) {
    case 'Pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'Fail': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'Conditional Pass': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case 'In Progress': return <Clock className="w-4 h-4 text-blue-600" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-700';
    case 'In Progress': return 'bg-blue-100 text-blue-700';
    case 'Under Review': return 'bg-yellow-100 text-yellow-700';
    case 'Approved': return 'bg-green-100 text-green-700';
    case 'Rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function ReportViewerModal({ report, isOpen, onClose }: ReportViewerModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!isOpen) return null;

  const passCount = report.testResults.filter((t) => t.outcome === 'Pass').length;
  const failCount = report.testResults.filter((t) => t.outcome === 'Fail').length;
  const conditionalCount = report.testResults.filter((t) => t.outcome === 'Conditional Pass').length;
  const notTestedCount = report.testResults.filter((t) => t.outcome === 'Not Tested').length;
  const inProgressCount = report.testResults.filter((t) => t.outcome === 'In Progress').length;

  // Traceability matrix computation
  const traceabilityMatrix = report.requirements.map((req) => {
    const results = report.testResults.filter((tr) => tr.requirementId === req.id);
    return {
      requirement: req,
      methodResults: report.testMethods.map((tm) => {
        const result = results.find((r) => r.testMethodId === tm.id);
        return { testMethod: tm, result };
      }),
    };
  });

  const coverageCount = report.requirements.filter((req) =>
    report.testResults.some((tr) => tr.requirementId === req.id && tr.outcome !== 'Not Tested')
  ).length;
  const coveragePercent = report.requirements.length > 0
    ? (coverageCount / report.requirements.length) * 100
    : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'methods', label: 'Test Methods' },
    { id: 'results', label: 'Results' },
    { id: 'traceability', label: 'Traceability Matrix' },
    { id: 'discussion', label: 'Discussion' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:static" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col print:max-w-none print:max-h-none print:shadow-none print:rounded-none" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 print:border-b-2 print:border-gray-300">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-primary-600" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{report.reportNumber}</h2>
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(report.status))}>
                  {report.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{report.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-surface-100 rounded-md transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-surface-100 rounded-md transition-colors">
              <Download className="w-4 h-4" /> Export JSON
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-md">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-surface-200 print:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-surface-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 print:overflow-visible">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Report Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{report.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{report.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Version</p>
                  <p className="font-medium">v{report.version}</p>
                </div>
                <div>
                  <p className="text-gray-500">Author</p>
                  <p className="font-medium">{report.author}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(report.createdAt)}</p>
                </div>
                {report.approvedAt && (
                  <div>
                    <p className="text-gray-500">Approved</p>
                    <p className="font-medium">{formatDate(report.approvedAt)} by {report.approvedBy}</p>
                  </div>
                )}
              </div>

              {/* Objective */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Objective / Purpose</h3>
                <p className="text-sm text-gray-600 bg-surface-50 p-4 rounded-lg">{report.objective}</p>
              </div>

              {/* Device Under Test */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Device Under Test (DUT)</h3>
                <div className="bg-surface-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><p className="text-gray-500">Name</p><p className="font-medium">{report.deviceUnderTest.name}</p></div>
                    <div><p className="text-gray-500">Part Number</p><p className="font-medium">{report.deviceUnderTest.partNumber}</p></div>
                    <div><p className="text-gray-500">Revision</p><p className="font-medium">{report.deviceUnderTest.revision}</p></div>
                    {report.deviceUnderTest.softwareVersion && (
                      <div><p className="text-gray-500">Software Version</p><p className="font-medium">{report.deviceUnderTest.softwareVersion}</p></div>
                    )}
                    {report.deviceUnderTest.serialNumbers && report.deviceUnderTest.serialNumbers.length > 0 && (
                      <div><p className="text-gray-500">Serial Numbers</p><p className="font-medium">{report.deviceUnderTest.serialNumbers.join(', ')}</p></div>
                    )}
                  </div>
                  {report.deviceUnderTest.description && (
                    <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-surface-200">{report.deviceUnderTest.description}</p>
                  )}
                </div>
              </div>

              {/* Overall Conclusion */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Overall Conclusion</h3>
                <div className={cn('p-4 rounded-lg flex items-center gap-3', getOutcomeStyle(report.overallConclusion))}>
                  {getOutcomeIcon(report.overallConclusion)}
                  <span className="text-lg font-bold">{report.overallConclusion}</span>
                </div>
                {report.conclusionSummary && (
                  <p className="text-sm text-gray-600 mt-2">{report.conclusionSummary}</p>
                )}
              </div>

              {/* Test Summary Stats */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Test Results Summary</h3>
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">{passCount}</p>
                    <p className="text-xs text-green-600">Pass</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-700">{failCount}</p>
                    <p className="text-xs text-red-600">Fail</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-700">{conditionalCount}</p>
                    <p className="text-xs text-yellow-600">Conditional</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
                    <p className="text-xs text-blue-600">In Progress</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-700">{notTestedCount}</p>
                    <p className="text-xs text-gray-600">Not Tested</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Design Requirements ({report.requirements.length})</h3>
              {report.requirements.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No requirements defined.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Req ID</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Description</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Category</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Acceptance Criteria</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.requirements.map((req) => (
                        <tr key={req.id} className="border-b border-surface-100 hover:bg-surface-50">
                          <td className="px-3 py-2 font-mono text-xs">{req.requirementId}</td>
                          <td className="px-3 py-2">{req.description}</td>
                          <td className="px-3 py-2"><span className="px-2 py-0.5 bg-surface-100 rounded text-xs">{req.category}</span></td>
                          <td className="px-3 py-2 text-gray-600">{req.acceptanceCriteria}</td>
                          <td className="px-3 py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{req.verificationMethod}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Test Methods Tab */}
          {activeTab === 'methods' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Methods ({report.testMethods.length})</h3>
              {report.testMethods.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No test methods defined.</p>
              ) : (
                <div className="space-y-4">
                  {report.testMethods.map((tm) => (
                    <div key={tm.id} className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-gray-500">{tm.testMethodId}</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{tm.type}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{tm.title}</h4>
                      {tm.equipment.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Equipment</p>
                          <div className="flex flex-wrap gap-1">
                            {tm.equipment.map((eq, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-surface-200 rounded text-xs">{eq}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Procedure</p>
                        <p className="text-sm text-gray-600">{tm.procedure}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Acceptance Criteria</p>
                        <p className="text-sm text-gray-600 font-medium">{tm.acceptanceCriteria}</p>
                      </div>
                      {tm.environmentalConditions && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Environmental Conditions</p>
                          <p className="text-sm text-gray-600">{tm.environmentalConditions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Results ({report.testResults.length})</h3>
              {report.testResults.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No test results recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Test Method</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Requirement</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Measured Value</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Criteria</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Outcome</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Tester</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.testResults.map((tr) => {
                        const method = report.testMethods.find((tm) => tm.id === tr.testMethodId);
                        const req = report.requirements.find((r) => r.id === tr.requirementId);
                        return (
                          <tr key={tr.id} className="border-b border-surface-100 hover:bg-surface-50">
                            <td className="px-3 py-2 font-mono text-xs">{method?.testMethodId || '-'}</td>
                            <td className="px-3 py-2 font-mono text-xs">{req?.requirementId || '-'}</td>
                            <td className="px-3 py-2">{tr.measuredValue || '-'} {tr.unit || ''}</td>
                            <td className="px-3 py-2 text-gray-600 text-xs">{tr.acceptanceCriteria}</td>
                            <td className="px-3 py-2">
                              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getOutcomeStyle(tr.outcome))}>
                                {tr.outcome}
                              </span>
                            </td>
                            <td className="px-3 py-2">{tr.testedBy}</td>
                            <td className="px-3 py-2 text-xs">{formatDate(tr.testedAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {report.testResults.some((tr) => tr.notes) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                  <div className="space-y-2">
                    {report.testResults.filter((tr) => tr.notes).map((tr) => {
                      const method = report.testMethods.find((tm) => tm.id === tr.testMethodId);
                      return (
                        <div key={tr.id} className="bg-surface-50 p-3 rounded text-sm">
                          <span className="font-mono text-xs text-gray-500">{method?.testMethodId}:</span>{' '}
                          <span className="text-gray-600">{tr.notes}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Traceability Matrix Tab */}
          {activeTab === 'traceability' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Requirements Traceability Matrix (DVP&R)</h3>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  coveragePercent === 100 ? 'bg-green-100 text-green-700' :
                  coveragePercent >= 75 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                )}>
                  Coverage: {coveragePercent.toFixed(0)}% ({coverageCount}/{report.requirements.length})
                </span>
              </div>
              {report.requirements.length === 0 || report.testMethods.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Requirements and test methods must be defined to generate the traceability matrix.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-surface-200">
                    <thead>
                      <tr className="bg-surface-50">
                        <th className="sticky left-0 bg-surface-50 z-10 text-left px-3 py-2 font-medium text-gray-700 border-b border-r border-surface-200 min-w-[200px]">
                          Requirement
                        </th>
                        {report.testMethods.map((tm) => (
                          <th key={tm.id} className="text-center px-3 py-2 font-medium text-gray-700 border-b border-surface-200 whitespace-nowrap min-w-[80px]">
                            <div className="text-xs font-mono">{tm.testMethodId}</div>
                            <div className="text-[10px] text-gray-400 font-normal truncate max-w-[100px]">{tm.title}</div>
                          </th>
                        ))}
                        <th className="text-center px-3 py-2 font-medium text-gray-700 border-b border-l border-surface-200">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traceabilityMatrix.map((row) => {
                        const reqResults = report.testResults.filter((tr) => tr.requirementId === row.requirement.id);
                        const allPass = reqResults.length > 0 && reqResults.every((r) => r.outcome === 'Pass');
                        const anyFail = reqResults.some((r) => r.outcome === 'Fail');
                        const reqStatus = reqResults.length === 0 ? 'Not Tested' : anyFail ? 'Fail' : allPass ? 'Pass' : 'In Progress';

                        return (
                          <tr key={row.requirement.id} className="border-b border-surface-100 hover:bg-surface-50">
                            <td className="sticky left-0 bg-white z-10 px-3 py-2 border-r border-surface-200">
                              <div className="font-mono text-xs text-gray-500">{row.requirement.requirementId}</div>
                              <div className="text-xs text-gray-700 truncate max-w-[250px]">{row.requirement.description}</div>
                            </td>
                            {row.methodResults.map((cell) => (
                              <td key={cell.testMethod.id} className="text-center px-3 py-2 border-surface-100">
                                {cell.result ? (
                                  <span className={cn(
                                    'inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
                                    getOutcomeStyle(cell.result.outcome)
                                  )}>
                                    {cell.result.outcome === 'Pass' ? 'P' :
                                     cell.result.outcome === 'Fail' ? 'F' :
                                     cell.result.outcome === 'Conditional Pass' ? 'C' :
                                     cell.result.outcome === 'In Progress' ? '...' : '-'}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">&mdash;</span>
                                )}
                              </td>
                            ))}
                            <td className="text-center px-3 py-2 border-l border-surface-200">
                              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getOutcomeStyle(reqStatus))}>
                                {reqStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="font-medium">Legend:</span>
                <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">P</span> Pass</span>
                <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold">F</span> Fail</span>
                <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-[10px] font-bold">C</span> Conditional</span>
                <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">..</span> In Progress</span>
                <span className="flex items-center gap-1"><span className="text-gray-300">&mdash;</span> Not mapped</span>
              </div>
            </div>
          )}

          {/* Discussion Tab */}
          {activeTab === 'discussion' && (
            <div className="space-y-6">
              {report.nonConformances.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Non-Conformances ({report.nonConformances.length})
                  </h3>
                  <ul className="space-y-2">
                    {report.nonConformances.map((nc, i) => (
                      <li key={i} className="text-sm text-gray-600 bg-red-50 border border-red-200 rounded-lg p-3">
                        {nc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.failures.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Failures ({report.failures.length})
                  </h3>
                  <ul className="space-y-2">
                    {report.failures.map((f, i) => (
                      <li key={i} className="text-sm text-gray-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.designChangeRecommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Design Change Recommendations ({report.designChangeRecommendations.length})
                  </h3>
                  <ul className="space-y-2">
                    {report.designChangeRecommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.discussionNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Discussion Notes</h3>
                  <p className="text-sm text-gray-600 bg-surface-50 p-4 rounded-lg whitespace-pre-wrap">{report.discussionNotes}</p>
                </div>
              )}

              {/* Linked Entities */}
              {(report.linkedNCRs.length > 0 || report.linkedCAPAs.length > 0 || report.linkedChangeControls.length > 0) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Linked Entities</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {report.linkedNCRs.length > 0 && (
                      <div className="bg-surface-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">Linked NCRs</p>
                        {report.linkedNCRs.map((id) => (
                          <p key={id} className="font-mono text-xs">{id.substring(0, 8)}</p>
                        ))}
                      </div>
                    )}
                    {report.linkedCAPAs.length > 0 && (
                      <div className="bg-surface-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">Linked CAPAs</p>
                        {report.linkedCAPAs.map((id) => (
                          <p key={id} className="font-mono text-xs">{id.substring(0, 8)}</p>
                        ))}
                      </div>
                    )}
                    {report.linkedChangeControls.length > 0 && (
                      <div className="bg-surface-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">Linked Change Controls</p>
                        {report.linkedChangeControls.map((id) => (
                          <p key={id} className="font-mono text-xs">{id.substring(0, 8)}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ISO References */}
              {report.isoReferences.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">ISO References</h3>
                  <div className="space-y-1">
                    {report.isoReferences.map((ref, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{ref.standard}:{ref.clause}</span>
                        <span className="text-gray-600">{ref.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No discussion content */}
              {report.nonConformances.length === 0 && report.failures.length === 0 &&
               report.designChangeRecommendations.length === 0 && !report.discussionNotes && (
                <p className="text-sm text-gray-400 italic">No discussion items recorded.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
