import time
import logging
from pathlib import Path
from typing import Callable, Set
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent
from config import Config

logger = logging.getLogger(__name__)


class RepoChangeHandler(FileSystemEventHandler):
    """Enhanced file system event handler with filtering and debouncing."""
    
    def __init__(self, callback: Callable[[str], None]):
        """
        Initialize handler.
        
        Args:
            callback: Function to call when a relevant file changes
        """
        super().__init__()
        self.callback = callback
        self.last_triggered: dict[str, float] = {}
        self.debounce_seconds = Config.DEBOUNCE_SECONDS
        self.processing: Set[str] = set()
        
        logger.info(f"File monitor initialized with {self.debounce_seconds}s debounce")
    
    def _should_ignore(self, path: str) -> bool:
        """Check if path should be ignored."""
        path_obj = Path(path)
        
        # Check ignore patterns
        for pattern in Config.IGNORE_PATTERNS:
            if pattern.startswith('*'):
                # Extension pattern
                if path_obj.suffix == pattern[1:]:
                    return True
            elif pattern in path:
                return True
        
        # Check if it's a monitored extension
        if Config.MONITORED_EXTENSIONS:
            if path_obj.suffix not in Config.MONITORED_EXTENSIONS:
                return True
        
        return False
    
    def _should_process(self, path: str) -> bool:
        """Check if file should be processed based on debouncing."""
        current_time = time.time()
        
        # Check if already processing
        if path in self.processing:
            logger.debug(f"Already processing: {path}")
            return False
        
        # Check debounce
        if path in self.last_triggered:
            time_since_last = current_time - self.last_triggered[path]
            if time_since_last < self.debounce_seconds:
                logger.debug(f"Debouncing {path} ({time_since_last:.1f}s since last)")
                return False
        
        return True
    
    def _handle_change(self, event: FileSystemEvent):
        """Handle a file change event."""
        if event.is_directory:
            return
        
        path = event.src_path
        
        # Check if should ignore
        if self._should_ignore(path):
            logger.debug(f"Ignoring: {path}")
            return
        
        # Check if should process
        if not self._should_process(path):
            return
        
        # Mark as processing
        self.processing.add(path)
        self.last_triggered[path] = time.time()
        
        try:
            logger.info(f"Detected change: {path}")
            self.callback(path)
        except Exception as e:
            logger.error(f"Error processing {path}: {e}")
        finally:
            # Remove from processing set
            self.processing.discard(path)
    
    def on_modified(self, event: FileSystemEvent):
        """Handle file modification events."""
        self._handle_change(event)
    
    def on_created(self, event: FileSystemEvent):
        """Handle file creation events."""
        self._handle_change(event)
    
    def get_statistics(self) -> dict:
        """Get monitoring statistics."""
        return {
            "tracked_files": len(self.last_triggered),
            "currently_processing": len(self.processing),
            "debounce_seconds": self.debounce_seconds
        }


def start_monitoring(path: Path, callback: Callable[[str], None]):
    """
    Start monitoring a directory for changes.
    
    Args:
        path: Path to monitor
        callback: Function to call when files change
    """
    if not path.exists():
        logger.error(f"Path does not exist: {path}")
        raise FileNotFoundError(f"Path does not exist: {path}")
    
    event_handler = RepoChangeHandler(callback)
    observer = Observer()
    observer.schedule(event_handler, str(path), recursive=True)
    observer.start()
    
    logger.info(f"Monitoring started: {path}")
    logger.info(f"Monitored extensions: {Config.MONITORED_EXTENSIONS}")
    logger.info(f"Ignore patterns: {Config.IGNORE_PATTERNS}")
    
    try:
        while True:
            time.sleep(1)
            
            # Periodically log statistics
            if int(time.time()) % 300 == 0:  # Every 5 minutes
                stats = event_handler.get_statistics()
                logger.info(f"Monitor stats: {stats}")
                
    except KeyboardInterrupt:
        logger.info("Stopping monitor...")
        observer.stop()
    except Exception as e:
        logger.error(f"Monitor error: {e}")
        observer.stop()
        raise
    finally:
        observer.join()
        logger.info("Monitor stopped")

# Made with Bob
