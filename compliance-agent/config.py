import os
import logging
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('compliance-agent.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class ConfigurationError(Exception):
    """Raised when configuration is invalid or missing."""
    pass


class Config:
    """Centralized configuration management with validation."""
    
    # watsonx.ai Configuration
    WATSONX_APIKEY: Optional[str] = os.getenv("WATSONX_APIKEY")
    WATSONX_URL: str = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    WATSONX_PROJECT_ID: Optional[str] = os.getenv("WATSONX_PROJECT_ID")
    WATSONX_MODEL_ID: str = os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-0-8b-instruct")
    
    # Ollama Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    CODE_MODEL: str = os.getenv("CODE_MODEL", "granite-code:8b")
    REASONING_MODEL: str = os.getenv("REASONING_MODEL", "mistral-nemo:12b")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "mxbai-embed-large")
    
    # Application Configuration
    REPO_PATH: Path = Path(os.getenv("REPO_PATH", "../")).resolve()
    CHROMA_DB_PATH: Path = Path(os.getenv("CHROMA_DB_PATH", "./chroma_db")).resolve()
    REPORTS_DIR: Path = Path(os.getenv("REPORTS_DIR", "./compliance-reports")).resolve()
    
    # Processing Configuration
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    DEBOUNCE_SECONDS: int = int(os.getenv("DEBOUNCE_SECONDS", "2"))
    MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_CONTENT_LENGTH", "4000"))
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "5"))
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    
    # Monitoring Configuration
    IGNORE_PATTERNS: list = [
        '.git', 'node_modules', 'dist', 'build', 'chroma_db',
        '__pycache__', '.pytest_cache', 'venv', 'env',
        '.DS_Store', '*.pyc', '*.log', 'compliance-reports'
    ]
    
    MONITORED_EXTENSIONS: list = [
        '.ts', '.tsx', '.js', '.jsx', '.py', '.java',
        '.cpp', '.c', '.h', '.cs', '.go', '.rs',
        '.vue', '.swift', '.kt', '.rb', '.php', '.scala'
    ]
    
    # Feature Flags
    ENABLE_WATSONX: bool = os.getenv("ENABLE_WATSONX", "true").lower() == "true"
    ENABLE_ASYNC: bool = os.getenv("ENABLE_ASYNC", "true").lower() == "true"
    ENABLE_CACHING: bool = os.getenv("ENABLE_CACHING", "true").lower() == "true"
    
    @classmethod
    def validate(cls) -> bool:
        """Validate configuration and log warnings for missing optional settings."""
        errors = []
        warnings = []
        
        # Check required paths
        if not cls.REPO_PATH.exists():
            errors.append(f"Repository path does not exist: {cls.REPO_PATH}")
        
        # Check Ollama configuration
        if not cls.OLLAMA_BASE_URL:
            errors.append("OLLAMA_BASE_URL is required")
        
        # Check watsonx configuration (optional but warn if incomplete)
        if cls.ENABLE_WATSONX:
            if not cls.WATSONX_APIKEY:
                warnings.append("WATSONX_APIKEY not set - watsonx verification will be disabled")
            if not cls.WATSONX_PROJECT_ID:
                warnings.append("WATSONX_PROJECT_ID not set - watsonx verification will be disabled")
        
        # Create necessary directories
        cls.CHROMA_DB_PATH.mkdir(parents=True, exist_ok=True)
        cls.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Log results
        if errors:
            for error in errors:
                logger.error(error)
            raise ConfigurationError(f"Configuration validation failed: {'; '.join(errors)}")
        
        if warnings:
            for warning in warnings:
                logger.warning(warning)
        
        logger.info("Configuration validated successfully")
        return True
    
    @classmethod
    def log_config(cls):
        """Log current configuration (excluding sensitive data)."""
        logger.info("=" * 60)
        logger.info("Compliance Agent Configuration")
        logger.info("=" * 60)
        logger.info(f"Repository Path: {cls.REPO_PATH}")
        logger.info(f"ChromaDB Path: {cls.CHROMA_DB_PATH}")
        logger.info(f"Reports Directory: {cls.REPORTS_DIR}")
        logger.info(f"Ollama URL: {cls.OLLAMA_BASE_URL}")
        logger.info(f"Code Model: {cls.CODE_MODEL}")
        logger.info(f"Reasoning Model: {cls.REASONING_MODEL}")
        logger.info(f"Embedding Model: {cls.EMBEDDING_MODEL}")
        logger.info(f"watsonx Enabled: {cls.ENABLE_WATSONX}")
        logger.info(f"watsonx Configured: {bool(cls.WATSONX_APIKEY and cls.WATSONX_PROJECT_ID)}")
        logger.info(f"Async Processing: {cls.ENABLE_ASYNC}")
        logger.info(f"Caching Enabled: {cls.ENABLE_CACHING}")
        logger.info("=" * 60)

# Made with Bob
