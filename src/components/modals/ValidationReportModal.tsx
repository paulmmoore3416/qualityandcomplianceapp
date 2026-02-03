import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { X, Plus, Trash2 } from 'lucide-react';
import { ValidationReportType, ValidationCategory, TestMethodType, TestResultOutcome } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface ValidationReportModalProps {
  onClose: () => void;
}

export default function ValidationReportModal({ onClose }: ValidationReportModalProps) {
  const { addValidationReport } = useAppStore();

  // Section 1: Metadata
  const [reportType, setReportType] = useState<ValidationReportType>('EVT');
  const [category, setCategory] = useState<ValidationCategory>('Verification');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [version, setVersion] = useState('1.0');

  // Section 2: Objective
  const [objective, setObjective] = useState('');

  // Section 3: Device Under Test
  const [dutName, setDutName] = useState('');
  const [dutPartNumber, setDutPartNumber] = useState('');
  const [dutRevision, setDutRevision] = useState('');
  const [dutDescription, setDutDescription] = useState('');
  const [dutSoftwareVersion, setDutSoftwareVersion] = useState('');

  // Section 4: Requirements
  const [requirements, setRequirements] = useState<Array<{
    id: string; requirementId: string; description: string;
    category: string; acceptanceCriteria: string; verificationMethod: string;
  }>>([]);

  // Section 5: Test Methods
  const [testMethods, setTestMethods] = useState<Array<{
    id: string; testMethodId: string; title: string; type: TestMethodType;
    procedure: string; acceptanceCriteria: string; equipment: string;
  }>>([]);

  // Section 6: Test Results
  const [testResults, setTestResults] = useState<Array<{
    id: string; testMethodId: string; requirementId: string;
    measuredValue: string; outcome: TestResultOutcome; testedBy: string; notes: string;
  }>>([]);

  // Section 7: Conclusion
  const [overallConclusion, setOverallConclusion] = useState<TestResultOutcome>('Not Tested');
  const [conclusionSummary, setConclusionSummary] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [nonConformances, setNonConformances] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const addRequirement = () => {
    setRequirements([...requirements, {
      id: uuidv4(), requirementId: `REQ-${String(requirements.length + 1).padStart(3, '0')}`,
      description: '', category: 'Performance', acceptanceCriteria: '', verificationMethod: 'Test',
    }]);
  };

  const addTestMethod = () => {
    setTestMethods([...testMethods, {
      id: uuidv4(), testMethodId: `TM-${String(testMethods.length + 1).padStart(3, '0')}`,
      title: '', type: 'Functional', procedure: '', acceptanceCriteria: '', equipment: '',
    }]);
  };

  const addTestResult = () => {
    setTestResults([...testResults, {
      id: uuidv4(), testMethodId: testMethods[0]?.id || '',
      requirementId: requirements[0]?.id || '', measuredValue: '',
      outcome: 'Not Tested', testedBy: author, notes: '',
    }]);
  };

  const handleSubmit = () => {
    if (!title || !author || !dutName || !objective) return;

    const reportNumber = `${reportType}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

    addValidationReport({
      reportNumber,
      title,
      type: reportType,
      category,
      status: 'Draft',
      version,
      author,
      reviewers: [],
      approvers: [],
      objective,
      deviceUnderTest: {
        name: dutName,
        partNumber: dutPartNumber,
        revision: dutRevision,
        description: dutDescription,
        softwareVersion: dutSoftwareVersion || undefined,
      },
      testMethods: testMethods.map((tm) => ({
        id: tm.id,
        testMethodId: tm.testMethodId,
        title: tm.title,
        description: tm.procedure,
        type: tm.type,
        equipment: tm.equipment.split(',').map((e) => e.trim()).filter(Boolean),
        procedure: tm.procedure,
        acceptanceCriteria: tm.acceptanceCriteria,
        isoReferences: [],
      })),
      requirements: requirements.map((r) => ({
        id: r.id,
        requirementId: r.requirementId,
        description: r.description,
        category: r.category as 'Performance' | 'Safety' | 'Functional' | 'Regulatory' | 'User Need' | 'Environmental',
        source: '',
        acceptanceCriteria: r.acceptanceCriteria,
        verificationMethod: r.verificationMethod as 'Test' | 'Inspection' | 'Analysis' | 'Demonstration',
        isoReferences: [],
      })),
      testResults: testResults.map((tr) => ({
        id: tr.id,
        testMethodId: tr.testMethodId,
        requirementId: tr.requirementId,
        measuredValue: tr.measuredValue || undefined,
        acceptanceCriteria: requirements.find((r) => r.id === tr.requirementId)?.acceptanceCriteria || '',
        outcome: tr.outcome,
        testedBy: tr.testedBy,
        testedAt: new Date(),
        notes: tr.notes || undefined,
      })),
      overallConclusion,
      conclusionSummary,
      nonConformances,
      failures: [],
      designChangeRecommendations: recommendations,
      discussionNotes,
      linkedNCRs: [],
      linkedCAPAs: [],
      linkedChangeControls: [],
      linkedRiskAssessments: [],
      linkedDocuments: [],
      isoReferences: [
        { standard: 'ISO 13485', clause: category === 'Verification' ? '7.3.6' : '7.3.7', description: category === 'Verification' ? 'Design and development verification' : 'Design and development validation' },
      ],
      auditTrail: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-gray-900">New Engineering Validation Report</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded-md">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Report Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Report Metadata</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value as ValidationReportType)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm">
                  <option value="EVT">EVT - Engineering Validation</option>
                  <option value="DVT">DVT - Design Validation</option>
                  <option value="PVT">PVT - Production Validation</option>
                  <option value="DVP&R">DVP&R - Design Verification Plan & Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ValidationCategory)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm">
                  <option value="Verification">Verification - &quot;Did I build it right?&quot;</option>
                  <option value="Validation">Validation - &quot;Did I build the right thing?&quot;</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Cardiac Monitor Sensor Module - Engineering Validation" className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Section 2: Objective */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Objective / Purpose</h3>
            <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={3} placeholder="Describe the purpose of this validation report..." className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
          </div>

          {/* Section 3: Device Under Test */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Device Under Test (DUT)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={dutName} onChange={(e) => setDutName(e.target.value)} placeholder="Device/component name" className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                <input type="text" value={dutPartNumber} onChange={(e) => setDutPartNumber(e.target.value)} placeholder="e.g., CM-SENS-200" className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revision</label>
                <input type="text" value={dutRevision} onChange={(e) => setDutRevision(e.target.value)} placeholder="e.g., A" className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={dutDescription} onChange={(e) => setDutDescription(e.target.value)} placeholder="Brief description of the DUT" className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Software Version</label>
                <input type="text" value={dutSoftwareVersion} onChange={(e) => setDutSoftwareVersion(e.target.value)} placeholder="e.g., FW 2.1.0" className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Section 4: Requirements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Requirements & Standards</h3>
              <button onClick={addRequirement} className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200">
                <Plus className="w-3 h-3" /> Add Requirement
              </button>
            </div>
            {requirements.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No requirements added yet. Click &quot;Add Requirement&quot; to begin.</p>
            ) : (
              <div className="space-y-3">
                {requirements.map((req, idx) => (
                  <div key={req.id} className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gray-500">{req.requirementId}</span>
                      <button onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input type="text" placeholder="Requirement description" value={req.description}
                          onChange={(e) => { const updated = [...requirements]; updated[idx] = { ...req, description: e.target.value }; setRequirements(updated); }}
                          className="w-full px-3 py-1.5 border border-surface-200 rounded text-sm" />
                      </div>
                      <select value={req.category}
                        onChange={(e) => { const updated = [...requirements]; updated[idx] = { ...req, category: e.target.value }; setRequirements(updated); }}
                        className="px-3 py-1.5 border border-surface-200 rounded text-sm">
                        <option value="Performance">Performance</option>
                        <option value="Safety">Safety</option>
                        <option value="Functional">Functional</option>
                        <option value="Regulatory">Regulatory</option>
                        <option value="User Need">User Need</option>
                        <option value="Environmental">Environmental</option>
                      </select>
                      <select value={req.verificationMethod}
                        onChange={(e) => { const updated = [...requirements]; updated[idx] = { ...req, verificationMethod: e.target.value }; setRequirements(updated); }}
                        className="px-3 py-1.5 border border-surface-200 rounded text-sm">
                        <option value="Test">Test</option>
                        <option value="Inspection">Inspection</option>
                        <option value="Analysis">Analysis</option>
                        <option value="Demonstration">Demonstration</option>
                      </select>
                      <div className="col-span-2">
                        <input type="text" placeholder="Acceptance criteria" value={req.acceptanceCriteria}
                          onChange={(e) => { const updated = [...requirements]; updated[idx] = { ...req, acceptanceCriteria: e.target.value }; setRequirements(updated); }}
                          className="w-full px-3 py-1.5 border border-surface-200 rounded text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Test Methods */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Test Methods & Setup</h3>
              <button onClick={addTestMethod} className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200">
                <Plus className="w-3 h-3" /> Add Test Method
              </button>
            </div>
            {testMethods.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No test methods added yet.</p>
            ) : (
              <div className="space-y-3">
                {testMethods.map((tm, idx) => (
                  <div key={tm.id} className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gray-500">{tm.testMethodId}</span>
                      <button onClick={() => setTestMethods(testMethods.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Test title" value={tm.title}
                        onChange={(e) => { const updated = [...testMethods]; updated[idx] = { ...tm, title: e.target.value }; setTestMethods(updated); }}
                        className="px-3 py-1.5 border border-surface-200 rounded text-sm" />
                      <select value={tm.type}
                        onChange={(e) => { const updated = [...testMethods]; updated[idx] = { ...tm, type: e.target.value as TestMethodType }; setTestMethods(updated); }}
                        className="px-3 py-1.5 border border-surface-200 rounded text-sm">
                        {['Functional', 'Environmental', 'Mechanical', 'Electrical', 'Software', 'Biocompatibility', 'Sterilization', 'Usability', 'EMC', 'Other'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div className="col-span-2">
                        <input type="text" placeholder="Equipment (comma-separated)" value={tm.equipment}
                          onChange={(e) => { const updated = [...testMethods]; updated[idx] = { ...tm, equipment: e.target.value }; setTestMethods(updated); }}
                          className="w-full px-3 py-1.5 border border-surface-200 rounded text-sm" />
                      </div>
                      <div className="col-span-2">
                        <textarea placeholder="Procedure" value={tm.procedure} rows={2}
                          onChange={(e) => { const updated = [...testMethods]; updated[idx] = { ...tm, procedure: e.target.value }; setTestMethods(updated); }}
                          className="w-full px-3 py-1.5 border border-surface-200 rounded text-sm" />
                      </div>
                      <div className="col-span-2">
                        <input type="text" placeholder="Acceptance criteria" value={tm.acceptanceCriteria}
                          onChange={(e) => { const updated = [...testMethods]; updated[idx] = { ...tm, acceptanceCriteria: e.target.value }; setTestMethods(updated); }}
                          className="w-full px-3 py-1.5 border border-surface-200 rounded text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Test Results */}
          {(requirements.length > 0 && testMethods.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Test Results & Data</h3>
                <button onClick={addTestResult} className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200">
                  <Plus className="w-3 h-3" /> Add Result
                </button>
              </div>
              {testResults.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No test results recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((tr, idx) => (
                    <div key={tr.id} className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                      <div className="flex items-center justify-end mb-2">
                        <button onClick={() => setTestResults(testResults.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <select value={tr.testMethodId}
                          onChange={(e) => { const updated = [...testResults]; updated[idx] = { ...tr, testMethodId: e.target.value }; setTestResults(updated); }}
                          className="px-3 py-1.5 border border-surface-200 rounded text-sm">
                          {testMethods.map((tm) => (
                            <option key={tm.id} value={tm.id}>{tm.testMethodId} - {tm.title}</option>
                          ))}
                        </select>
                        <select value={tr.requirementId}
                          onChange={(e) => { const updated = [...testResults]; updated[idx] = { ...tr, requirementId: e.target.value }; setTestResults(updated); }}
                          className="px-3 py-1.5 border border-surface-200 rounded text-sm">
                          {requirements.map((r) => (
                            <option key={r.id} value={r.id}>{r.requirementId}</option>
                          ))}
                        </select>
                        <select value={tr.outcome}
                          onChange={(e) => { const updated = [...testResults]; updated[idx] = { ...tr, outcome: e.target.value as TestResultOutcome }; setTestResults(updated); }}
                          className="px-3 py-1.5 border border-surface-200 rounded text-sm">
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                          <option value="Conditional Pass">Conditional Pass</option>
                          <option value="Not Tested">Not Tested</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                        <input type="text" placeholder="Measured value" value={tr.measuredValue}
                          onChange={(e) => { const updated = [...testResults]; updated[idx] = { ...tr, measuredValue: e.target.value }; setTestResults(updated); }}
                          className="px-3 py-1.5 border border-surface-200 rounded text-sm" />
                        <input type="text" placeholder="Tested by" value={tr.testedBy}
                          onChange={(e) => { const updated = [...testResults]; updated[idx] = { ...tr, testedBy: e.target.value }; setTestResults(updated); }}
                          className="px-3 py-1.5 border border-surface-200 rounded text-sm" />
                        <input type="text" placeholder="Notes" value={tr.notes}
                          onChange={(e) => { const updated = [...testResults]; updated[idx] = { ...tr, notes: e.target.value }; setTestResults(updated); }}
                          className="px-3 py-1.5 border border-surface-200 rounded text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 7: Conclusion & Discussion */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Conclusion & Discussion</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Conclusion</label>
                  <select value={overallConclusion} onChange={(e) => setOverallConclusion(e.target.value as TestResultOutcome)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm">
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Conditional Pass">Conditional Pass</option>
                    <option value="Not Tested">Not Tested</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conclusion Summary</label>
                <textarea value={conclusionSummary} onChange={(e) => setConclusionSummary(e.target.value)} rows={3} placeholder="Summarize the overall pass/fail conclusion..." className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Non-Conformances</label>
                  <button onClick={() => setNonConformances([...nonConformances, ''])} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                {nonConformances.map((nc, idx) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input type="text" value={nc}
                      onChange={(e) => { const updated = [...nonConformances]; updated[idx] = e.target.value; setNonConformances(updated); }}
                      placeholder="Describe non-conformance..."
                      className="flex-1 px-3 py-1.5 border border-surface-200 rounded text-sm" />
                    <button onClick={() => setNonConformances(nonConformances.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Design Change Recommendations</label>
                  <button onClick={() => setRecommendations([...recommendations, ''])} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input type="text" value={rec}
                      onChange={(e) => { const updated = [...recommendations]; updated[idx] = e.target.value; setRecommendations(updated); }}
                      placeholder="Describe recommendation..."
                      className="flex-1 px-3 py-1.5 border border-surface-200 rounded text-sm" />
                    <button onClick={() => setRecommendations(recommendations.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discussion Notes</label>
                <textarea value={discussionNotes} onChange={(e) => setDiscussionNotes(e.target.value)} rows={3} placeholder="Additional discussion, analysis, and observations..." className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-surface-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !author || !dutName || !objective}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Report
          </button>
        </div>
      </div>
    </div>
  );
}
