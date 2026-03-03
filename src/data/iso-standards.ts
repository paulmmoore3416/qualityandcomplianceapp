import { ISOMapping } from '../types';

// Comprehensive ISO Standards for Medical Device Manufacturing
export const ISO_STANDARDS = {
  // Quality Management System
  'ISO 13485:2016': {
    name: 'ISO 13485:2016',
    fullName: 'Medical devices — Quality management systems — Requirements for regulatory purposes',
    description: 'Specifies requirements for a quality management system where an organization needs to demonstrate its ability to provide medical devices and related services that consistently meet customer and applicable regulatory requirements.',
    clauses: {
      '4.1': 'Quality management system - General requirements',
      '4.2': 'Quality management system - Documentation requirements',
      '5.1': 'Management commitment',
      '5.2': 'Customer focus',
      '5.3': 'Quality policy',
      '5.4': 'Planning',
      '5.5': 'Responsibility, authority and communication',
      '5.6': 'Management review',
      '6.1': 'Provision of resources',
      '6.2': 'Human resources',
      '6.3': 'Infrastructure',
      '6.4': 'Work environment and contamination control',
      '7.1': 'Planning of product realization',
      '7.2': 'Customer-related processes',
      '7.3': 'Design and development',
      '7.4': 'Purchasing',
      '7.5': 'Production and service provision',
      '7.5.1': 'Control of production and service provision',
      '7.5.2': 'Cleanliness of product',
      '7.5.3': 'Installation activities',
      '7.5.4': 'Servicing activities',
      '7.5.5': 'Particular requirements for sterile medical devices',
      '7.5.6': 'Validation of processes for production and service provision',
      '7.5.7': 'Particular requirements for validation of processes for sterilization and sterile barrier systems',
      '7.5.8': 'Identification',
      '7.5.9': 'Traceability',
      '7.5.10': 'Customer property',
      '7.5.11': 'Preservation of product',
      '7.6': 'Control of monitoring and measuring equipment',
      '8.1': 'General (Measurement, analysis and improvement)',
      '8.2': 'Monitoring and measurement',
      '8.2.1': 'Feedback',
      '8.2.2': 'Complaint handling',
      '8.2.3': 'Reporting to regulatory authorities',
      '8.2.4': 'Internal audit',
      '8.2.5': 'Monitoring and measurement of processes',
      '8.2.6': 'Monitoring and measurement of product',
      '8.3': 'Control of nonconforming product',
      '8.4': 'Analysis of data',
      '8.5': 'Improvement',
      '8.5.1': 'General',
      '8.5.2': 'Corrective action',
      '8.5.3': 'Preventive action',
    },
  },

  // Risk Management
  'ISO 14971': {
    name: 'ISO 14971:2019',
    fullName: 'Medical devices — Application of risk management to medical devices',
    description: 'Specifies terminology, principles and a process for risk management of medical devices, including software as a medical device and in vitro diagnostic medical devices.',
    clauses: {
      '4.1': 'Risk management process',
      '4.2': 'Management responsibilities',
      '4.3': 'Qualification of personnel',
      '4.4': 'Risk management plan',
      '4.5': 'Risk management file',
      '5.1': 'Risk analysis process',
      '5.2': 'Intended use and reasonably foreseeable misuse',
      '5.3': 'Identification of characteristics related to safety',
      '5.4': 'Identification of hazards and hazardous situations',
      '5.5': 'Risk estimation',
      '6': 'Risk evaluation',
      '7.1': 'Risk control option analysis',
      '7.2': 'Implementation of risk control measures',
      '7.3': 'Residual risk evaluation',
      '7.4': 'Benefit-risk analysis',
      '7.5': 'Risks arising from risk control measures',
      '7.6': 'Completeness of risk control',
      '8': 'Evaluation of overall residual risk',
      '9': 'Risk management review',
      '10': 'Production and post-production activities',
    },
  },

  // Biocompatibility
  'ISO 10993': {
    name: 'ISO 10993',
    fullName: 'Biological evaluation of medical devices',
    description: 'Series of standards for evaluating the biocompatibility of medical devices.',
    clauses: {
      '10993-1': 'Evaluation and testing within a risk management process',
      '10993-2': 'Animal welfare requirements',
      '10993-3': 'Tests for genotoxicity, carcinogenicity and reproductive toxicity',
      '10993-4': 'Selection of tests for interactions with blood',
      '10993-5': 'Tests for in vitro cytotoxicity',
      '10993-6': 'Tests for local effects after implantation',
      '10993-7': 'Ethylene oxide sterilization residuals',
      '10993-9': 'Framework for identification and quantification of potential degradation products',
      '10993-10': 'Tests for skin sensitization',
      '10993-11': 'Tests for systemic toxicity',
      '10993-12': 'Sample preparation and reference materials',
      '10993-13': 'Identification and quantification of degradation products from polymeric medical devices',
      '10993-14': 'Identification and quantification of degradation products from ceramics',
      '10993-15': 'Identification and quantification of degradation products from metals and alloys',
      '10993-16': 'Toxicokinetic study design for degradation products and leachables',
      '10993-17': 'Establishment of allowable limits for leachable substances',
      '10993-18': 'Chemical characterization of medical device materials within a risk management process',
      '10993-23': 'Tests for irritation',
    },
  },

  // General QMS
  'ISO 9001': {
    name: 'ISO 9001:2015',
    fullName: 'Quality management systems — Requirements',
    description: 'Specifies requirements for a quality management system when an organization needs to demonstrate its ability to consistently provide products and services that meet customer and applicable statutory and regulatory requirements.',
    clauses: {
      '4.1': 'Understanding the organization and its context',
      '4.2': 'Understanding the needs and expectations of interested parties',
      '4.3': 'Determining the scope of the quality management system',
      '4.4': 'Quality management system and its processes',
      '5.1': 'Leadership and commitment',
      '5.2': 'Policy',
      '5.3': 'Organizational roles, responsibilities and authorities',
      '6.1': 'Actions to address risks and opportunities',
      '6.2': 'Quality objectives and planning to achieve them',
      '6.3': 'Planning of changes',
      '7.1': 'Resources',
      '7.2': 'Competence',
      '7.3': 'Awareness',
      '7.4': 'Communication',
      '7.5': 'Documented information',
      '8.1': 'Operational planning and control',
      '8.2': 'Requirements for products and services',
      '8.3': 'Design and development of products and services',
      '8.4': 'Control of externally provided processes, products and services',
      '8.5': 'Production and service provision',
      '8.6': 'Release of products and services',
      '8.7': 'Control of nonconforming outputs',
      '9.1': 'Monitoring, measurement, analysis and evaluation',
      '9.2': 'Internal audit',
      '9.3': 'Management review',
      '10.1': 'General (Improvement)',
      '10.2': 'Nonconformity and corrective action',
      '10.3': 'Continual improvement',
    },
  },

  // Sterilization - EO
  'ISO 11135': {
    name: 'ISO 11135:2014',
    fullName: 'Sterilization of health-care products — Ethylene oxide — Requirements for the development, validation and routine control of a sterilization process for medical devices',
    description: 'Specifies requirements for the development, validation and routine control of an ethylene oxide sterilization process for medical devices.',
    clauses: {
      '6': 'Characterization of sterilizing agent',
      '7': 'Process and equipment characterization',
      '8': 'Product definition',
      '9': 'Process definition',
      '10': 'Validation',
      '11': 'Routine monitoring and control',
      '12': 'Product release from sterilization',
      '13': 'Maintaining process effectiveness',
    },
  },

  // Sterilization - Radiation
  'ISO 11137': {
    name: 'ISO 11137',
    fullName: 'Sterilization of health care products — Radiation',
    description: 'Series of standards for radiation sterilization of medical devices.',
    clauses: {
      '11137-1': 'Requirements for development, validation and routine control of a sterilization process for medical devices',
      '11137-2': 'Establishing the sterilization dose',
      '11137-3': 'Guidance on dosimetric aspects of development, validation and routine control',
    },
  },

  // Packaging
  'ISO 11607': {
    name: 'ISO 11607',
    fullName: 'Packaging for terminally sterilized medical devices',
    description: 'Specifies requirements and test methods for materials, preformed sterile barrier systems, sterile barrier systems and packaging systems.',
    clauses: {
      '11607-1': 'Requirements for materials, sterile barrier systems and packaging systems',
      '11607-2': 'Validation requirements for forming, sealing and assembly processes',
    },
  },

  // Cleanrooms
  'ISO 14644': {
    name: 'ISO 14644',
    fullName: 'Cleanrooms and associated controlled environments',
    description: 'Series of standards covering cleanroom classification, testing, design, and operations.',
    clauses: {
      '14644-1': 'Classification of air cleanliness by particle concentration',
      '14644-2': 'Monitoring to provide evidence of cleanroom performance related to air cleanliness by particle concentration',
      '14644-3': 'Test methods',
      '14644-4': 'Design, construction and start-up',
      '14644-5': 'Operations',
      '14644-7': 'Separative devices (clean air hoods, gloveboxes, isolators and mini-environments)',
      '14644-8': 'Classification of air cleanliness by chemical concentration',
    },
  },

  // Software Lifecycle
  'IEC 62304': {
    name: 'IEC 62304:2006/AMD1:2015',
    fullName: 'Medical device software — Software life cycle processes',
    description: 'Defines the life cycle requirements for medical device software development and maintenance.',
    clauses: {
      '4.1': 'Quality management system',
      '4.2': 'Risk management',
      '4.3': 'Software safety classification',
      '5.1': 'Software development planning',
      '5.2': 'Software requirements analysis',
      '5.3': 'Software architectural design',
      '5.4': 'Software detailed design',
      '5.5': 'Software unit implementation',
      '5.6': 'Software integration and integration testing',
      '5.7': 'Software system testing',
      '5.8': 'Software release',
      '6.1': 'Software maintenance plan',
      '6.2': 'Problem and modification analysis',
      '6.3': 'Modification implementation',
      '7.1': 'Configuration identification',
      '7.2': 'Change control',
      '7.3': 'Configuration status accounting',
      '8.1': 'Problem reports',
      '8.2': 'Analysis of change requests',
      '8.3': 'Approval of change requests',
      '9.1': 'Software of unknown provenance (SOUP)',
    },
  },

  // Electrical Safety
  'IEC 60601': {
    name: 'IEC 60601-1',
    fullName: 'Medical electrical equipment — Part 1: General requirements for basic safety and essential performance',
    description: 'Applies to the basic safety and essential performance of medical electrical equipment.',
    clauses: {
      '4': 'General requirements',
      '5': 'General requirements for testing of ME EQUIPMENT',
      '6': 'Classification of ME EQUIPMENT and ME SYSTEMS',
      '7': 'ME EQUIPMENT identification, marking and documents',
      '8': 'Protection against electrical HAZARDS from ME EQUIPMENT',
      '9': 'Protection against MECHANICAL HAZARDS of ME EQUIPMENT and ME SYSTEMS',
      '10': 'Protection against unwanted and excessive radiation HAZARDS',
      '11': 'Protection against excessive temperatures and other HAZARDS',
      '12': 'Accuracy of controls and instruments and protection against hazardous outputs',
      '13': 'HAZARDOUS SITUATIONS and fault conditions',
      '14': 'PROGRAMMABLE ELECTRICAL MEDICAL SYSTEMS (PEMS)',
      '15': 'Construction of ME EQUIPMENT',
      '16': 'ME SYSTEMS',
      '17': 'Electromagnetic compatibility of ME EQUIPMENT and ME SYSTEMS',
    },
  },

  // Usability Engineering
  'IEC 62366': {
    name: 'IEC 62366-1:2015',
    fullName: 'Medical devices — Part 1: Application of usability engineering to medical devices',
    description: 'Specifies a process for manufacturers to analyse, specify, develop and evaluate the usability of medical devices.',
    clauses: {
      '4.1': 'Usability engineering process',
      '4.2': 'Risk management',
      '5.1': 'Prepare USE SPECIFICATION',
      '5.2': 'Identify USER INTERFACE characteristics related to safety and potential USE ERRORS',
      '5.3': 'Identify known or foreseeable HAZARDS and HAZARDOUS SITUATIONS',
      '5.4': 'Identify and describe HAZARD-RELATED USE SCENARIOS',
      '5.5': 'Select HAZARD-RELATED USE SCENARIOS for SUMMATIVE EVALUATION',
      '5.6': 'Establish USER INTERFACE SPECIFICATION',
      '5.7': 'Establish USER INTERFACE EVALUATION PLAN',
      '5.8': 'Design, implement, and FORMATIVE EVALUATION',
      '5.9': 'SUMMATIVE EVALUATION of USABILITY of the USER INTERFACE',
    },
  },

  // Clinical Investigations
  'ISO 14155': {
    name: 'ISO 14155:2020',
    fullName: 'Clinical investigation of medical devices for human subjects — Good clinical practice',
    description: 'Addresses good clinical practice for the design, conduct, recording and reporting of clinical investigations.',
    clauses: {
      '4': 'Ethical considerations',
      '5': 'Clinical investigation planning',
      '6': 'Clinical investigation conduct',
      '7': 'Monitoring, auditing and inspection',
      '8': 'Documentation and data management',
      '9': 'Handling and storage of investigational medical devices',
      '10': 'Safety reporting',
      '11': 'Statistical considerations',
      '12': 'Clinical investigation report',
    },
  },

  // Symbols
  'ISO 15223': {
    name: 'ISO 15223-1:2021',
    fullName: 'Medical devices — Symbols to be used with information to be supplied by the manufacturer',
    description: 'Specifies symbols used for labelling and information supplied by manufacturers of medical devices.',
    clauses: {
      '5.1': 'Symbols for general information',
      '5.2': 'Symbols indicating warnings or precautions',
      '5.3': 'Symbols indicating storage and handling conditions',
      '5.4': 'Symbols for IVD medical devices',
    },
  },

  // Reprocessing
  'ISO 17664': {
    name: 'ISO 17664:2017',
    fullName: 'Processing of health care products — Information to be provided by the medical device manufacturer for the processing of medical devices',
    description: 'Specifies requirements for information to be provided by the medical device manufacturer for the processing of medical devices intended to be reprocessed.',
    clauses: {
      '4': 'General requirements for information to be provided',
      '5.1': 'Cleaning instructions',
      '5.2': 'Disinfection instructions',
      '5.3': 'Rinsing instructions',
      '5.4': 'Drying instructions',
      '5.5': 'Inspection and maintenance instructions',
      '5.6': 'Packaging instructions',
      '5.7': 'Sterilization instructions',
      '5.8': 'Instructions for sterility assurance',
      '6': 'Validation requirements',
      '7': 'Specific requirements for flexible endoscopes',
      '8': 'Specific requirements for powered instruments',
    },
  },
};

// Regulatory Framework References
export const REGULATORY_FRAMEWORKS = {
  'FDA 21 CFR Part 820': {
    name: '21 CFR Part 820',
    fullName: 'Quality System Regulation',
    description: 'FDA regulations for medical device quality systems in the United States.',
    subparts: {
      'A': 'General Provisions (820.1-820.5)',
      'B': 'Quality System Requirements (820.20-820.25)',
      'C': 'Design Controls (820.30)',
      'D': 'Document Controls (820.40)',
      'E': 'Purchasing Controls (820.50)',
      'F': 'Identification and Traceability (820.60-820.65)',
      'G': 'Production and Process Controls (820.70-820.75)',
      'H': 'Acceptance Activities (820.80-820.86)',
      'I': 'Nonconforming Product (820.90)',
      'J': 'Corrective and Preventive Action (820.100)',
      'K': 'Labeling and Packaging Control (820.120-820.130)',
      'L': 'Handling, Storage, Distribution, and Installation (820.140-820.170)',
      'M': 'Records (820.180-820.198)',
      'N': 'Servicing (820.200)',
      'O': 'Statistical Techniques (820.250)',
    },
  },

  'EU MDR 2017/745': {
    name: 'EU MDR 2017/745',
    fullName: 'European Medical Device Regulation',
    description: 'European Union regulation on medical devices.',
    chapters: {
      'I': 'Scope and definitions',
      'II': 'Making available, obligations of economic operators, reprocessing, CE marking',
      'III': 'Identification and traceability, UDI, registration',
      'IV': 'Notified bodies',
      'V': 'Classification and conformity assessment',
      'VI': 'Clinical evaluation and clinical investigations',
      'VII': 'Post-market surveillance, vigilance, market surveillance',
      'VIII': 'Cooperation between Member States',
      'IX': 'Confidentiality, data protection, funding',
      'X': 'Final provisions',
    },
  },

  'EU IVDR 2017/746': {
    name: 'EU IVDR 2017/746',
    fullName: 'European In Vitro Diagnostic Regulation',
    description: 'European Union regulation on in vitro diagnostic medical devices.',
    chapters: {
      'I': 'Scope and definitions',
      'II': 'Making available, obligations of economic operators, CE marking',
      'III': 'Identification and traceability, UDI, registration',
      'IV': 'Notified bodies',
      'V': 'Classification and conformity assessment',
      'VI': 'Clinical evidence and performance evaluation',
      'VII': 'Post-market surveillance, vigilance, market surveillance',
    },
  },
};

// Helper function to get ISO mapping
export function getISOMapping(standard: string, clause: string): ISOMapping | null {
  const standardData = ISO_STANDARDS[standard as keyof typeof ISO_STANDARDS];
  if (!standardData) return null;

  const clauseDescription = standardData.clauses[clause as keyof typeof standardData.clauses];
  if (!clauseDescription) return null;

  return {
    standard: standard as ISOMapping['standard'],
    clause,
    description: clauseDescription,
  };
}

// Get all clauses for a standard
export function getStandardClauses(standard: string): { clause: string; description: string }[] {
  const standardData = ISO_STANDARDS[standard as keyof typeof ISO_STANDARDS];
  if (!standardData) return [];

  return Object.entries(standardData.clauses).map(([clause, description]) => ({
    clause,
    description,
  }));
}
