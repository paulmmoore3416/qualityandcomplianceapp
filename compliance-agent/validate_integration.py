#!/usr/bin/env python3
"""
Validation script to ensure compliance-agent is properly integrated with the main application.
"""
import sys
import os
from pathlib import Path
import json
from typing import List, Dict, Any
import subprocess

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text: str):
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_success(text: str):
    """Print success message."""
    print(f"{Colors.GREEN}✓{Colors.END} {text}")

def print_warning(text: str):
    """Print warning message."""
    print(f"{Colors.YELLOW}⚠{Colors.END} {text}")

def print_error(text: str):
    """Print error message."""
    print(f"{Colors.RED}✗{Colors.END} {text}")

def print_info(text: str):
    """Print info message."""
    print(f"{Colors.BLUE}ℹ{Colors.END} {text}")


class IntegrationValidator:
    """Validate compliance-agent integration."""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.successes = []
        self.agent_dir = Path(__file__).parent
        self.repo_dir = self.agent_dir.parent
    
    def validate_all(self) -> bool:
        """Run all validation checks."""
        print_header("Compliance Agent Integration Validation")
        
        checks = [
            ("Directory Structure", self.check_directory_structure),
            ("Configuration Files", self.check_configuration),
            ("Python Dependencies", self.check_dependencies),
            ("Ollama Connection", self.check_ollama),
            ("watsonx Configuration", self.check_watsonx),
            ("Vector Database", self.check_vector_db),
            ("Report Directory", self.check_reports_dir),
            ("Main App Integration", self.check_main_app),
            ("File Monitoring", self.check_monitoring),
            ("Notification Setup", self.check_notifications),
        ]
        
        for name, check_func in checks:
            print(f"\n{Colors.BOLD}Checking: {name}{Colors.END}")
            try:
                check_func()
            except Exception as e:
                self.errors.append(f"{name}: {str(e)}")
                print_error(f"Check failed: {e}")
        
        self.print_summary()
        return len(self.errors) == 0
    
    def check_directory_structure(self):
        """Validate directory structure."""
        required_dirs = [
            self.agent_dir,
            self.repo_dir / "src",
            self.repo_dir / "server",
        ]
        
        for dir_path in required_dirs:
            if dir_path.exists():
                print_success(f"Found: {dir_path.name}/")
            else:
                self.errors.append(f"Missing directory: {dir_path}")
                print_error(f"Missing: {dir_path}")
        
        # Check agent files
        required_files = [
            "main.py", "agent.py", "config.py", "monitor.py",
            "ollama_client.py", "watsonx_client.py", "rag_pipeline.py",
            "notifications.py", "search_reports.py", "git_analyzer.py",
            "requirements.txt", ".env.example", "README.md"
        ]
        
        for file_name in required_files:
            file_path = self.agent_dir / file_name
            if file_path.exists():
                print_success(f"Found: {file_name}")
            else:
                self.errors.append(f"Missing file: {file_name}")
                print_error(f"Missing: {file_name}")
    
    def check_configuration(self):
        """Validate configuration files."""
        # Check .env file
        env_file = self.agent_dir / ".env"
        env_example = self.agent_dir / ".env.example"
        
        if not env_file.exists():
            self.warnings.append(".env file not found - using defaults")
            print_warning(".env file not found (will use defaults)")
        else:
            print_success("Found .env file")
            
            # Check required variables
            with open(env_file) as f:
                env_content = f.read()
            
            required_vars = ["OLLAMA_BASE_URL", "REPO_PATH"]
            for var in required_vars:
                if var in env_content:
                    print_success(f"  {var} configured")
                else:
                    self.warnings.append(f"{var} not set in .env")
                    print_warning(f"  {var} not configured")
        
        if env_example.exists():
            print_success("Found .env.example")
        else:
            self.errors.append("Missing .env.example")
            print_error("Missing .env.example")
    
    def check_dependencies(self):
        """Check Python dependencies."""
        try:
            import ollama
            print_success("ollama package installed")
        except ImportError:
            self.errors.append("ollama package not installed")
            print_error("ollama package not installed")
        
        try:
            import langchain
            print_success("langchain package installed")
        except ImportError:
            self.errors.append("langchain package not installed")
            print_error("langchain package not installed")
        
        try:
            import watchdog
            print_success("watchdog package installed")
        except ImportError:
            self.errors.append("watchdog package not installed")
            print_error("watchdog package not installed")
        
        try:
            from dotenv import load_dotenv
            print_success("python-dotenv package installed")
        except ImportError:
            self.errors.append("python-dotenv package not installed")
            print_error("python-dotenv package not installed")
    
    def check_ollama(self):
        """Check Ollama connection and models."""
        try:
            result = subprocess.run(
                ['ollama', 'list'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                print_success("Ollama is running")
                
                # Check for required models
                output = result.stdout
                required_models = ['granite-code', 'mistral-nemo', 'mxbai-embed']
                
                for model in required_models:
                    if model in output:
                        print_success(f"  Model available: {model}")
                    else:
                        self.warnings.append(f"Model not found: {model}")
                        print_warning(f"  Model not found: {model}")
                        print_info(f"    Run: ollama pull {model}")
            else:
                self.errors.append("Ollama not responding")
                print_error("Ollama not responding")
        
        except FileNotFoundError:
            self.errors.append("Ollama not installed")
            print_error("Ollama not installed")
        except subprocess.TimeoutExpired:
            self.errors.append("Ollama connection timeout")
            print_error("Ollama connection timeout")
    
    def check_watsonx(self):
        """Check watsonx configuration."""
        env_file = self.agent_dir / ".env"
        
        if env_file.exists():
            with open(env_file) as f:
                env_content = f.read()
            
            if "WATSONX_APIKEY" in env_content and "your_apikey_here" not in env_content:
                print_success("watsonx API key configured")
            else:
                self.warnings.append("watsonx API key not configured")
                print_warning("watsonx API key not configured (optional)")
            
            if "WATSONX_PROJECT_ID" in env_content and "your_project_id" not in env_content:
                print_success("watsonx project ID configured")
            else:
                self.warnings.append("watsonx project ID not configured")
                print_warning("watsonx project ID not configured (optional)")
        else:
            self.warnings.append("watsonx not configured (optional)")
            print_warning("watsonx not configured (optional)")
    
    def check_vector_db(self):
        """Check vector database."""
        chroma_db = self.agent_dir / "chroma_db"
        
        if chroma_db.exists():
            # Check if it has content
            if any(chroma_db.iterdir()):
                print_success("Vector database exists and has content")
            else:
                self.warnings.append("Vector database is empty")
                print_warning("Vector database is empty (will be populated on first run)")
        else:
            self.warnings.append("Vector database not initialized")
            print_warning("Vector database not initialized (will be created on first run)")
    
    def check_reports_dir(self):
        """Check reports directory."""
        reports_dir = self.agent_dir / "compliance-reports"
        
        if reports_dir.exists():
            report_count = len(list(reports_dir.glob("*.md")))
            print_success(f"Reports directory exists ({report_count} reports)")
        else:
            print_info("Reports directory will be created on first run")
    
    def check_main_app(self):
        """Check main application integration points."""
        # Check if main app directories exist
        src_dir = self.repo_dir / "src"
        server_dir = self.repo_dir / "server"
        
        if src_dir.exists():
            print_success("Frontend directory found")
            
            # Check for TypeScript files
            ts_files = list(src_dir.glob("**/*.ts")) + list(src_dir.glob("**/*.tsx"))
            print_info(f"  Found {len(ts_files)} TypeScript files to monitor")
        else:
            self.warnings.append("Frontend directory not found")
            print_warning("Frontend directory not found")
        
        if server_dir.exists():
            print_success("Backend directory found")
            
            # Check for JavaScript files
            js_files = list(server_dir.glob("**/*.js"))
            print_info(f"  Found {len(js_files)} JavaScript files to monitor")
        else:
            self.warnings.append("Backend directory not found")
            print_warning("Backend directory not found")
    
    def check_monitoring(self):
        """Check file monitoring configuration."""
        try:
            sys.path.insert(0, str(self.agent_dir))
            from config import Config
            
            print_success(f"Monitoring path: {Config.REPO_PATH}")
            print_success(f"Monitored extensions: {len(Config.MONITORED_EXTENSIONS)}")
            print_info(f"  Extensions: {', '.join(Config.MONITORED_EXTENSIONS[:5])}...")
            print_success(f"Ignore patterns: {len(Config.IGNORE_PATTERNS)}")
            
        except Exception as e:
            self.errors.append(f"Config validation failed: {e}")
            print_error(f"Config validation failed: {e}")
    
    def check_notifications(self):
        """Check notification configuration."""
        env_file = self.agent_dir / ".env"
        
        if env_file.exists():
            with open(env_file) as f:
                env_content = f.read()
            
            # Check email
            if "ENABLE_EMAIL_NOTIFICATIONS=true" in env_content:
                if "SMTP_HOST" in env_content and "SMTP_USER" in env_content:
                    print_success("Email notifications configured")
                else:
                    self.warnings.append("Email enabled but SMTP not fully configured")
                    print_warning("Email enabled but SMTP not fully configured")
            else:
                print_info("Email notifications disabled")
            
            # Check Slack
            if "ENABLE_SLACK_NOTIFICATIONS=true" in env_content:
                if "SLACK_WEBHOOK_URL" in env_content and "hooks.slack.com" in env_content:
                    print_success("Slack notifications configured")
                else:
                    self.warnings.append("Slack enabled but webhook not configured")
                    print_warning("Slack enabled but webhook not configured")
            else:
                print_info("Slack notifications disabled")
        else:
            print_info("Notifications not configured (optional)")
    
    def print_summary(self):
        """Print validation summary."""
        print_header("Validation Summary")
        
        total_checks = len(self.successes) + len(self.warnings) + len(self.errors)
        
        print(f"\n{Colors.BOLD}Results:{Colors.END}")
        print(f"  {Colors.GREEN}✓ Successes:{Colors.END} {len(self.successes)}")
        print(f"  {Colors.YELLOW}⚠ Warnings:{Colors.END}  {len(self.warnings)}")
        print(f"  {Colors.RED}✗ Errors:{Colors.END}    {len(self.errors)}")
        
        if self.warnings:
            print(f"\n{Colors.BOLD}{Colors.YELLOW}Warnings:{Colors.END}")
            for warning in self.warnings:
                print(f"  {Colors.YELLOW}⚠{Colors.END} {warning}")
        
        if self.errors:
            print(f"\n{Colors.BOLD}{Colors.RED}Errors:{Colors.END}")
            for error in self.errors:
                print(f"  {Colors.RED}✗{Colors.END} {error}")
            print(f"\n{Colors.RED}Please fix the errors above before running the agent.{Colors.END}")
        else:
            print(f"\n{Colors.GREEN}{Colors.BOLD}✓ All critical checks passed!{Colors.END}")
            print(f"{Colors.GREEN}The compliance agent is properly integrated and ready to use.{Colors.END}")
        
        if self.warnings and not self.errors:
            print(f"\n{Colors.YELLOW}Note: Warnings indicate optional features that are not configured.{Colors.END}")
            print(f"{Colors.YELLOW}The agent will work but with limited functionality.{Colors.END}")
        
        print("\n" + "="*70 + "\n")


def main():
    """Main entry point."""
    validator = IntegrationValidator()
    success = validator.validate_all()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

# Made with Bob
