import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Truck,
  Award,
  MapPin,
  Phone,
  Mail,
  Globe,
  Package,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Supplier, SupplierCertification, SupplierRiskLevel, SupplierStatus } from '../../types';

interface AddSupplierModalProps {
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
}

interface CertEntry {
  type: string;
  certificationNumber: string;
  issuedDate: string;
  expiryDate: string;
  certifyingBody: string;
}

interface ProductEntry {
  name: string;
  partNumber: string;
  unitPrice: string;
}

interface IssueEntry {
  type: 'NCR' | 'SCAPA' | 'Complaint';
  description: string;
  date: string;
  status: 'Open' | 'Closed';
}

const CATEGORY_OPTIONS: Supplier['category'][] = [
  'Raw Material',
  'Component',
  'Service',
  'Contract Manufacturer',
  'Sterilization',
  'Calibration',
];

const VALID_CERT_TYPES = ['ISO 13485', 'ISO 9001', 'ISO 14001', 'AS9100', 'IATF 16949', 'Other'] as const;

function normalizeCertType(raw: string): SupplierCertification['type'] {
  if (raw.startsWith('ISO 13485')) return 'ISO 13485';
  if (raw.startsWith('ISO 9001')) return 'ISO 9001';
  if (raw.startsWith('ISO 14001')) return 'ISO 14001';
  if (raw === 'AS9100') return 'AS9100';
  if (raw === 'IATF 16949') return 'IATF 16949';
  const match = VALID_CERT_TYPES.find((t) => t === raw);
  return match ?? 'Other';
}

const CERT_TYPES = [
  'ISO 13485:2016',
  'ISO 9001:2015',
  'ISO 14971:2019',
  'IEC 62304',
  'ISO 11135',
  'ISO 11137',
  'ISO 17664',
  'ISO 15223',
  'ISO 11607',
  'ISO 14644',
  'ISO/IEC 17025',
  'FDA Registered',
  'CE Marked',
  'MDSAP',
  'IATF 16949',
  'AS9100',
];

const CERTIFYING_BODIES = [
  'BSI', 'TUV SUD', 'TUV Rheinland', 'SGS', 'Bureau Veritas',
  'DNV', 'Intertek', 'NSF International', 'UL', 'CSA Group',
  'DEKRA', 'NQA', 'Lloyds Register', 'Other',
];

export default function AddSupplierModal({ onClose, onSave }: AddSupplierModalProps) {
  const [activeSection, setActiveSection] = useState<'basic' | 'contact' | 'certifications' | 'products' | 'issues' | 'qualification'>('basic');

  // Basic Info
  const [name, setName] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [category, setCategory] = useState<Supplier['category']>('Component');
  const [riskLevel, setRiskLevel] = useState<SupplierRiskLevel>('Minor');
  const [status, setStatus] = useState<SupplierStatus>('Pending Audit');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  // Contact Info
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Certifications
  const [certifications, setCertifications] = useState<CertEntry[]>([]);

  // Products/Services
  const [products, setProducts] = useState<ProductEntry[]>([]);

  // Issues / History
  const [issues, setIssues] = useState<IssueEntry[]>([]);

  // Qualification
  const [qualificationDate, setQualificationDate] = useState('');
  const [nextAuditDue, setNextAuditDue] = useState('');
  const [performanceScore, setPerformanceScore] = useState('');
  const [criticality, setCriticality] = useState('');
  const [qualificationMethod, setQualificationMethod] = useState('Supplier Questionnaire');

  const addCertification = () => {
    setCertifications([...certifications, {
      type: 'ISO 13485:2016',
      certificationNumber: '',
      issuedDate: '',
      expiryDate: '',
      certifyingBody: 'BSI',
    }]);
  };

  const removeCertification = (i: number) => {
    setCertifications(certifications.filter((_, idx) => idx !== i));
  };

  const updateCert = (i: number, field: keyof CertEntry, value: string) => {
    setCertifications(certifications.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const addProduct = () => {
    setProducts([...products, { name: '', partNumber: '', unitPrice: '' }]);
  };

  const removeProduct = (i: number) => {
    setProducts(products.filter((_, idx) => idx !== i));
  };

  const updateProduct = (i: number, field: keyof ProductEntry, value: string) => {
    setProducts(products.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const addIssue = () => {
    setIssues([...issues, { type: 'NCR', description: '', date: '', status: 'Open' }]);
  };

  const removeIssue = (i: number) => {
    setIssues(issues.filter((_, idx) => idx !== i));
  };

  const updateIssue = (i: number, field: keyof IssueEntry, value: string) => {
    setIssues(issues.map((iss, idx) => idx === i ? { ...iss, [field]: value } : iss));
  };

  const handleSave = () => {
    if (!name || !supplierCode) return;

    const fullAddress = [address, city, state, postalCode, country].filter(Boolean).join(', ');

    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      supplierCode: supplierCode.toUpperCase(),
      name,
      category,
      riskLevel,
      status,
      qualificationDate: qualificationDate ? new Date(qualificationDate) : new Date(),
      lastAuditDate: undefined,
      nextAuditDue: nextAuditDue ? new Date(nextAuditDue) : undefined,
      certifications: certifications.map((c, idx) => ({
        id: `cert-${idx}`,
        type: normalizeCertType(c.type),
        certificationNumber: c.certificationNumber,
        issuedDate: c.issuedDate ? new Date(c.issuedDate) : new Date(),
        expiryDate: c.expiryDate ? new Date(c.expiryDate) : new Date(),
        certifyingBody: c.certifyingBody,
        status: c.expiryDate && new Date(c.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          ? (new Date(c.expiryDate) < new Date() ? 'Expired' : 'Expiring Soon')
          : 'Valid',
      })) satisfies SupplierCertification[],
      contactInfo: {
        address: fullAddress,
        contactName,
        email,
        phone,
      },
      products: products.map((p) => p.name).filter(Boolean),
      performanceScore: performanceScore ? parseInt(performanceScore) : undefined,
      openNCRs: issues.filter((i) => i.type === 'NCR' && i.status === 'Open').length,
      openSCAPAs: issues.filter((i) => i.type === 'SCAPA' && i.status === 'Open').length,
      createdAt: new Date(),
    };

    onSave(supplier);
    onClose();
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Truck },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'products', label: 'Products / Services', icon: Package },
    { id: 'issues', label: 'Issues & History', icon: AlertTriangle },
    { id: 'qualification', label: 'Qualification', icon: CheckCircle },
  ] as const;

  const isValid = name.trim() !== '' && supplierCode.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Supplier</h2>
              <p className="text-sm text-gray-500">ISO 13485:7.4.1 — Purchasing Process</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Section Nav */}
          <div className="w-48 border-r bg-surface-50 p-3 space-y-1 flex-shrink-0">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                    activeSection === s.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-surface-200'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info */}
            {activeSection === 'basic' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-900 text-lg">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      placeholder="e.g. MedPlastics Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={supplierCode}
                      onChange={(e) => setSupplierCode(e.target.value)}
                      className="input font-mono"
                      placeholder="e.g. SUP-004"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as Supplier['category'])} className="input">
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value as SupplierRiskLevel)}
                      className="input"
                    >
                      <option value="Critical">Critical</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {riskLevel === 'Critical' ? 'Annual audit required' :
                       riskLevel === 'Major' ? 'Biennial audit required' :
                       'Triennial audit or questionnaire'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SupplierStatus)}
                      className="input"
                    >
                      <option value="Pending Audit">Pending Audit</option>
                      <option value="Approved">Approved</option>
                      <option value="Conditional">Conditional</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="input pl-9"
                      placeholder="https://supplier.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Comments</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input min-h-[80px] resize-none"
                    placeholder="Additional information about this supplier..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>ISO 13485:7.4.1</strong> — Supplier risk classification must be documented.
                    Critical suppliers directly affect product safety and require the most stringent controls.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Info */}
            {activeSection === 'contact' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-900 text-lg">Contact Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-9"
                        placeholder="contact@supplier.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative max-w-sm">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input pl-9"
                      placeholder="+1-555-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input"
                    placeholder="123 Industrial Park Drive"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input"
                      placeholder="Chicago"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input"
                      placeholder="IL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="input"
                      placeholder="60601"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input max-w-sm"
                    placeholder="United States"
                  />
                </div>
              </div>
            )}

            {/* Certifications */}
            {activeSection === 'certifications' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-lg">Certifications & Accreditations</h3>
                  <button onClick={addCertification} className="btn-secondary btn-sm gap-2">
                    <Plus className="w-4 h-4" />
                    Add Certification
                  </button>
                </div>

                {certifications.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No certifications added yet.</p>
                    <p className="text-xs mt-1">Click "Add Certification" to record supplier certifications.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {certifications.map((cert, i) => (
                    <div key={i} className="border border-surface-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Certification {i + 1}</span>
                        <button onClick={() => removeCertification(i)} className="btn-ghost btn-sm p-1 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Standard / Type</label>
                          <select
                            value={cert.type}
                            onChange={(e) => updateCert(i, 'type', e.target.value)}
                            className="input text-sm"
                          >
                            {CERT_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Certificate Number</label>
                          <input
                            type="text"
                            value={cert.certificationNumber}
                            onChange={(e) => updateCert(i, 'certificationNumber', e.target.value)}
                            className="input text-sm font-mono"
                            placeholder="MD-2024-XXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Issue Date</label>
                          <input
                            type="date"
                            value={cert.issuedDate}
                            onChange={(e) => updateCert(i, 'issuedDate', e.target.value)}
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={cert.expiryDate}
                            onChange={(e) => updateCert(i, 'expiryDate', e.target.value)}
                            className="input text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Certifying Body</label>
                          <select
                            value={cert.certifyingBody}
                            onChange={(e) => updateCert(i, 'certifyingBody', e.target.value)}
                            className="input text-sm"
                          >
                            {CERTIFYING_BODIES.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>ISO 13485:7.4.1</strong> — Supplier certification status must be verified and maintained
                    in the Approved Supplier List. Certificates must be re-evaluated upon expiry.
                  </p>
                </div>
              </div>
            )}

            {/* Products / Services */}
            {activeSection === 'products' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-lg">Products & Services Supplied</h3>
                  <button onClick={addProduct} className="btn-secondary btn-sm gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                {products.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No products or services added yet.</p>
                    <p className="text-xs mt-1">Click "Add Product" to list what this supplier provides.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {products.map((product, i) => (
                    <div key={i} className="flex items-center gap-3 border border-surface-200 rounded-lg p-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Product / Service Name</label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateProduct(i, 'name', e.target.value)}
                            className="input text-sm"
                            placeholder="e.g. Housing Component"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Part / Item Number</label>
                          <input
                            type="text"
                            value={product.partNumber}
                            onChange={(e) => updateProduct(i, 'partNumber', e.target.value)}
                            className="input text-sm font-mono"
                            placeholder="PN-0001"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (USD)</label>
                          <input
                            type="number"
                            value={product.unitPrice}
                            onChange={(e) => updateProduct(i, 'unitPrice', e.target.value)}
                            className="input text-sm"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <button onClick={() => removeProduct(i)} className="btn-ghost btn-sm p-1 text-red-500 mt-4">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues & History */}
            {activeSection === 'issues' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Issues & Non-Conformance History</h3>
                    <p className="text-sm text-gray-500">Record any pre-existing NCRs, SCAPAs, or complaints</p>
                  </div>
                  <button onClick={addIssue} className="btn-secondary btn-sm gap-2">
                    <Plus className="w-4 h-4" />
                    Add Issue
                  </button>
                </div>

                {issues.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No issues recorded.</p>
                    <p className="text-xs mt-1">Document any known quality issues with this supplier.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {issues.map((issue, i) => (
                    <div key={i} className="border border-surface-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Issue {i + 1}</span>
                        <button onClick={() => removeIssue(i)} className="btn-ghost btn-sm p-1 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Issue Type</label>
                          <select
                            value={issue.type}
                            onChange={(e) => updateIssue(i, 'type', e.target.value)}
                            className="input text-sm"
                          >
                            <option value="NCR">NCR</option>
                            <option value="SCAPA">SCAPA</option>
                            <option value="Complaint">Complaint</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                          <input
                            type="date"
                            value={issue.date}
                            onChange={(e) => updateIssue(i, 'date', e.target.value)}
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                          <select
                            value={issue.status}
                            onChange={(e) => updateIssue(i, 'status', e.target.value)}
                            className="input text-sm"
                          >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                          <textarea
                            value={issue.description}
                            onChange={(e) => updateIssue(i, 'description', e.target.value)}
                            className="input text-sm resize-none"
                            rows={2}
                            placeholder="Describe the issue..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-700">
                    <strong>ISO 13485:7.4.1</strong> — Supplier performance history, including NCRs and SCAPAs,
                    must be considered in ongoing supplier evaluation and re-qualification decisions.
                  </p>
                </div>
              </div>
            )}

            {/* Qualification */}
            {activeSection === 'qualification' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-900 text-lg">Qualification & Audit Schedule</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification Date</label>
                    <input
                      type="date"
                      value={qualificationDate}
                      onChange={(e) => setQualificationDate(e.target.value)}
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Date supplier was officially qualified</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Audit Due</label>
                    <input
                      type="date"
                      value={nextAuditDue}
                      onChange={(e) => setNextAuditDue(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification Method</label>
                    <select
                      value={qualificationMethod}
                      onChange={(e) => setQualificationMethod(e.target.value)}
                      className="input"
                    >
                      <option>Supplier Questionnaire</option>
                      <option>On-site Audit</option>
                      <option>Desk Audit</option>
                      <option>Sample Evaluation</option>
                      <option>First Article Inspection</option>
                      <option>Certification Review Only</option>
                      <option>Historical Performance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Performance Score (%)</label>
                    <input
                      type="number"
                      value={performanceScore}
                      onChange={(e) => setPerformanceScore(e.target.value)}
                      className="input"
                      placeholder="e.g. 85"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Criticality Justification</label>
                  <textarea
                    value={criticality}
                    onChange={(e) => setCriticality(e.target.value)}
                    className="input resize-none"
                    rows={3}
                    placeholder="Explain why this supplier has been assigned the selected risk level..."
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Audit Frequency Guidelines</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs text-green-700">
                    <div className="bg-white rounded p-2">
                      <p className="font-semibold text-red-700">Critical Suppliers</p>
                      <p>Annual on-site audit required. Full QMS review.</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="font-semibold text-orange-700">Major Suppliers</p>
                      <p>Biennial audit or questionnaire + performance review.</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="font-semibold text-green-700">Minor Suppliers</p>
                      <p>Triennial questionnaire or certificate verification.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t flex-shrink-0 bg-surface-50">
          <div className="text-sm text-gray-500">
            {!isValid && <span className="text-red-500">* Supplier Name and Code are required</span>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={cn('btn-primary gap-2', !isValid && 'opacity-50 cursor-not-allowed')}
            >
              <CheckCircle className="w-4 h-4" />
              Add Supplier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
