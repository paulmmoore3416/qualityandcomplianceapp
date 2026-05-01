import os
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
from ollama_client import OllamaClient, OllamaClientError
from watsonx_client import WatsonxClient
from rag_pipeline import RAGPipeline, RAGPipelineError
from notifications import NotificationManager
from config import Config

logger = logging.getLogger(__name__)


class ComplianceAgent:
    """
    Enhanced compliance agent with improved error handling, 
    reporting, and processing capabilities.
    """
    
    def __init__(self):
        """Initialize the compliance agent with all required clients."""
        logger.info("Initializing Compliance Agent...")
        
        try:
            self.ollama = OllamaClient()
            logger.info("✓ Ollama client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Ollama client: {e}")
            raise
        
        try:
            self.watsonx = WatsonxClient()
            if self.watsonx.enabled:
                logger.info("✓ watsonx client initialized")
            else:
                logger.info("○ watsonx client disabled or unavailable")
        except Exception as e:
            logger.warning(f"watsonx initialization failed: {e}")
            self.watsonx = None
        
        try:
            self.rag = RAGPipeline()
            logger.info("✓ RAG pipeline initialized")
        except Exception as e:
            logger.error(f"Failed to initialize RAG pipeline: {e}")
            raise
        
        # Statistics
        # Initialize notifications
        try:
            self.notifications = NotificationManager()
            logger.info("✓ Notification manager initialized")
        except Exception as e:
            logger.warning(f"Notifications unavailable: {e}")
            self.notifications = None
        
        self.stats = {
            "files_processed": 0,
            "reports_generated": 0,
            "errors": 0,
            "start_time": datetime.now()
        }
        
        logger.info("Compliance Agent initialized successfully")
    
    def process_change(self, file_path: str):
        """
        Process a file change and generate compliance documentation.
        
        Args:
            file_path: Path to the changed file
        """
        logger.info("=" * 80)
        logger.info(f"Processing: {file_path}")
        logger.info("=" * 80)
        
        try:
            # Validate file
            path_obj = Path(file_path)
            if not path_obj.exists():
                logger.error(f"File does not exist: {file_path}")
                return
            
            # Check file size
            file_size_mb = path_obj.stat().st_size / (1024 * 1024)
            if file_size_mb > Config.MAX_FILE_SIZE_MB:
                logger.warning(f"File too large ({file_size_mb:.2f} MB), skipping")
                return
            
            # Read file content
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                logger.warning(f"Could not decode file as UTF-8, skipping: {file_path}")
                return
            except Exception as e:
                logger.error(f"Could not read file {file_path}: {e}")
                self.stats["errors"] += 1
                return
            
            # Limit content length for analysis
            content_for_analysis = content[:Config.MAX_CONTENT_LENGTH]
            if len(content) > Config.MAX_CONTENT_LENGTH:
                logger.info(f"Content truncated from {len(content)} to {Config.MAX_CONTENT_LENGTH} chars")
            
            # Step 1: Analyze Code
            logger.info("Step 1/5: Analyzing code with local model...")
            file_type = path_obj.suffix.lstrip('.')
            try:
                analysis = self.ollama.analyze_code(content_for_analysis, file_type)
                logger.info(f"✓ Code analysis complete ({len(analysis)} chars)")
            except OllamaClientError as e:
                logger.error(f"Code analysis failed: {e}")
                analysis = f"Code analysis failed: {str(e)}"
            
            # Step 2: Retrieve Regulatory Context
            logger.info("Step 2/5: Retrieving regulatory context from RAG...")
            try:
                context = self.rag.get_relevant_context(
                    file_path, 
                    f"Code changes in {path_obj.name}"
                )
                logger.info(f"✓ Retrieved context ({len(context)} chars)")
            except Exception as e:
                logger.error(f"RAG query failed: {e}")
                context = "No regulatory context available"
            
            # Step 3: Draft Compliance Documentation
            logger.info("Step 3/5: Drafting compliance documentation...")
            try:
                draft = self.ollama.draft_compliance_doc(
                    analysis, 
                    context,
                    file_path
                )
                logger.info(f"✓ Draft complete ({len(draft)} chars)")
            except OllamaClientError as e:
                logger.error(f"Compliance doc drafting failed: {e}")
                draft = f"Compliance documentation drafting failed: {str(e)}"
            
            # Step 4: Verify with watsonx
            verification = None
            if self.watsonx and self.watsonx.enabled:
                logger.info("Step 4/5: Verifying with watsonx.ai...")
                try:
                    verification = self.watsonx.verify_compliance(draft, file_path)
                    logger.info(f"✓ Verification complete ({len(verification)} chars)")
                except Exception as e:
                    logger.error(f"watsonx verification failed: {e}")
                    verification = f"Verification failed: {str(e)}"
            else:
                logger.info("Step 4/5: Skipping watsonx verification (not configured)")
                verification = "watsonx verification not available"
            
            # Step 5: Generate and Save Report
            logger.info("Step 5/5: Generating compliance report...")
            report_path = self.save_result(file_path, analysis, draft, verification, context)
            
            # Update statistics
            self.stats["files_processed"] += 1
            self.stats["reports_generated"] += 1
            
            # Send notifications
            if self.notifications:
                try:
                    # Determine severity from analysis
                    severity = self._determine_severity(analysis, verification)
                    summary = self._extract_summary(draft)
                    
                    self.notifications.send_report_notification(
                        file_path,
                        report_path,
                        severity,
                        summary
                    )
                except Exception as e:
                    logger.warning(f"Failed to send notification: {e}")
            
            logger.info("=" * 80)
            logger.info(f"✓ Processing complete: {report_path}")
            logger.info("=" * 80)
            
        except Exception as e:
            logger.error(f"Unexpected error processing {file_path}: {e}", exc_info=True)
            self.stats["errors"] += 1
    
    def save_result(
        self, 
        source_file: str, 
        analysis: str, 
        draft: str, 
        verification: Optional[str],
        context: str
    ) -> Path:
        """
        Save compliance report with enhanced formatting.
        
        Args:
            source_file: Path to source file
            analysis: Code analysis results
            draft: Compliance documentation draft
            verification: watsonx verification results
            context: Regulatory context
            
        Returns:
            Path to saved report
        """
        # Create reports directory
        Config.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Generate report filename
        source_path = Path(source_file)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{source_path.stem}_{timestamp}_compliance.md"
        report_path = Config.REPORTS_DIR / filename
        
        # Generate report content
        report = self._generate_report(
            source_file, 
            analysis, 
            draft, 
            verification, 
            context
        )
        
        # Save report
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report)
            logger.info(f"Report saved: {report_path}")
        except Exception as e:
            logger.error(f"Failed to save report: {e}")
            raise
        
        return report_path
    
    def _generate_report(
        self,
        source_file: str,
        analysis: str,
        draft: str,
        verification: Optional[str],
        context: str
    ) -> str:
        """Generate formatted compliance report."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        source_path = Path(source_file)
        
        report = f"""# Compliance Report

**Generated:** {timestamp}  
**File:** `{source_file}`  
**Type:** {source_path.suffix}  
**Agent:** Hybrid Multi-Agent Compliance System

---

## Executive Summary

This report documents the compliance analysis for changes to `{source_path.name}` in accordance with:
- ISO 13485 (Quality Management Systems for Medical Devices)
- IEC 62304 (Medical Device Software Lifecycle)
- FDA 21 CFR Part 11 (Electronic Records and Signatures)

---

## 1. Code Analysis

### Quality and Security Assessment

{analysis}

---

## 2. Regulatory Context

### Relevant Standards and Requirements

{context}

---

## 3. Compliance Documentation Draft

### ISO 13485 / IEC 62304 Documentation

{draft}

---

## 4. Verification Results

### watsonx.ai Authority Layer Review

{verification if verification else "Verification not performed"}

---

## 5. Recommendations

### Required Actions

Based on this analysis, the following actions are recommended:

1. **Review**: Quality Assurance team should review this report
2. **Documentation**: Update relevant design documentation
3. **Testing**: Ensure adequate test coverage for changes
4. **Traceability**: Update requirements traceability matrix
5. **Approval**: Obtain necessary approvals per change control process

---

## 6. Metadata

- **Processing Time:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
- **Local Model:** {Config.CODE_MODEL} (analysis), {Config.REASONING_MODEL} (drafting)
- **Authority Model:** {Config.WATSONX_MODEL_ID if self.watsonx and self.watsonx.enabled else "Not configured"}
- **RAG Context:** {len(context)} characters retrieved

---

*This report was automatically generated by the Hybrid Multi-Agent Compliance System.*
*Manual review by qualified personnel is required before implementation.*
"""
        return report
    
    def _determine_severity(self, analysis: str, verification: Optional[str]) -> str:
        """Determine severity level from analysis and verification."""
        text = (analysis + " " + (verification or "")).lower()
        
        if any(word in text for word in ['critical', 'severe', 'urgent', 'security vulnerability']):
            return 'critical'
        elif any(word in text for word in ['high', 'important', 'significant']):
            return 'high'
        elif any(word in text for word in ['medium', 'moderate', 'warning']):
            return 'medium'
        else:
            return 'low'
    
    def _extract_summary(self, draft: str) -> str:
        """Extract a brief summary from the compliance draft."""
        lines = draft.split('\n')
        summary_lines = []
        
        for line in lines[:10]:  # First 10 lines
            line = line.strip()
            if line and not line.startswith('#') and len(line) > 20:
                summary_lines.append(line)
                if len(summary_lines) >= 3:
                    break
        
        return ' '.join(summary_lines)[:200] if summary_lines else "Compliance analysis completed"
    
    def initial_ingestion(self):
        """Perform initial repository ingestion."""
        logger.info("Starting initial repository ingestion...")
        
        try:
            if Config.CHROMA_DB_PATH.exists() and not Config.ENABLE_CACHING:
                logger.info("Vector store exists and caching disabled - forcing re-ingestion")
                self.rag.ingest_repo(Config.REPO_PATH, force=True)
            elif not Config.CHROMA_DB_PATH.exists():
                logger.info("Vector store does not exist - performing initial ingestion")
                self.rag.ingest_repo(Config.REPO_PATH)
            else:
                logger.info("Vector store exists - performing incremental update")
                self.rag.ingest_repo(Config.REPO_PATH)
            
            # Log statistics
            stats = self.rag.get_statistics()
            logger.info(f"RAG Statistics: {stats}")
            
        except RAGPipelineError as e:
            logger.error(f"Ingestion failed: {e}")
            raise
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get agent statistics."""
        uptime = datetime.now() - self.stats["start_time"]
        
        return {
            **self.stats,
            "uptime_seconds": uptime.total_seconds(),
            "rag_stats": self.rag.get_statistics()
        }

# Made with Bob
