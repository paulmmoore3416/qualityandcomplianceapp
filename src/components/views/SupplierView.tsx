import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Truck,
  CheckCircle,
  Eye,
  FileCheck,
  AlertTriangle,
  Calendar,
  MapPin,
  Award,
  TrendingUp,
  Activity,
  Settings,
  Edit,
  Archive,
} from 'lucide-react';
import { cn, formatDate, daysUntil } from '../../lib/utils';
import { Supplier, SupplierRiskLevel, SupplierStatus } from '../../types';

// Sample data
const sampleSuppliers: Supplier[] = [
  {
    id: '1',
    supplierCode: 'SUP-001',
    name: 'MedPlastics Inc.',
    category: 'Raw Material',
    riskLevel: 'Critical',
    status: 'Approved',
    qualificationDate: new Date('2024-03-15'),
    lastAuditDate: new Date('2025-09-20'),
    nextAuditDue: new Date('2026-09-20'),
    certifications: [
      {
        id: '1',
        type: 'ISO 13485',
        certificationNumber: 'MD-2024-5678',
        issuedDate: new Date('2024-01-15'),
        expiryDate: new Date('2027-01-15'),
        certifyingBody: 'BSI',
        status: 'Valid',
      },
    ],
    contactInfo: {
      address: '123 Industrial Park, Chicago, IL',
      contactName: 'John Smith',
      email: 'jsmith@medplastics.com',
      phone: '+1-555-0123',
    },
    products: ['Housing Component', 'Seal Rings'],
    performanceScore: 94,
    openNCRs: 1,
    openSCAPAs: 0,
    createdAt: new Date('2024-03-15'),
  },
  {
    id: '2',
    supplierCode: 'SUP-002',
    name: 'SterilTech Solutions',
    category: 'Sterilization',
    riskLevel: 'Critical',
    status: 'Approved',
    qualificationDate: new Date('2023-06-01'),
    lastAuditDate: new Date('2025-06-15'),
    nextAuditDue: new Date('2026-06-15'),
    certifications: [
      {
        id: '2',
        type: 'ISO 13485',
        certificationNumber: 'MD-2023-1234',
        issuedDate: new Date('2023-05-01'),
        expiryDate: new Date('2026-05-01'),
        certifyingBody: 'TUV SUD',
        status: 'Expiring Soon',
      },
    ],
    contactInfo: {
      address: '456 Sterile Way, Austin, TX',
      contactName: 'Sarah Johnson',
      email: 'sjohnson@steriltech.com',
      phone: '+1-555-0456',
    },
    products: ['EO Sterilization Services'],
    performanceScore: 98,
    openNCRs: 0,
    openSCAPAs: 0,
    createdAt: new Date('2023-06-01'),
  },
  {
    id: '3',
    supplierCode: 'SUP-003',
    name: 'PackRight Medical',
    category: 'Component',
    riskLevel: 'Major',
    status: 'Conditional',
    qualificationDate: new Date('2025-01-10'),
    lastAuditDate: new Date('2025-01-10'),
    nextAuditDue: new Date('2026-01-10'),
    certifications: [],
    contactInfo: {
      address: '789 Packaging Blvd, Phoenix, AZ',
      contactName: 'Mike Davis',
      email: 'mdavis@packright.com',
      phone: '+1-555-0789',
    },
    products: ['Sterile Pouches', 'Labels'],
    performanceScore: 78,
    openNCRs: 3,
    openSCAPAs: 2,
    createdAt: new Date('2025-01-10'),
  },
];

export default function SupplierView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<SupplierRiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | 'all'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSupplier, setAuditSupplier] = useState<Supplier | null>(null);

  const suppliers = sampleSuppliers;

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || s.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: suppliers.length,
    critical: suppliers.filter((s) => s.riskLevel === 'Critical').length,
    pendingAudit: suppliers.filter((s) => s.nextAuditDue && daysUntil(s.nextAuditDue) <= 90).length,
    expiringCerts: suppliers.flatMap((s) => s.certifications).filter((c) => c.status === 'Expiring Soon').length,
    openSCAPAs: suppliers.reduce((sum, s) => sum + s.openSCAPAs, 0),
    avgPerformance: Math.round(suppliers.reduce((sum, s) => sum + (s.performanceScore || 0), 0) / suppliers.length),
  };

  const getRiskColor = (risk: SupplierRiskLevel) => {
    switch (risk) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Major': return 'bg-orange-100 text-orange-700';
      case 'Minor': return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (status: SupplierStatus) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Conditional': return 'bg-yellow-100 text-yellow-700';
      case 'Pending Audit': return 'bg-blue-100 text-blue-700';
      case 'On Hold': return 'bg-orange-100 text-orange-700';
      case 'Disqualified': return 'bg-red-100 text-red-700';
    }
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleAuditSupplier = (supplier: Supplier) => {
    setAuditSupplier(supplier);
    setShowAuditModal(true);
  };

  const handleCloseModals = () => {
    setShowSupplierModal(false);
    setShowAuditModal(false);
    setSelectedSupplier(null);
    setAuditSupplier(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Supplier Quality Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Per ISO 13485:7.4 - Purchasing & Supplier Controls
          </p>
        </div>
        <button className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Suppliers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Critical Suppliers</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className={cn('card', stats.pendingAudit > 0 && 'border-yellow-300 bg-yellow-50')}>
          <p className="text-sm text-gray-500">Audits Due (90d)</p>
          <p className={cn('text-2xl font-bold', stats.pendingAudit > 0 ? 'text-yellow-600' : 'text-gray-900')}>
            {stats.pendingAudit}
          </p>
        </div>
        <div className={cn('card', stats.expiringCerts > 0 && 'border-orange-300 bg-orange-50')}>
          <p className="text-sm text-gray-500">Expiring Certs</p>
          <p className={cn('text-2xl font-bold', stats.expiringCerts > 0 ? 'text-orange-600' : 'text-gray-900')}>
            {stats.expiringCerts}
          </p>
        </div>
        <div className={cn('card', stats.openSCAPAs > 0 && 'border-red-300 bg-red-50')}>
          <p className="text-sm text-gray-500">Open SCAPAs</p>
          <p className={cn('text-2xl font-bold', stats.openSCAPAs > 0 ? 'text-red-600' : 'text-gray-900')}>
            {stats.openSCAPAs}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Avg Performance</p>
          <p className={cn(
            'text-2xl font-bold',
            stats.avgPerformance >= 90 ? 'text-green-600' : stats.avgPerformance >= 70 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {stats.avgPerformance}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Risk:</span>
          {(['all', 'Critical', 'Major', 'Minor'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                riskFilter === risk
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {risk === 'all' ? 'All' : risk}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          {(['all', 'Approved', 'Conditional', 'On Hold'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
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

      {/* Approved Supplier List (ASL) */}
      <div className="card p-0">
        <div className="p-4 border-b border-surface-200">
          <h3 className="font-semibold text-gray-900">Approved Supplier List (ASL)</h3>
          <p className="text-sm text-gray-500">Per ISO 13485:7.4.1 - Purchasing Process</p>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Category</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Performance</th>
                <th>Certifications</th>
                <th>Next Audit</th>
                <th>Issues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <button
                          onClick={() => handleViewSupplier(supplier)}
                          className="text-left hover:text-primary-600 transition-colors"
                        >
                          <p className="font-medium text-gray-900 hover:text-primary-600">{supplier.name}</p>
                        </button>
                        <p className="text-xs text-gray-500">{supplier.supplierCode}</p>
                      </div>
                    </div>
                  </td>
                  <td>{supplier.category}</td>
                  <td>
                    <span className={cn('badge', getRiskColor(supplier.riskLevel))}>
                      {supplier.riskLevel}
                    </span>
                  </td>
                  <td>
                    <span className={cn('badge', getStatusColor(supplier.status))}>
                      {supplier.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            (supplier.performanceScore || 0) >= 90
                              ? 'bg-green-500'
                              : (supplier.performanceScore || 0) >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${supplier.performanceScore || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{supplier.performanceScore}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {supplier.certifications.length > 0 ? (
                        supplier.certifications.map((cert) => (
                          <span
                            key={cert.id}
                            className={cn(
                              'badge text-xs',
                              cert.status === 'Valid' ? 'badge-green' : cert.status === 'Expiring Soon' ? 'badge-yellow' : 'badge-red'
                            )}
                            title={`Expires: ${formatDate(cert.expiryDate)}`}
                          >
                            {cert.type}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {supplier.nextAuditDue && (
                      <span className={cn(
                        'text-sm',
                        daysUntil(supplier.nextAuditDue) <= 30 ? 'text-red-600 font-medium' :
                        daysUntil(supplier.nextAuditDue) <= 90 ? 'text-yellow-600' : 'text-gray-600'
                      )}>
                        {formatDate(supplier.nextAuditDue)}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {supplier.openNCRs > 0 && (
                        <span className="badge badge-red text-xs">{supplier.openNCRs} NCR</span>
                      )}
                      {supplier.openSCAPAs > 0 && (
                        <span className="badge badge-red text-xs">{supplier.openSCAPAs} SCAPA</span>
                      )}
                      {supplier.openNCRs === 0 && supplier.openSCAPAs === 0 && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewSupplier(supplier)}
                        className="btn-ghost btn-sm text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => handleAuditSupplier(supplier)}
                        className="btn-ghost btn-sm text-xs flex items-center gap-1"
                      >
                        <FileCheck className="w-3 h-3" />
                        Audit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Details Modal */}
      {showSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedSupplier.name}</h2>
                  <p className="text-sm text-gray-500">{selectedSupplier.supplierCode}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModals}
                className="btn-ghost btn-sm p-2"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Risk Overview */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <div className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getRiskColor(selectedSupplier.riskLevel))}>
                    {selectedSupplier.riskLevel}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Risk Level</p>
                </div>
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <div className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusColor(selectedSupplier.status))}>
                    {selectedSupplier.status}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Status</p>
                </div>
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedSupplier.performanceScore}%</div>
                  <p className="text-xs text-gray-500 mt-1">Performance</p>
                </div>
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{selectedSupplier.openNCRs + selectedSupplier.openSCAPAs}</div>
                  <p className="text-xs text-gray-500 mt-1">Open Issues</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Address:</span> {selectedSupplier.contactInfo.address}</p>
                    <p><span className="font-medium">Contact:</span> {selectedSupplier.contactInfo.contactName}</p>
                    <p><span className="font-medium">Email:</span> <a href={`mailto:${selectedSupplier.contactInfo.email}`} className="text-primary-600 hover:underline">{selectedSupplier.contactInfo.email}</a></p>
                    <p><span className="font-medium">Phone:</span> <a href={`tel:${selectedSupplier.contactInfo.phone}`} className="text-primary-600 hover:underline">{selectedSupplier.contactInfo.phone}</a></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {selectedSupplier.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-2 bg-surface-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{cert.type}</p>
                          <p className="text-xs text-gray-500">#{cert.certificationNumber} • {cert.certifyingBody}</p>
                        </div>
                        <div className={cn('px-2 py-1 rounded text-xs font-medium',
                          cert.status === 'Valid' ? 'bg-green-100 text-green-700' :
                          cert.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        )}>
                          {cert.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products and Recent Activity */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Supplied Products</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSupplier.products.map((product, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Last audit: {selectedSupplier.lastAuditDate ? formatDate(selectedSupplier.lastAuditDate) : 'Never audited'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span>Performance score: {selectedSupplier.performanceScore}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Open issues: {selectedSupplier.openNCRs} NCRs, {selectedSupplier.openSCAPAs} SCAPAs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administration Tools */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Administration Tools
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleAuditSupplier(selectedSupplier)}
                    className="btn-outline btn-sm flex items-center justify-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    Schedule Audit
                  </button>
                  <button className="btn-outline btn-sm flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="btn-outline btn-sm flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Report
                  </button>
                  <button className="btn-outline btn-sm flex items-center justify-center gap-2">
                    <Archive className="w-4 h-4" />
                    Archive Records
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {showAuditModal && auditSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Schedule Audit</h2>
                <p className="text-sm text-gray-500">{auditSupplier.name} ({auditSupplier.supplierCode})</p>
              </div>
              <button
                onClick={handleCloseModals}
                className="btn-ghost btn-sm p-2"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audit Type</label>
                  <select className="input">
                    <option>Supplier Qualification</option>
                    <option>Annual Surveillance</option>
                    <option>Special Audit</option>
                    <option>Requalification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audit Scope</label>
                  <select className="input">
                    <option>Full QMS</option>
                    <option>Product Specific</option>
                    <option>Process Specific</option>
                    <option>Certification Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <input type="date" className="input" defaultValue={auditSupplier.nextAuditDue?.toISOString().split('T')[0]} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audit Team</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="lead" className="rounded" />
                    <label htmlFor="lead" className="text-sm">Lead Auditor: Sarah Johnson</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="tech" className="rounded" />
                    <label htmlFor="tech" className="text-sm">Technical Specialist: Mike Chen</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="observer" className="rounded" />
                    <label htmlFor="observer" className="text-sm">Observer: Lisa Anderson</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audit Checklist</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="qms" className="rounded" />
                    <label htmlFor="qms" className="text-sm">QMS Documentation Review</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="process" className="rounded" />
                    <label htmlFor="process" className="text-sm">Manufacturing Process Audit</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="quality" className="rounded" />
                    <label htmlFor="quality" className="text-sm">Quality Control Systems</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="training" className="rounded" />
                    <label htmlFor="training" className="text-sm">Personnel Training Records</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button className="btn-primary flex-1">Schedule Audit</button>
                <button onClick={handleCloseModals} className="btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISO Reference */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2">ISO 13485:2016 - Clause 7.4 Purchasing</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-primary-800">7.4.1 Purchasing Process</p>
            <p className="text-primary-600">Supplier evaluation and selection based on quality criteria</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">7.4.2 Purchasing Information</p>
            <p className="text-primary-600">Clear specifications and QMS requirements</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">7.4.3 Verification</p>
            <p className="text-primary-600">Inspection of purchased product</p>
          </div>
        </div>
      </div>
    </div>
  );
}
