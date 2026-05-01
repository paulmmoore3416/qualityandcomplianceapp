#!/usr/bin/env python3
"""
Analyze git diffs for compliance.
"""
import subprocess
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from config import Config

logger = logging.getLogger(__name__)


class GitAnalyzer:
    """Analyze git diffs and commits for compliance."""
    
    def __init__(self, repo_path: Optional[Path] = None):
        """Initialize git analyzer."""
        self.repo_path = repo_path or Config.REPO_PATH
        
        if not self._is_git_repo():
            logger.warning(f"Not a git repository: {self.repo_path}")
    
    def _is_git_repo(self) -> bool:
        """Check if directory is a git repository."""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', '--git-dir'],
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def get_changed_files(
        self,
        base: str = 'HEAD',
        compare: Optional[str] = None,
        include_untracked: bool = False
    ) -> List[str]:
        """
        Get list of changed files.
        
        Args:
            base: Base commit/branch (default: HEAD)
            compare: Compare commit/branch (default: working directory)
            include_untracked: Include untracked files
            
        Returns:
            List of changed file paths
        """
        try:
            if compare:
                # Compare two commits/branches
                cmd = ['git', 'diff', '--name-only', base, compare]
            else:
                # Compare with working directory
                cmd = ['git', 'diff', '--name-only', base]
            
            result = subprocess.run(
                cmd,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            
            files = [f.strip() for f in result.stdout.split('\n') if f.strip()]
            
            # Add untracked files if requested
            if include_untracked and not compare:
                untracked = self._get_untracked_files()
                files.extend(untracked)
            
            # Filter by monitored extensions
            filtered_files = []
            for f in files:
                file_path = Path(f)
                if file_path.suffix in Config.MONITORED_EXTENSIONS:
                    filtered_files.append(f)
            
            logger.info(f"Found {len(filtered_files)} changed files (filtered from {len(files)})")
            return filtered_files
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Git command failed: {e}")
            return []
    
    def _get_untracked_files(self) -> List[str]:
        """Get list of untracked files."""
        try:
            result = subprocess.run(
                ['git', 'ls-files', '--others', '--exclude-standard'],
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            return [f.strip() for f in result.stdout.split('\n') if f.strip()]
        except subprocess.CalledProcessError:
            return []
    
    def get_diff(
        self,
        file_path: str,
        base: str = 'HEAD',
        compare: Optional[str] = None
    ) -> str:
        """
        Get diff for a specific file.
        
        Args:
            file_path: Path to file
            base: Base commit/branch
            compare: Compare commit/branch
            
        Returns:
            Diff content
        """
        try:
            if compare:
                cmd = ['git', 'diff', base, compare, '--', file_path]
            else:
                cmd = ['git', 'diff', base, '--', file_path]
            
            result = subprocess.run(
                cmd,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            
            return result.stdout
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to get diff for {file_path}: {e}")
            return ""
    
    def get_commit_info(self, commit: str = 'HEAD') -> Dict[str, Any]:
        """
        Get information about a commit.
        
        Args:
            commit: Commit hash or reference
            
        Returns:
            Commit information dictionary
        """
        try:
            # Get commit details
            result = subprocess.run(
                ['git', 'show', '--format=%H%n%an%n%ae%n%at%n%s%n%b', '--no-patch', commit],
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            
            lines = result.stdout.strip().split('\n')
            
            return {
                'hash': lines[0] if len(lines) > 0 else '',
                'author': lines[1] if len(lines) > 1 else '',
                'email': lines[2] if len(lines) > 2 else '',
                'timestamp': lines[3] if len(lines) > 3 else '',
                'subject': lines[4] if len(lines) > 4 else '',
                'body': '\n'.join(lines[5:]) if len(lines) > 5 else ''
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to get commit info: {e}")
            return {}
    
    def get_branch_name(self) -> str:
        """Get current branch name."""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError:
            return "unknown"
    
    def analyze_commit_message(self, message: str) -> Dict[str, Any]:
        """
        Analyze commit message for compliance keywords.
        
        Args:
            message: Commit message
            
        Returns:
            Analysis results
        """
        message_lower = message.lower()
        
        # Check for compliance-related keywords
        compliance_keywords = {
            'iso_13485': ['iso 13485', 'iso13485', 'quality management'],
            'iec_62304': ['iec 62304', 'iec62304', 'software lifecycle'],
            'fda_cfr': ['21 cfr', 'cfr part 11', 'fda'],
            'validation': ['validation', 'validated', 'verify', 'verification'],
            'risk': ['risk', 'hazard', 'safety'],
            'audit': ['audit', 'traceability', 'trace'],
            'documentation': ['documentation', 'document', 'spec', 'specification']
        }
        
        found_keywords = {}
        for category, keywords in compliance_keywords.items():
            matches = [kw for kw in keywords if kw in message_lower]
            if matches:
                found_keywords[category] = matches
        
        # Check for issue/ticket references
        issue_patterns = [
            r'#\d+',  # GitHub style
            r'[A-Z]+-\d+',  # Jira style
            r'issue[:\s]+\d+',  # Generic
        ]
        
        import re
        issues = []
        for pattern in issue_patterns:
            issues.extend(re.findall(pattern, message, re.IGNORECASE))
        
        return {
            'has_compliance_keywords': bool(found_keywords),
            'compliance_categories': list(found_keywords.keys()),
            'found_keywords': found_keywords,
            'has_issue_reference': bool(issues),
            'issue_references': issues,
            'message_length': len(message),
            'is_detailed': len(message) > 50  # Arbitrary threshold
        }
    
    def get_file_history(
        self,
        file_path: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get commit history for a file.
        
        Args:
            file_path: Path to file
            limit: Maximum number of commits
            
        Returns:
            List of commit information
        """
        try:
            result = subprocess.run(
                ['git', 'log', f'-{limit}', '--format=%H|%an|%ae|%at|%s', '--', file_path],
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            
            commits = []
            for line in result.stdout.strip().split('\n'):
                if not line:
                    continue
                
                parts = line.split('|')
                if len(parts) >= 5:
                    commits.append({
                        'hash': parts[0],
                        'author': parts[1],
                        'email': parts[2],
                        'timestamp': parts[3],
                        'subject': parts[4]
                    })
            
            return commits
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to get file history: {e}")
            return []
    
    def get_diff_stats(
        self,
        base: str = 'HEAD',
        compare: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get statistics about changes.
        
        Args:
            base: Base commit/branch
            compare: Compare commit/branch
            
        Returns:
            Statistics dictionary
        """
        try:
            if compare:
                cmd = ['git', 'diff', '--stat', base, compare]
            else:
                cmd = ['git', 'diff', '--stat', base]
            
            result = subprocess.run(
                cmd,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            
            # Parse stats
            lines = result.stdout.strip().split('\n')
            if not lines:
                return {'files_changed': 0, 'insertions': 0, 'deletions': 0}
            
            # Last line contains summary
            summary = lines[-1]
            
            import re
            files_match = re.search(r'(\d+) files? changed', summary)
            insertions_match = re.search(r'(\d+) insertions?', summary)
            deletions_match = re.search(r'(\d+) deletions?', summary)
            
            return {
                'files_changed': int(files_match.group(1)) if files_match else 0,
                'insertions': int(insertions_match.group(1)) if insertions_match else 0,
                'deletions': int(deletions_match.group(1)) if deletions_match else 0,
                'details': lines[:-1] if len(lines) > 1 else []
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to get diff stats: {e}")
            return {'files_changed': 0, 'insertions': 0, 'deletions': 0}
    
    def generate_change_summary(
        self,
        base: str = 'HEAD',
        compare: Optional[str] = None
    ) -> str:
        """
        Generate a summary of changes for compliance review.
        
        Args:
            base: Base commit/branch
            compare: Compare commit/branch
            
        Returns:
            Formatted summary
        """
        branch = self.get_branch_name()
        stats = self.get_diff_stats(base, compare)
        files = self.get_changed_files(base, compare)
        
        summary = f"""# Git Change Summary for Compliance Review

**Branch:** {branch}
**Comparison:** {base} {'→ ' + compare if compare else '→ working directory'}

## Statistics

- **Files Changed:** {stats['files_changed']}
- **Lines Added:** {stats['insertions']}
- **Lines Removed:** {stats['deletions']}

## Changed Files

"""
        
        # Group files by type
        files_by_type = {}
        for f in files:
            ext = Path(f).suffix or 'no extension'
            if ext not in files_by_type:
                files_by_type[ext] = []
            files_by_type[ext].append(f)
        
        for ext, file_list in sorted(files_by_type.items()):
            summary += f"\n### {ext} files ({len(file_list)})\n\n"
            for f in sorted(file_list):
                summary += f"- `{f}`\n"
        
        summary += "\n## Compliance Considerations\n\n"
        summary += "- Review all changes for regulatory impact\n"
        summary += "- Update traceability matrices as needed\n"
        summary += "- Ensure adequate test coverage\n"
        summary += "- Update documentation\n"
        summary += "- Obtain necessary approvals\n"
        
        return summary


def main():
    """CLI interface for git analysis."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze git changes for compliance')
    
    parser.add_argument(
        '--base',
        default='HEAD',
        help='Base commit/branch (default: HEAD)'
    )
    
    parser.add_argument(
        '--compare',
        help='Compare commit/branch (default: working directory)'
    )
    
    parser.add_argument(
        '--files',
        action='store_true',
        help='List changed files'
    )
    
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show diff statistics'
    )
    
    parser.add_argument(
        '--summary',
        action='store_true',
        help='Generate change summary'
    )
    
    parser.add_argument(
        '--repo',
        type=Path,
        help='Repository path (default: from config)'
    )
    
    args = parser.parse_args()
    
    analyzer = GitAnalyzer(args.repo)
    
    if args.files:
        files = analyzer.get_changed_files(args.base, args.compare)
        for f in files:
            print(f)
    
    elif args.stats:
        stats = analyzer.get_diff_stats(args.base, args.compare)
        import json
        print(json.dumps(stats, indent=2))
    
    elif args.summary:
        summary = analyzer.generate_change_summary(args.base, args.compare)
        print(summary)
    
    else:
        # Default: show summary
        summary = analyzer.generate_change_summary(args.base, args.compare)
        print(summary)


if __name__ == '__main__':
    main()

# Made with Bob
