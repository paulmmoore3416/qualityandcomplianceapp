import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Plus, Search, FlaskConical, ChevronDown, ChevronRight, Eye, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { ValidationReport, ValidationReportStatus, ValidationReportType, ValidationCategory } from '../../types';
import ValidationReportModal from '../modals/ValidationReportModal';
import ReportViewerModal from '../modals/ReportViewerModal';

// Sample data for demonstration
const SAMPLE_REPORTS: Omit<ValidationReport, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    reportNumber: 'EVT-2026-001',
    title: 'Cardiac Monitor Sensor Module - Engineering Validation',
    type: 'EVT',
    category: 'Verification',
    status: 'Approved',
    version: '1.0',
    author: 'Paul Moore',
    reviewers: ['Katie Emma'],
    approvers: ['Katie Emma'],
    objective: 'Verify that the cardiac monitor sensor module meets all design specifications for signal acquisition accuracy, power consumption, and electromagnetic compatibility prior to DVT phase.',
    deviceUnderTest: {
      name: 'Cardiac Monitor Sensor Module',
      partNumber: 'CM-SENS-200',
      revision: 'B',
      serialNumbers: ['SN-001', 'SN-002', 'SN-003'],
      description: 'Analog front-end sensor module for continuous cardiac rhythm monitoring. Interfaces with main processing board via SPI.',
      softwareVersion: 'FW 2.1.0',
    },
    testMethods: [
      {
        id: 'tm-1',
        testMethodId: 'TM-001',
        title: 'Signal Accuracy Test',
        description: 'Verify ECG signal acquisition accuracy against reference standard.',
        type: 'Electrical',
        equipment: ['Fluke ProSim 8', 'Keysight DSOX3024T Oscilloscope'],
        procedure: 'Apply known ECG waveforms via simulator. Measure output signal and compare to input reference.',
        acceptanceCriteria: 'Signal accuracy within +/- 5% of reference at all standard gain settings',
        isoReferences: [{ standard: 'IEC 60601-2-47', clause: '201.12.1', description: 'Basic safety and essential performance' }],
      },
      {
        id: 'tm-2',
        testMethodId: 'TM-002',
        title: 'Power Consumption Test',
        description: 'Measure power consumption across operating modes.',
        type: 'Electrical',
        equipment: ['Keithley DMM7510 Multimeter'],
        procedure: 'Measure current draw in active, standby, and sleep modes under nominal supply voltage.',
        acceptanceCriteria: 'Active mode < 50mA, Standby < 5mA, Sleep < 100uA at 3.3V',
        isoReferences: [],
      },
      {
        id: 'tm-3',
        testMethodId: 'TM-003',
        title: 'EMC Pre-Compliance Screening',
        description: 'Conducted and radiated emissions pre-compliance screening.',
        type: 'EMC',
        equipment: ['Near-field probe set', 'Spectrum analyzer'],
        procedure: 'Perform conducted and radiated emissions screening per IEC 61000-4-3 methodology.',
        acceptanceCriteria: 'No emissions exceeding CISPR 11 Group 1 Class B limits with 6dB margin',
        environmentalConditions: '23C +/- 5C, 45-75% RH',
        isoReferences: [{ standard: 'IEC 60601-1-2', clause: '7', description: 'EMC requirements' }],
      },
    ],
    requirements: [
      {
        id: 'req-1',
        requirementId: 'REQ-101',
        description: 'ECG signal accuracy shall be within +/- 5% of reference standard',
        category: 'Performance',
        source: 'Product Requirements Document PRD-CM-001',
        acceptanceCriteria: '+/- 5% accuracy across all gain settings',
        verificationMethod: 'Test',
        isoReferences: [{ standard: 'ISO 13485', clause: '7.3.4', description: 'Design and development review' }],
      },
      {
        id: 'req-2',
        requirementId: 'REQ-102',
        description: 'Power consumption shall not exceed 50mA in active mode',
        category: 'Performance',
        source: 'System Requirements SRS-CM-001',
        acceptanceCriteria: '< 50mA active, < 5mA standby, < 100uA sleep',
        verificationMethod: 'Test',
        isoReferences: [],
      },
      {
        id: 'req-3',
        requirementId: 'REQ-201',
        description: 'Device shall comply with CISPR 11 Class B emissions limits',
        category: 'Regulatory',
        source: 'IEC 60601-1-2:2014',
        acceptanceCriteria: 'All emissions below Class B limits with 6dB margin',
        verificationMethod: 'Test',
        isoReferences: [{ standard: 'IEC 60601-1-2', clause: '7', description: 'EMC requirements' }],
      },
    ],
    testResults: [
      { id: 'tr-1', testMethodId: 'tm-1', requirementId: 'req-1', measuredValue: '3.2', unit: '% error', acceptanceCriteria: '+/- 5%', outcome: 'Pass', testedBy: 'Paul Moore', testedAt: new Date('2026-01-20'), notes: 'All gain settings tested. Max error observed at highest gain.' },
      { id: 'tr-2', testMethodId: 'tm-2', requirementId: 'req-2', measuredValue: '42', unit: 'mA', acceptanceCriteria: '< 50mA', outcome: 'Pass', testedBy: 'Paul Moore', testedAt: new Date('2026-01-21'), notes: 'Standby: 3.8mA, Sleep: 78uA. All within spec.' },
      { id: 'tr-3', testMethodId: 'tm-3', requirementId: 'req-3', measuredValue: 'See report', unit: 'dBuV/m', acceptanceCriteria: 'Class B with 6dB margin', outcome: 'Conditional Pass', testedBy: 'Paul Moore', testedAt: new Date('2026-01-22'), notes: 'Minor exceedance at 230MHz. Within Class B limits but margin reduced to 3dB. Design change recommended.' },
    ],
    overallConclusion: 'Conditional Pass',
    conclusionSummary: 'The sensor module meets primary performance requirements for signal accuracy and power consumption. EMC pre-compliance screening identified a minor margin reduction at 230MHz that should be addressed before DVT. Recommend adding ferrite bead on SPI clock line.',
    nonConformances: ['EMC margin reduction at 230MHz (3dB vs 6dB target)'],
    failures: [],
    designChangeRecommendations: ['Add ferrite bead (BLM18PG221SN1) on SPI clock line to address 230MHz emission', 'Consider shielding improvement on sensor flex cable'],
    discussionNotes: 'Overall positive results. The sensor module architecture is sound. Minor EMC issue is addressable with component-level changes that will not affect form factor or signal integrity.',
    linkedNCRs: [],
    linkedCAPAs: [],
    linkedChangeControls: [],
    linkedRiskAssessments: [],
    linkedDocuments: [],
    isoReferences: [
      { standard: 'ISO 13485', clause: '7.3.6', description: 'Design and development verification' },
      { standard: 'ISO 13485', clause: '7.3.7', description: 'Design and development validation' },
    ],
    auditTrail: [],
    submittedAt: new Date('2026-01-25'),
    approvedAt: new Date('2026-01-28'),
    approvedBy: 'Katie Emma',
  },
  {
    reportNumber: 'DVT-2026-001',
    title: 'Infusion Pump Housing Assembly - Design Validation',
    type: 'DVT',
    category: 'Validation',
    status: 'In Progress',
    version: '0.2',
    author: 'Paul Moore',
    reviewers: [],
    approvers: [],
    objective: 'Validate that the infusion pump housing assembly meets user needs for drop resistance, ingress protection, and ergonomic handling under simulated clinical use conditions.',
    deviceUnderTest: {
      name: 'Infusion Pump Housing Assembly',
      partNumber: 'IP-HOUS-100',
      revision: 'A',
      serialNumbers: ['PROTO-01', 'PROTO-02'],
      description: 'Injection-molded polycarbonate housing with IP54 sealing for portable infusion pump platform.',
    },
    testMethods: [
      {
        id: 'tm-4',
        testMethodId: 'TM-010',
        title: 'Drop Test',
        description: '1-meter drop test onto concrete surface from 6 orientations.',
        type: 'Mechanical',
        equipment: ['Drop test fixture', 'High-speed camera'],
        procedure: 'Drop unit from 1m height onto concrete surface. Test all 6 faces, 4 edges, 4 corners (14 drops total).',
        acceptanceCriteria: 'No cracking, no battery ejection, device powers on after all drops',
        isoReferences: [{ standard: 'IEC 60601-1', clause: '15.3.4', description: 'Mechanical strength' }],
      },
      {
        id: 'tm-5',
        testMethodId: 'TM-011',
        title: 'IP54 Ingress Protection Test',
        description: 'Dust and water splash resistance verification.',
        type: 'Environmental',
        equipment: ['IP test chamber', 'Dust chamber'],
        procedure: 'Per IEC 60529: Dust test (IP5X) followed by splash test (IPX4).',
        acceptanceCriteria: 'No dust ingress affecting operation; no water ingress to internal components',
        isoReferences: [{ standard: 'IEC 60529', clause: '14', description: 'Degrees of protection' }],
      },
    ],
    requirements: [
      {
        id: 'req-4',
        requirementId: 'REQ-301',
        description: 'Housing shall survive 1m drop to concrete without functional failure',
        category: 'Safety',
        source: 'User Needs Document UND-IP-001',
        acceptanceCriteria: 'No cracking, battery retention, powers on after drop',
        verificationMethod: 'Test',
        isoReferences: [{ standard: 'IEC 60601-1', clause: '15.3.4', description: 'Mechanical strength' }],
      },
      {
        id: 'req-5',
        requirementId: 'REQ-302',
        description: 'Housing shall provide IP54 protection rating',
        category: 'Environmental',
        source: 'User Needs Document UND-IP-001',
        acceptanceCriteria: 'Meets IEC 60529 IP54 requirements',
        verificationMethod: 'Test',
        isoReferences: [],
      },
    ],
    testResults: [
      { id: 'tr-4', testMethodId: 'tm-4', requirementId: 'req-4', measuredValue: 'See detailed report', unit: '', acceptanceCriteria: 'No functional failure', outcome: 'Pass', testedBy: 'Paul Moore', testedAt: new Date('2026-01-30'), notes: 'Minor cosmetic mark on corner drop #3. No functional impact.' },
      { id: 'tr-5', testMethodId: 'tm-5', requirementId: 'req-5', outcome: 'In Progress', acceptanceCriteria: 'IP54 per IEC 60529', testedBy: 'Paul Moore', testedAt: new Date('2026-02-01'), notes: 'Dust test complete (pass). Water splash test scheduled Feb 3.' },
    ],
    overallConclusion: 'In Progress',
    conclusionSummary: 'Drop testing complete with positive results. IP testing partially complete - awaiting water splash test results.',
    nonConformances: [],
    failures: [],
    designChangeRecommendations: [],
    discussionNotes: 'Drop test results are encouraging. Housing integrity maintained across all orientations. Awaiting completion of IP54 water splash testing.',
    linkedNCRs: [],
    linkedCAPAs: [],
    linkedChangeControls: [],
    linkedRiskAssessments: [],
    linkedDocuments: [],
    isoReferences: [
      { standard: 'ISO 13485', clause: '7.3.7', description: 'Design and development validation' },
    ],
    auditTrail: [],
  },
];

function getStatusColor(status: ValidationReportStatus): string {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-700';
    case 'In Progress': return 'bg-blue-100 text-blue-700';
    case 'Under Review': return 'bg-yellow-100 text-yellow-700';
    case 'Approved': return 'bg-green-100 text-green-700';
    case 'Rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getTypeColor(type: ValidationReportType): string {
  switch (type) {
    case 'EVT': return 'bg-purple-100 text-purple-700';
    case 'DVT': return 'bg-indigo-100 text-indigo-700';
    case 'PVT': return 'bg-teal-100 text-teal-700';
    case 'DVP&R': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getConclusionIcon(conclusion: string) {
  switch (conclusion) {
    case 'Pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'Fail': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'Conditional Pass': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case 'In Progress': return <Clock className="w-4 h-4 text-blue-600" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

export default function ValidationView() {
  const { validationReports, addValidationReport, updateValidationReport, getValidationStats } = useAppStore();
  const stats = getValidationStats();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ValidationReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ValidationReportStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ValidationReportType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ValidationCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sampleLoaded, setSampleLoaded] = useState(false);

  // Load sample data on first render if no reports exist
  if (!sampleLoaded && validationReports.length === 0) {
    SAMPLE_REPORTS.forEach((r) => addValidationReport(r));
    setSampleLoaded(true);
  }

  const filteredReports = validationReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.deviceUnderTest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  const handleViewReport = (report: ValidationReport) => {
    setSelectedReport(report);
    setShowViewerModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-primary-600" />
            Engineering Validation Reports
          </h2>
          <p className="text-gray-500 mt-1">EVT/DVT/PVT reports and DVP&R traceability management</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <p className="text-sm text-gray-500">Pass Rate</p>
          <p className="text-2xl font-bold text-primary-600">{stats.passRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {(['all', 'Verification', 'Validation'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              'px-4 py-2 text-sm rounded-lg transition-colors',
              categoryFilter === cat
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
            )}
          >
            {cat === 'all' ? 'All Reports' : cat}
            {cat === 'Verification' && (
              <span className="ml-2 text-xs text-gray-400">&quot;Did I build it right?&quot;</span>
            )}
            {cat === 'Validation' && (
              <span className="ml-2 text-xs text-gray-400">&quot;Did I build the right thing?&quot;</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'EVT', 'DVT', 'PVT', 'DVP&R'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-colors',
                typeFilter === type
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'Draft', 'In Progress', 'Under Review', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-colors',
                statusFilter === status
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Report List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg border border-surface-200 p-12 text-center">
            <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No validation reports found</p>
            <p className="text-sm text-gray-400 mt-1">Create a new report to get started</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isExpanded = expandedId === report.id;
            const passCount = report.testResults.filter((t) => t.outcome === 'Pass').length;
            const failCount = report.testResults.filter((t) => t.outcome === 'Fail').length;
            const conditionalCount = report.testResults.filter((t) => t.outcome === 'Conditional Pass').length;

            return (
              <div key={report.id} className="bg-white rounded-lg border border-surface-200 overflow-hidden">
                {/* Collapsed Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-50 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-gray-500">{report.reportNumber}</span>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getTypeColor(report.type))}>
                        {report.type}
                      </span>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', report.category === 'Verification' ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700')}>
                        {report.category}
                      </span>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(report.status))}>
                        {report.status}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{report.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">DUT: {report.deviceUnderTest.name} ({report.deviceUnderTest.partNumber} Rev {report.deviceUnderTest.revision})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getConclusionIcon(report.overallConclusion)}
                    <span className="text-sm font-medium text-gray-600">{report.overallConclusion}</span>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-surface-200 p-4 bg-surface-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Author</p>
                        <p className="font-medium">{report.author}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{formatDate(report.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Version</p>
                        <p className="font-medium">v{report.version}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Objective</p>
                      <p className="text-sm text-gray-600">{report.objective}</p>
                    </div>

                    {/* Test Results Summary */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Test Results Summary</p>
                      <div className="flex gap-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                          <CheckCircle className="w-3 h-3" /> Pass: {passCount}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                          <XCircle className="w-3 h-3" /> Fail: {failCount}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          <AlertTriangle className="w-3 h-3" /> Conditional: {conditionalCount}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          Total: {report.testResults.length}
                        </span>
                      </div>
                    </div>

                    {report.conclusionSummary && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Conclusion</p>
                        <p className="text-sm text-gray-600">{report.conclusionSummary}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-surface-200">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Full Report
                      </button>
                      {report.status === 'Draft' && (
                        <button
                          onClick={() => updateValidationReport(report.id, { status: 'In Progress' })}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Begin Testing
                        </button>
                      )}
                      {report.status === 'In Progress' && (
                        <button
                          onClick={() => updateValidationReport(report.id, { status: 'Under Review', submittedAt: new Date() })}
                          className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                        >
                          Submit for Review
                        </button>
                      )}
                      {report.status === 'Under Review' && (
                        <>
                          <button
                            onClick={() => updateValidationReport(report.id, { status: 'Approved', approvedAt: new Date(), approvedBy: 'Current User' })}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateValidationReport(report.id, { status: 'Rejected' })}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ISO Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">ISO 13485:2016 Reference</p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Clause 7.3.6</strong> &mdash; Design and development verification: Confirm design outputs meet design input requirements.<br />
              <strong>Clause 7.3.7</strong> &mdash; Design and development validation: Confirm the resulting product meets defined user needs and intended uses.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ValidationReportModal onClose={() => setShowCreateModal(false)} />
      )}
      {showViewerModal && selectedReport && (
        <ReportViewerModal
          report={selectedReport}
          isOpen={showViewerModal}
          onClose={() => { setShowViewerModal(false); setSelectedReport(null); }}
        />
      )}
    </div>
  );
}
