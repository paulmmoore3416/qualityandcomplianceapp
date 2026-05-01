"""Tests for configuration module."""
import os
import pytest
from pathlib import Path
from config import Config, ConfigurationError


def test_config_defaults():
    """Test default configuration values."""
    assert Config.OLLAMA_BASE_URL == os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    assert Config.CODE_MODEL == os.getenv("CODE_MODEL", "granite-code:8b")
    assert Config.REASONING_MODEL == os.getenv("REASONING_MODEL", "mistral-nemo:12b")
    assert Config.EMBEDDING_MODEL == os.getenv("EMBEDDING_MODEL", "mxbai-embed-large")


def test_config_paths():
    """Test path configuration."""
    assert isinstance(Config.REPO_PATH, Path)
    assert isinstance(Config.CHROMA_DB_PATH, Path)
    assert isinstance(Config.REPORTS_DIR, Path)


def test_config_validation():
    """Test configuration validation."""
    # Should not raise if repo path exists
    try:
        Config.validate()
    except ConfigurationError as e:
        # Only fail if it's not about missing watsonx credentials
        if "WATSONX" not in str(e):
            pytest.fail(f"Unexpected configuration error: {e}")


def test_ignore_patterns():
    """Test ignore patterns are defined."""
    assert isinstance(Config.IGNORE_PATTERNS, list)
    assert '.git' in Config.IGNORE_PATTERNS
    assert 'node_modules' in Config.IGNORE_PATTERNS


def test_monitored_extensions():
    """Test monitored extensions are defined."""
    assert isinstance(Config.MONITORED_EXTENSIONS, list)
    assert '.ts' in Config.MONITORED_EXTENSIONS
    assert '.py' in Config.MONITORED_EXTENSIONS


def test_feature_flags():
    """Test feature flags."""
    assert isinstance(Config.ENABLE_WATSONX, bool)
    assert isinstance(Config.ENABLE_ASYNC, bool)
    assert isinstance(Config.ENABLE_CACHING, bool)

# Made with Bob
