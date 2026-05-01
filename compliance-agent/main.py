import sys
import signal
import logging
from pathlib import Path
from agent import ComplianceAgent
from monitor import start_monitoring
from config import Config, ConfigurationError

logger = logging.getLogger(__name__)


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    logger.info(f"Received signal {signum}, shutting down...")
    sys.exit(0)


def print_banner():
    """Print startup banner."""
    banner = """
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   Hybrid Multi-Agent Compliance System                               ║
║   Medical Device Software Compliance Automation                      ║
║                                                                       ║
║   Standards: ISO 13485 | IEC 62304 | FDA 21 CFR Part 11             ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
"""
    print(banner)


def main():
    """Main entry point for the compliance agent."""
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Print banner
    print_banner()
    
    try:
        # Validate configuration
        logger.info("Validating configuration...")
        Config.validate()
        Config.log_config()
        
        # Initialize agent
        logger.info("Initializing Compliance Agent...")
        agent = ComplianceAgent()
        
        # Perform initial ingestion
        logger.info("=" * 80)
        logger.info("INITIAL REPOSITORY INGESTION")
        logger.info("=" * 80)
        agent.initial_ingestion()
        
        # Log statistics
        stats = agent.get_statistics()
        logger.info(f"Agent Statistics: {stats}")
        
        # Start monitoring
        logger.info("=" * 80)
        logger.info("STARTING FILE MONITORING")
        logger.info("=" * 80)
        logger.info(f"Repository: {Config.REPO_PATH}")
        logger.info(f"Reports: {Config.REPORTS_DIR}")
        logger.info(f"Monitored Extensions: {Config.MONITORED_EXTENSIONS}")
        logger.info("=" * 80)
        
        # Start the monitoring loop
        start_monitoring(Config.REPO_PATH, agent.process_change)
        
    except ConfigurationError as e:
        logger.error(f"Configuration error: {e}")
        logger.error("Please check your .env file and ensure all required settings are correct")
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Shutdown requested by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()

# Made with Bob
