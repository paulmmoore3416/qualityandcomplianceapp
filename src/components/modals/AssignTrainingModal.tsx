import { useState } from 'react';
import {
  X,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AssignTrainingModalProps {
  onClose: () => void;
  onSave: (assignment: TrainingAssignment) => void;
}

export interface TrainingAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  trainingId: string;
  trainingTitle: string;
  trainingType: string;
  format: string;
  trainer: string;
  requiredBy: string;
  startDate: string;
  passingScore: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  isoClause: string;
  notes: string;
  regulatoryRequirement: boolean;
}

const EMPLOYEES = [
  { id: 'EMP-001', name: 'Alice Johnson', department: 'Production', role: 'Line Operator' },
  { id: 'EMP-002', name: 'Bob Smith', department: 'Quality', role: 'QC Inspector' },
  { id: 'EMP-003', name: 'Carol Davis', department: 'Engineering', role: 'Design Engineer' },
  { id: 'EMP-004', name: 'David Lee', department: 'Production', role: 'Line Operator' },
  { id: 'EMP-005', name: 'Emma Wilson', department: 'Regulatory', role: 'Regulatory Affairs Specialist' },
  { id: 'EMP-006', name: 'Frank Brown', department: 'Supply Chain', role: 'Purchasing Manager' },
  { id: 'EMP-007', name: 'Grace Miller', department: 'Quality', role: 'Quality Manager' },
  { id: 'EMP-008', name: 'Henry Taylor', department: 'Manufacturing', role: 'Process Engineer' },
];

const TRAINING_COURSES = [
  {
    id: 'TRN-001',
    title: 'GMP Fundamentals',
    type: 'Regulatory',
    duration: '4 hours',
    passingScore: 80,
    isoClause: 'ISO 13485:6.2',
    format: 'E-Learning',
    description: 'Good Manufacturing Practice principles and requirements for medical device manufacturing',
    required: true,
  },
  {
    id: 'TRN-002',
    title: 'ISO 13485 Internal Auditor',
    type: 'Role-specific',
    duration: '2 days',
    passingScore: 85,
    isoClause: 'ISO 13485:8.2.4',
    format: 'Classroom',
    description: 'Comprehensive training for conducting internal QMS audits per ISO 13485',
    required: false,
  },
  {
    id: 'TRN-003',
    title: 'Risk Management (ISO 14971)',
    type: 'Regulatory',
    duration: '8 hours',
    passingScore: 80,
    isoClause: 'ISO 14971',
    format: 'Classroom',
    description: 'Risk management process for medical devices per ISO 14971:2019',
    required: true,
  },
  {
    id: 'TRN-004',
    title: 'Document Control Procedures',
    type: 'QMS',
    duration: '2 hours',
    passingScore: 75,
    isoClause: 'ISO 13485:4.2',
    format: 'E-Learning',
    description: 'Document management, control, and record keeping requirements',
    required: true,
  },
  {
    id: 'TRN-005',
    title: 'CAPA Process Training',
    type: 'QMS',
    duration: '3 hours',
    passingScore: 80,
    isoClause: 'ISO 13485:8.5.2',
    format: 'E-Learning',
    description: 'Corrective and preventive action identification, root cause analysis, and closure',
    required: true,
  },
  {
    id: 'TRN-006',
    title: 'Sterile Technique & Aseptic Processing',
    type: 'Role-specific',
    duration: '1 day',
    passingScore: 90,
    isoClause: 'ISO 13485:7.5.7',
    format: 'OJT',
    description: 'Aseptic technique, clean room behavior, and sterility assurance',
    required: false,
  },
  {
    id: 'TRN-007',
    title: 'Software Development Lifecycle (IEC 62304)',
    type: 'Role-specific',
    duration: '1 day',
    passingScore: 80,
    isoClause: 'IEC 62304',
    format: 'Classroom',
    description: 'Software development lifecycle requirements for medical device software',
    required: false,
  },
  {
    id: 'TRN-008',
    title: 'EU MDR Requirements Overview',
    type: 'Regulatory',
    duration: '4 hours',
    passingScore: 75,
    isoClause: 'EU MDR 2017/745',
    format: 'E-Learning',
    description: 'Overview of EU Medical Device Regulation requirements, UDI, clinical evaluation',
    required: false,
  },
  {
    id: 'TRN-009',
    title: 'Complaint Handling & Vigilance',
    type: 'Regulatory',
    duration: '2 hours',
    passingScore: 80,
    isoClause: 'ISO 13485:8.2.2',
    format: 'E-Learning',
    description: 'Customer complaint intake, investigation, MDR/EUDAMED reporting obligations',
    required: false,
  },
  {
    id: 'TRN-010',
    title: 'Sterilization Validation (ISO 11135/11137)',
    type: 'Role-specific',
    duration: '2 days',
    passingScore: 85,
    isoClause: 'ISO 11135 / ISO 11137',
    format: 'Classroom',
    description: 'EO and radiation sterilization validation, routine monitoring, and process control',
    required: false,
  },
  {
    id: 'TRN-011',
    title: 'Labeling Requirements (ISO 15223)',
    type: 'Regulatory',
    duration: '3 hours',
    passingScore: 80,
    isoClause: 'ISO 15223',
    format: 'E-Learning',
    description: 'Medical device symbols, labeling requirements, UDI, and IVD labeling',
    required: false,
  },
  {
    id: 'TRN-012',
    title: 'Reprocessing & Cleaning Validation (ISO 17664)',
    type: 'Role-specific',
    duration: '1 day',
    passingScore: 85,
    isoClause: 'ISO 17664',
    format: 'Classroom',
    description: 'Cleaning, disinfection, and sterilization of reusable medical devices',
    required: false,
  },
  {
    id: 'TRN-013',
    title: 'Change Control Procedures',
    type: 'QMS',
    duration: '2 hours',
    passingScore: 75,
    isoClause: 'ISO 13485:7.3.9',
    format: 'E-Learning',
    description: 'Design and process change management, impact assessment, 21 CFR Part 11 compliance',
    required: false,
  },
  {
    id: 'TRN-014',
    title: 'Supplier Quality Management',
    type: 'QMS',
    duration: '3 hours',
    passingScore: 80,
    isoClause: 'ISO 13485:7.4',
    format: 'E-Learning',
    description: 'Supplier evaluation, qualification, monitoring, and SCAPA management',
    required: false,
  },
];

const TRAINERS = [
  'Sarah Johnson (QA Manager)',
  'Michael Chen (Senior Engineer)',
  'Lisa Anderson (Regulatory Affairs)',
  'Tom Richardson (Training Coordinator)',
  'External Trainer / Third Party',
];

const FORMATS = ['E-Learning', 'Classroom', 'OJT (On-the-Job Training)', 'Webinar', 'Blended', 'Self-Study'];

export default function AssignTrainingModal({ onClose, onSave }: AssignTrainingModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [trainer, setTrainer] = useState(TRAINERS[0]);
  const [format, setFormat] = useState('');
  const [requiredBy, setRequiredBy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [priority, setPriority] = useState<TrainingAssignment['priority']>('Medium');
  const [notes, setNotes] = useState('');
  const [regulatoryRequirement, setRegulatoryRequirement] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchCourse, setSearchCourse] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const employee = EMPLOYEES.find((e) => e.id === selectedEmployee);
  const course = TRAINING_COURSES.find((c) => c.id === selectedCourse);

  const filteredCourses = TRAINING_COURSES.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.description.toLowerCase().includes(searchCourse.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const courseTypes = [...new Set(TRAINING_COURSES.map((c) => c.type))];

  const toggleEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((e) => e !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const handleSave = () => {
    if (!course) return;
    const targets = multiSelect ? selectedEmployees : (selectedEmployee ? [selectedEmployee] : []);
    if (targets.length === 0) return;

    targets.forEach((empId) => {
      const emp = EMPLOYEES.find((e) => e.id === empId);
      if (!emp) return;
      onSave({
        id: `assign-${Date.now()}-${empId}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        role: emp.role,
        trainingId: course.id,
        trainingTitle: course.title,
        trainingType: course.type,
        format: format || course.format,
        trainer,
        requiredBy,
        startDate,
        passingScore: course.passingScore,
        priority,
        isoClause: course.isoClause,
        notes,
        regulatoryRequirement,
      });
    });

    onClose();
  };

  const isValid = course !== undefined && (multiSelect ? selectedEmployees.length > 0 : selectedEmployee !== '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Training</h2>
              <p className="text-sm text-gray-500">ISO 13485:6.2 — Human Resources & Competency</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Assignment Mode */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Assign to:</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setMultiSelect(false); setSelectedEmployees([]); }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  !multiSelect ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
                )}
              >
                Single Employee
              </button>
              <button
                onClick={() => { setMultiSelect(true); setSelectedEmployee(''); }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  multiSelect ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
                )}
              >
                Multiple Employees
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Employee Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {multiSelect ? 'Select Employees' : 'Select Employee'}
              </h3>

              {!multiSelect ? (
                <div>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="input"
                  >
                    <option value="">-- Select Employee --</option>
                    {EMPLOYEES.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                  {employee && (
                    <div className="mt-3 p-3 bg-surface-50 rounded-lg text-sm">
                      <p><span className="font-medium">Employee ID:</span> {employee.id}</p>
                      <p><span className="font-medium">Department:</span> {employee.department}</p>
                      <p><span className="font-medium">Role:</span> {employee.role}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-surface-200 rounded-lg overflow-hidden">
                  {EMPLOYEES.map((emp) => (
                    <label
                      key={emp.id}
                      className={cn(
                        'flex items-center gap-3 p-3 cursor-pointer hover:bg-surface-50 border-b last:border-b-0',
                        selectedEmployees.includes(emp.id) && 'bg-primary-50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 rounded text-primary-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.role} • {emp.department}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Schedule */}
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 pt-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={requiredBy}
                    onChange={(e) => setRequiredBy(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="flex gap-2 flex-wrap">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                        priority === p
                          ? p === 'Critical' ? 'bg-red-100 text-red-700 border-red-300'
                            : p === 'High' ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : p === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-white text-gray-600 border-surface-200 hover:bg-surface-50'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="input">
                  <option value="">Use course default</option>
                  {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Trainer / Instructor</label>
                <select value={trainer} onChange={(e) => setTrainer(e.target.value)} className="input">
                  {TRAINERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={regulatoryRequirement}
                    onChange={(e) => setRegulatoryRequirement(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Regulatory / Compliance Requirement</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Mark if this training is mandated by a regulatory body or standard</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="Additional instructions, prerequisites, or context..."
                />
              </div>
            </div>

            {/* Right: Course Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Select Training Course
              </h3>

              {/* Course Search & Filter */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={searchCourse}
                  onChange={(e) => setSearchCourse(e.target.value)}
                  className="input text-sm"
                  placeholder="Search courses..."
                />
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors',
                      typeFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
                    )}
                  >
                    All
                  </button>
                  {courseTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium transition-colors',
                        typeFilter === t ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-surface-200 rounded-lg overflow-hidden max-h-[460px] overflow-y-auto">
                {filteredCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCourse(c.id);
                      if (!format) setFormat(c.format);
                    }}
                    className={cn(
                      'w-full text-left p-3 border-b last:border-b-0 hover:bg-surface-50 transition-colors',
                      selectedCourse === c.id && 'bg-primary-50 border-l-4 border-l-primary-500'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">{c.title}</p>
                          {c.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {c.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Pass: {c.passingScore}%
                          </span>
                          <span className="bg-surface-100 px-1.5 py-0.5 rounded">{c.type}</span>
                        </div>
                        <p className="text-xs text-primary-600 mt-1">{c.isoClause}</p>
                      </div>
                      {selectedCourse === c.id && (
                        <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Course Summary */}
              {course && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Selected: {course.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                    <span><strong>Duration:</strong> {course.duration}</span>
                    <span><strong>Format:</strong> {format || course.format}</span>
                    <span><strong>Passing Score:</strong> {course.passingScore}%</span>
                    <span><strong>ISO Clause:</strong> {course.isoClause}</span>
                  </div>
                </div>
              )}

              {/* Compliance Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  Audit Readiness
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Training records must include evidence of effectiveness (ISO 13485:6.2)</li>
                  <li>Completed records require verifier signature</li>
                  <li>Records retained per document retention policy</li>
                  <li>Overdue trainings generate CAPA recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t flex-shrink-0 bg-surface-50">
          <div className="text-sm text-gray-500">
            {!isValid && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Select an employee and training course to continue
              </span>
            )}
            {isValid && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Ready to assign {multiSelect ? `${selectedEmployees.length} employee(s)` : employee?.name}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={cn('btn-primary gap-2', !isValid && 'opacity-50 cursor-not-allowed')}
            >
              <GraduationCap className="w-4 h-4" />
              Assign Training
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
