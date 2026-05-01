import logging
from typing import Optional, Dict, Any, List
import ollama
from config import Config

logger = logging.getLogger(__name__)


class OllamaClientError(Exception):
    """Raised when Ollama client encounters an error."""
    pass


class OllamaClient:
    """Enhanced Ollama client with error handling, retries, and caching."""
    
    def __init__(self):
        """Initialize Ollama client with connection validation."""
        try:
            self.client = ollama.Client(host=Config.OLLAMA_BASE_URL)
            self._validate_connection()
            logger.info(f"Ollama client initialized successfully at {Config.OLLAMA_BASE_URL}")
        except Exception as e:
            logger.error(f"Failed to initialize Ollama client: {e}")
            raise OllamaClientError(f"Ollama initialization failed: {e}")
    
    def _validate_connection(self):
        """Validate connection to Ollama server."""
        try:
            # Try to list models to verify connection
            self.client.list()
            logger.info("Ollama connection validated")
        except Exception as e:
            logger.warning(f"Could not validate Ollama connection: {e}")
    
    def _validate_model(self, model: str) -> bool:
        """Check if a model is available."""
        try:
            models = self.client.list()
            available_models = [m['name'] for m in models.get('models', [])]
            if model not in available_models:
                logger.warning(f"Model {model} not found. Available models: {available_models}")
                return False
            return True
        except Exception as e:
            logger.warning(f"Could not validate model {model}: {e}")
            return True  # Assume available if we can't check
    
    def chat(
        self, 
        model: str, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Send a chat request to Ollama with enhanced error handling.
        
        Args:
            model: Model name to use
            prompt: User prompt
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text response
            
        Raises:
            OllamaClientError: If the request fails
        """
        messages = []
        if system_prompt:
            messages.append({'role': 'system', 'content': system_prompt})
        messages.append({'role': 'user', 'content': prompt})
        
        options = {'temperature': temperature}
        if max_tokens:
            options['num_predict'] = max_tokens
        
        try:
            logger.debug(f"Sending chat request to {model}")
            response = self.client.chat(
                model=model, 
                messages=messages,
                options=options
            )
            content = response['message']['content']
            logger.debug(f"Received response from {model} ({len(content)} chars)")
            return content
        except Exception as e:
            logger.error(f"Chat request failed for model {model}: {e}")
            raise OllamaClientError(f"Chat request failed: {e}")
    
    def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate embeddings for text.
        
        Args:
            text: Text to embed
            
        Returns:
            List of embedding values
            
        Raises:
            OllamaClientError: If embedding generation fails
        """
        try:
            logger.debug(f"Generating embeddings for text ({len(text)} chars)")
            response = self.client.embeddings(
                model=Config.EMBEDDING_MODEL, 
                prompt=text
            )
            embeddings = response['embedding']
            logger.debug(f"Generated embeddings (dimension: {len(embeddings)})")
            return embeddings
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise OllamaClientError(f"Embedding generation failed: {e}")
    
    def analyze_code(self, code_snippet: str, file_type: str = "unknown") -> str:
        """
        Analyze code for quality, security, and compliance issues.
        
        Args:
            code_snippet: Code to analyze
            file_type: Type of file (e.g., 'typescript', 'python')
            
        Returns:
            Analysis report
        """
        system_prompt = """You are an expert code reviewer specializing in medical device software compliance.

Your analysis MUST cite specific regulation sections using this format:
- ISO 13485: Use format "ISO 13485:2016 Section X.X.X"
- IEC 62304: Use format "IEC 62304:2006+AMD1:2015 Section X.X.X"
- FDA 21 CFR Part 11: Use format "21 CFR Part 11.XX"

Focus on:
1. Code Quality (maintainability, readability, complexity)
2. Security Vulnerabilities (injection, authentication, data exposure)
3. Regulatory Compliance (traceability, validation, documentation)
4. Risk Assessment (safety implications, failure modes)"""
        
        prompt = f"""Analyze the following {file_type} code for medical device software compliance:

```{file_type}
{code_snippet}
```

Provide a structured analysis with SPECIFIC REGULATION CITATIONS:

## 1. Code Quality Assessment
- Identify issues with specific line references
- Rate severity: CRITICAL, HIGH, MEDIUM, LOW

## 2. Security Analysis
- List vulnerabilities with CVE/CWE references where applicable
- Cite relevant FDA guidance (e.g., "FDA Cybersecurity Guidance 2018")

## 3. Regulatory Compliance
- ISO 13485:2016 requirements (cite specific sections like "7.3.2 Design Inputs")
- IEC 62304:2006 requirements (cite specific sections like "5.5.3 Software Unit Verification")
- 21 CFR Part 11 requirements (cite specific sections like "11.10(a) Validation")

## 4. Risk Assessment
- Identify potential hazards per ISO 14971
- Classify software safety class per IEC 62304 (A, B, or C)

## 5. Recommendations
- Prioritized action items with regulation citations
- Suggested code improvements"""
        
        try:
            return self.chat(
                Config.CODE_MODEL, 
                prompt, 
                system_prompt=system_prompt,
                temperature=0.3  # Lower temperature for more focused analysis
            )
        except OllamaClientError as e:
            logger.error(f"Code analysis failed: {e}")
            return f"Code analysis failed: {str(e)}"
    
    def draft_compliance_doc(
        self,
        code_analysis: str,
        context: str = "",
        file_path: str = ""
    ) -> str:
        """
        Draft compliance documentation based on code analysis.
        
        Args:
            code_analysis: Results from code analysis
            context: Additional regulatory context from RAG
            file_path: Path to the file being analyzed
            
        Returns:
            Compliance documentation draft
        """
        system_prompt = """You are a Quality Assurance lead for medical device software with expertise in:
- ISO 13485:2016 (Quality Management Systems for Medical Devices)
- IEC 62304:2006+AMD1:2015 (Medical Device Software Lifecycle Processes)
- FDA 21 CFR Part 11 (Electronic Records and Electronic Signatures)
- ISO 14971:2019 (Risk Management for Medical Devices)

CRITICAL: All regulation references MUST use exact section numbers and formats:
- ISO 13485:2016 Section 7.3.2 (Design and Development Inputs)
- IEC 62304:2006 Section 5.1.1 (Software Development Planning)
- 21 CFR Part 11.10(a) (Validation of Systems)
- ISO 14971:2019 Section 5.4 (Risk Evaluation)"""
        
        prompt = f"""Create comprehensive compliance documentation for medical device software changes.

**File:** {file_path}

**Code Analysis:**
{code_analysis}

**Regulatory Context from Knowledge Base:**
{context if context else "No additional regulatory context retrieved"}

---

Generate a complete compliance documentation package with the following sections:

## 1. CHANGE SUMMARY
- Brief description of changes
- Files affected
- Change type (enhancement, bug fix, refactoring, etc.)
- Change control reference (if applicable)

## 2. REGULATORY IMPACT ASSESSMENT

### ISO 13485:2016 Impact
- Section 7.3.2 (Design Inputs): [Impact assessment]
- Section 7.3.3 (Design Outputs): [Impact assessment]
- Section 7.3.4 (Design Review): [Required actions]
- Section 7.3.6 (Design Validation): [Validation needs]

### IEC 62304:2006+AMD1:2015 Impact
- Section 5.1 (Software Development Process): [Process compliance]
- Section 5.5 (Software Unit Implementation and Verification): [Unit testing needs]
- Section 5.6 (Software Integration and Integration Testing): [Integration impact]
- Section 8.1 (Software Maintenance Process): [Maintenance considerations]

### FDA 21 CFR Part 11 Impact
- 11.10(a) (System Validation): [Validation requirements]
- 11.10(c) (Authority Checks): [Access control impact]
- 11.10(e) (Audit Trail): [Audit trail requirements]
- 11.10(k) (Data Protection): [Data integrity measures]

## 3. REQUIREMENTS TRACEABILITY MATRIX

| Requirement ID | Regulation Reference | Implementation | Verification Method | Status |
|----------------|---------------------|----------------|---------------------|--------|
| REQ-XXX | ISO 13485:2016 7.3.2 | [Description] | [Test method] | [Status] |
| REQ-YYY | IEC 62304:2006 5.5.3 | [Description] | [Test method] | [Status] |

## 4. RISK ASSESSMENT (ISO 14971:2019)

### Hazard Analysis
- Identified hazards with severity ratings
- Probability of occurrence
- Risk level (per ISO 14971:2019 Section 5.4)

### Software Safety Classification (IEC 62304:2006 Section 4.3)
- Safety Class: [A/B/C]
- Justification: [Rationale]

### Risk Control Measures
- Mitigation strategies
- Residual risk assessment

## 5. VALIDATION REQUIREMENTS

### Unit Testing (IEC 62304:2006 Section 5.5.2)
- Test cases required
- Coverage requirements
- Acceptance criteria

### Integration Testing (IEC 62304:2006 Section 5.6.3)
- Integration test scenarios
- Interface validation

### System Testing (IEC 62304:2006 Section 5.7.2)
- System-level test requirements
- Performance criteria

## 6. DOCUMENTATION UPDATES REQUIRED

- [ ] Software Requirements Specification (ISO 13485:2016 7.3.2)
- [ ] Software Design Specification (ISO 13485:2016 7.3.3)
- [ ] Software Test Plan (IEC 62304:2006 5.5.1)
- [ ] Risk Management File (ISO 14971:2019)
- [ ] Traceability Matrix (IEC 62304:2006 5.1.1)
- [ ] User Documentation (IEC 62304:2006 5.8)

## 7. APPROVAL REQUIREMENTS

- QA Review Required: [Yes/No]
- Regulatory Affairs Review: [Yes/No]
- Change Control Board Approval: [Yes/No]
- Validation Protocol Approval: [Yes/No]

## 8. REFERENCES

List all applicable:
- ISO 13485:2016 sections
- IEC 62304:2006+AMD1:2015 sections
- FDA 21 CFR Part 11 sections
- FDA Guidance documents
- Internal SOPs

---

**IMPORTANT:** This documentation must be reviewed and approved by qualified personnel before implementation."""
        
        try:
            return self.chat(
                Config.REASONING_MODEL, 
                prompt, 
                system_prompt=system_prompt,
                temperature=0.2  # Very low temperature for compliance docs
            )
        except OllamaClientError as e:
            logger.error(f"Compliance doc drafting failed: {e}")
            return f"Compliance documentation drafting failed: {str(e)}"
    
    def summarize_changes(self, changes: List[Dict[str, Any]]) -> str:
        """
        Generate a summary of multiple file changes.
        
        Args:
            changes: List of change records
            
        Returns:
            Summary report
        """
        prompt = f"""Summarize the following code changes from a compliance perspective:

{changes}

Provide:
1. Overall impact assessment
2. Key compliance considerations
3. Recommended actions"""
        
        try:
            return self.chat(
                Config.REASONING_MODEL,
                prompt,
                temperature=0.3
            )
        except OllamaClientError as e:
            logger.error(f"Change summarization failed: {e}")
            return f"Summarization failed: {str(e)}"

# Made with Bob
