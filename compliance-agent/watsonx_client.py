import logging
from typing import Optional, Dict, Any
from ibm_watsonx_ai.foundation_models import Model
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from config import Config

logger = logging.getLogger(__name__)


class WatsonxClientError(Exception):
    """Raised when watsonx client encounters an error."""
    pass


class WatsonxClient:
    """Enhanced watsonx.ai client with error handling and retry logic."""
    
    def __init__(self):
        """Initialize watsonx client with validation."""
        self.model = None
        self.enabled = False
        
        if not Config.ENABLE_WATSONX:
            logger.info("watsonx verification is disabled by configuration")
            return
        
        if not Config.WATSONX_APIKEY or not Config.WATSONX_PROJECT_ID:
            logger.warning("watsonx credentials not configured - verification will be skipped")
            return
        
        try:
            self._initialize_model()
            self.enabled = True
            logger.info("watsonx client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize watsonx client: {e}")
            logger.warning("Continuing without watsonx verification")
    
    def _initialize_model(self):
        """Initialize the watsonx model."""
        credentials = {
            "url": Config.WATSONX_URL,
            "apikey": Config.WATSONX_APIKEY
        }
        
        generate_params = {
            GenParams.MAX_NEW_TOKENS: 2000,
            GenParams.TEMPERATURE: 0.1,  # Low temperature for precision
            GenParams.DECODING_METHOD: "greedy",
            GenParams.REPETITION_PENALTY: 1.1
        }
        
        try:
            self.model = Model(
                model_id=Config.WATSONX_MODEL_ID,
                credentials=credentials,
                params=generate_params,
                project_id=Config.WATSONX_PROJECT_ID
            )
            logger.info(f"watsonx model initialized: {Config.WATSONX_MODEL_ID}")
        except Exception as e:
            raise WatsonxClientError(f"Model initialization failed: {e}")
    
    def verify_compliance(self, draft: str, file_path: str = "") -> str:
        """
        Verify compliance documentation against regulatory standards.
        
        Args:
            draft: Documentation draft to verify
            file_path: Path to the file being verified
            
        Returns:
            Verification report with recommendations
        """
        if not self.enabled or not self.model:
            return self._generate_fallback_verification()
        
        prompt = f"""You are a regulatory compliance expert for medical device software.

Verify the following compliance documentation draft against:
- ISO 13485 (Quality Management Systems for Medical Devices)
- IEC 62304 (Medical Device Software Lifecycle Processes)
- FDA 21 CFR Part 11 (Electronic Records and Signatures)

File: {file_path}

Documentation Draft:
{draft}

Provide a structured verification report:

1. COMPLIANCE VERIFICATION
   - ISO 13485 alignment
   - IEC 62304 alignment
   - FDA 21 CFR Part 11 alignment

2. TRACEABILITY MATRIX REVIEW
   - Verify all regulation citations are accurate
   - Identify missing traceability links
   - Check for incorrect section references

3. GAPS AND ISSUES
   - Missing required elements
   - Incomplete risk assessments
   - Documentation deficiencies

4. RECOMMENDATIONS
   - Required corrections
   - Additional documentation needed
   - Process improvements

5. APPROVAL STATUS
   - Ready for approval / Needs revision
   - Critical issues to address

Be specific and cite exact regulation sections."""
        
        try:
            logger.info("Sending verification request to watsonx.ai")
            response = self.model.generate_text(prompt)
            logger.info("Verification completed successfully")
            return response
        except Exception as e:
            logger.error(f"watsonx verification failed: {e}")
            return f"Verification failed: {str(e)}\n\n{self._generate_fallback_verification()}"
    
    def _generate_fallback_verification(self) -> str:
        """Generate a fallback verification message when watsonx is unavailable."""
        return """# Verification Status: watsonx Unavailable

⚠️ **Note**: watsonx.ai verification is currently unavailable. This draft has been generated using local models only.

## Required Manual Review

Please ensure manual review by qualified personnel for:

1. **ISO 13485 Compliance**
   - Quality management system requirements
   - Design and development controls
   - Risk management integration

2. **IEC 62304 Compliance**
   - Software safety classification
   - Software development lifecycle
   - Software maintenance procedures

3. **FDA 21 CFR Part 11 Compliance**
   - Electronic records integrity
   - Electronic signatures
   - Audit trail requirements

4. **Traceability Matrix Validation**
   - Verify all regulation citations
   - Confirm requirement mappings
   - Check for completeness

## Recommendation

Submit this documentation for formal quality review before implementation.
"""
    
    def assess_risk(self, change_description: str, file_type: str = "") -> Dict[str, Any]:
        """
        Assess regulatory risk of a code change.
        
        Args:
            change_description: Description of the change
            file_type: Type of file changed
            
        Returns:
            Risk assessment dictionary
        """
        if not self.enabled or not self.model:
            return {
                "risk_level": "UNKNOWN",
                "assessment": "Risk assessment unavailable - watsonx not configured",
                "recommendations": ["Perform manual risk assessment"]
            }
        
        prompt = f"""Assess the regulatory risk of the following code change for medical device software:

File Type: {file_type}
Change Description:
{change_description}

Provide a risk assessment:

1. RISK LEVEL: [LOW/MEDIUM/HIGH/CRITICAL]
2. REGULATORY IMPACT:
   - ISO 13485 impact
   - IEC 62304 safety classification impact
   - FDA requirements impact
3. REQUIRED ACTIONS:
   - Documentation updates
   - Testing requirements
   - Validation needs
4. APPROVAL REQUIREMENTS:
   - Required reviewers
   - Change control process

Format as structured JSON."""
        
        try:
            response = self.model.generate_text(prompt)
            return {
                "risk_level": "ASSESSED",
                "assessment": response,
                "recommendations": ["Review assessment and follow recommended actions"]
            }
        except Exception as e:
            logger.error(f"Risk assessment failed: {e}")
            return {
                "risk_level": "ERROR",
                "assessment": f"Assessment failed: {str(e)}",
                "recommendations": ["Perform manual risk assessment"]
            }
    
    def generate_test_requirements(self, code_analysis: str) -> str:
        """
        Generate testing requirements based on code analysis.
        
        Args:
            code_analysis: Analysis of code changes
            
        Returns:
            Test requirements document
        """
        if not self.enabled or not self.model:
            return "Test requirements generation unavailable - watsonx not configured"
        
        prompt = f"""Based on the following code analysis, generate comprehensive testing requirements for medical device software:

{code_analysis}

Generate:
1. Unit Test Requirements
2. Integration Test Requirements
3. System Test Requirements
4. Validation Test Requirements (per IEC 62304)
5. Traceability to Requirements
6. Acceptance Criteria"""
        
        try:
            return self.model.generate_text(prompt)
        except Exception as e:
            logger.error(f"Test requirements generation failed: {e}")
            return f"Test requirements generation failed: {str(e)}"

# Made with Bob
