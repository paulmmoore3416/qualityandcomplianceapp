# Regulatory Classification Guide: QMS Tool vs. Software as a Medical Device (SaMD)

**Document ID:** REG-CLASS-001
**Version:** 1.0
**Effective Date:** February 2, 2026
**Prepared By:** MedTech Compliance Solutions LLC

---

## Purpose

This document provides guidance on how MedTech Compliance Suite is classified under FDA regulations and helps customers understand the distinction between a Quality Management System (QMS) tool and Software as a Medical Device (SaMD).

---

## Classification: QMS Software Tool (Not a Medical Device)

### MedTech Compliance Suite Is a QMS Tool

MedTech Compliance Suite is classified as **quality management system software** used to support business and quality operations. It is **not a medical device** and does **not** require FDA clearance (510(k), De Novo, or PMA).

### Rationale

MedTech Compliance Suite:

- **Tracks** sales, complaints, manufacturing data, and quality records
- **Manages** documents, CAPA, NCR, change controls, and training
- **Reports** on compliance metrics and quality system KPIs
- **Does not** diagnose patients
- **Does not** provide clinical treatment recommendations
- **Does not** analyze data to provide medical insights that drive clinical decisions
- **Does not** acquire, process, or analyze medical images or signals
- **Does not** connect to or control medical devices

### FDA Guidance References

Per FDA's guidance on "Clinical Decision Support Software" (September 2022) and the 21st Century Cures Act, software functions that are **not** medical devices include:

- Administrative support for healthcare facilities
- Maintaining or encouraging a healthy lifestyle (unrelated to disease)
- Electronic patient records (when not used for clinical decision making)
- **Quality management and compliance tracking tools** that support manufacturing operations

### What This Means for Customers

1. **No 510(k) required** for using MedTech Compliance Suite
2. **No device registration** with the FDA
3. **No UDI labeling** requirements
4. **Focus compliance efforts** on:
   - 21 CFR Part 11 (electronic records and signatures)
   - Software validation per GAMP 5 / FDA computer system validation guidance
   - Quality system documentation per ISO 13485:2016

---

## When Would Software Be SaMD?

### Definition of SaMD

Per IMDRF (International Medical Device Regulators Forum):

> "Software as a Medical Device (SaMD) is defined as software intended to be used for one or more medical purposes that perform these purposes without being part of a hardware medical device."

### SaMD Characteristics

Software **would** be classified as SaMD if it:

- Analyzes patient data to provide diagnostic recommendations
- Processes medical images for clinical interpretation
- Calculates drug dosages based on patient parameters
- Monitors physiological signals and triggers clinical alerts
- Provides treatment planning or clinical decision support that is **not** intended to be independently reviewed by a qualified clinician

### SaMD Classification and Regulatory Path

If software meets the SaMD definition:

| Risk Category | FDA Classification | Regulatory Pathway |
|--------------|-------------------|-------------------|
| Low risk (Category I) | Class I | General Controls / 510(k) exempt |
| Moderate risk (Category II) | Class II | 510(k) Premarket Notification |
| High risk (Category III) | Class II/III | De Novo or PMA |
| Highest risk (Category IV) | Class III | PMA |

### MedTech Compliance Suite Does NOT Meet SaMD Criteria

Our software is exclusively a quality system management tool. No component analyzes clinical or patient data for diagnostic, therapeutic, or monitoring purposes.

---

## Applicable Compliance Requirements

### For MedTech Compliance Suite (QMS Tool)

| Requirement | Applicability | Notes |
|-------------|--------------|-------|
| FDA 510(k) | Not Required | QMS tool, not a medical device |
| FDA Registration | Not Required | Not a device manufacturer for this product |
| 21 CFR Part 11 | **Required** (for customers) | Electronic records and signatures |
| Software Validation | **Required** (for customers) | Per GAMP 5 / FDA guidance |
| ISO 13485:2016 Clause 4.1.6 | **Required** (for customers) | QMS software validation |
| HIPAA (if PHI handled) | Conditional | Only if storing Protected Health Information |
| SOC 2 | Recommended | For enterprise customer trust |
| ISO 27001 | Recommended | Information security management |

### Customer Obligations

When using MedTech Compliance Suite within their quality system, customers must:

1. **Validate the software** prior to use (IQ/OQ/PQ - see Validation Kit)
2. **Maintain Part 11 compliance** for electronic records created in the system
3. **Control access** through role-based permissions appropriate to their organization
4. **Include in internal audits** as part of quality system monitoring
5. **Manage changes** to software configuration through change control procedures

---

## HIPAA Considerations

### When HIPAA Applies

If MedTech Compliance Suite is configured to store any Protected Health Information (PHI), the following applies:

- **Business Associate Agreement (BAA)** must be executed between customer and MedTech Compliance Solutions LLC
- **Technical safeguards** must be implemented per HIPAA Security Rule
- **Access controls** must limit PHI access to authorized personnel
- **Audit trails** must track all PHI access and modifications

### Default Configuration

By default, MedTech Compliance Suite is designed for quality system management and **does not require or store PHI**. Complaint records and adverse event reports should use de-identified data where possible.

---

## Vendor Audit Readiness

### For Enterprise Customers Auditing MedTech Compliance Solutions LLC

We are prepared to support customer vendor audits with:

1. **Security Whitepaper** detailing:
   - Data encryption (at rest and in transit)
   - Access control architecture
   - Backup and disaster recovery procedures
   - Incident response plan

2. **Quality System Documentation**:
   - Software development lifecycle procedures
   - Change management and release procedures
   - Testing and quality assurance practices
   - Configuration management

3. **Compliance Certifications** (planned):
   - SOC 2 Type II
   - ISO 27001 (information security)

4. **Validation Support**:
   - Pre-built IQ/OQ/PQ validation kit
   - Release notes with change documentation
   - Known issues and workarounds log

---

## Terms of Service - Liability Limitation

### Important Disclaimer

MedTech Compliance Suite is a tool that **supports** compliance activities. It does **not guarantee** regulatory compliance.

- **Customer responsibility**: Achieving and maintaining compliance with FDA, ISO, and other applicable regulations remains the customer's responsibility
- **No regulatory advice**: The software and its documentation do not constitute legal or regulatory advice
- **Professional guidance**: Customers should engage qualified regulatory affairs professionals for compliance determinations
- **Shared responsibility**: MedTech Compliance Solutions LLC provides the tools; customers provide the quality system governance

---

*This classification assessment is based on current FDA guidance and regulations as of February 2, 2026. Regulatory requirements may change. Customers should independently verify applicable requirements for their specific use case.*

*Copyright 2026 MedTech Compliance Solutions LLC. All rights reserved.*
