#!/usr/bin/env python3
"""
Search and filter compliance reports.
"""
import argparse
import json
import re
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from config import Config


class ReportSearcher:
    """Search and filter compliance reports."""
    
    def __init__(self, reports_dir: Optional[Path] = None):
        """Initialize report searcher."""
        self.reports_dir = reports_dir or Config.REPORTS_DIR
        
        if not self.reports_dir.exists():
            print(f"Reports directory not found: {self.reports_dir}")
            self.reports_dir.mkdir(parents=True, exist_ok=True)
    
    def search(
        self,
        query: Optional[str] = None,
        severity: Optional[str] = None,
        file_pattern: Optional[str] = None,
        days: Optional[int] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Search reports with filters.
        
        Args:
            query: Text to search for in reports
            severity: Filter by severity (low, medium, high, critical)
            file_pattern: Filter by source file pattern
            days: Only show reports from last N days
            limit: Maximum number of results
            
        Returns:
            List of matching reports with metadata
        """
        results = []
        cutoff_date = None
        
        if days:
            cutoff_date = datetime.now() - timedelta(days=days)
        
        # Get all report files
        report_files = sorted(
            self.reports_dir.glob("*.md"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        
        for report_file in report_files:
            # Check date filter
            if cutoff_date:
                file_time = datetime.fromtimestamp(report_file.stat().st_mtime)
                if file_time < cutoff_date:
                    continue
            
            # Read report
            try:
                with open(report_file, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                print(f"Error reading {report_file}: {e}")
                continue
            
            # Extract metadata
            metadata = self._extract_metadata(content, report_file)
            
            # Apply filters
            if severity and metadata.get('severity', '').lower() != severity.lower():
                continue
            
            if file_pattern and not re.search(file_pattern, metadata.get('source_file', '')):
                continue
            
            if query and query.lower() not in content.lower():
                continue
            
            # Add to results
            results.append({
                'file': report_file.name,
                'path': str(report_file),
                'size': report_file.stat().st_size,
                'modified': datetime.fromtimestamp(report_file.stat().st_mtime).isoformat(),
                **metadata
            })
            
            if len(results) >= limit:
                break
        
        return results
    
    def _extract_metadata(self, content: str, file_path: Path) -> Dict[str, Any]:
        """Extract metadata from report content."""
        metadata = {}
        
        # Extract source file
        file_match = re.search(r'\*\*File:\*\*\s*`([^`]+)`', content)
        if file_match:
            metadata['source_file'] = file_match.group(1)
        
        # Extract severity (look for common severity indicators)
        severity_patterns = [
            (r'critical', 'critical'),
            (r'high[- ]severity', 'high'),
            (r'medium[- ]severity', 'medium'),
            (r'low[- ]severity', 'low')
        ]
        
        for pattern, level in severity_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                metadata['severity'] = level
                break
        
        if 'severity' not in metadata:
            metadata['severity'] = 'unknown'
        
        # Extract timestamp
        time_match = re.search(r'\*\*Generated:\*\*\s*([^\n]+)', content)
        if time_match:
            metadata['generated'] = time_match.group(1).strip()
        
        # Count findings (look for numbered lists or bullet points in findings sections)
        findings_section = re.search(
            r'##\s*(?:Code Analysis|Findings|Issues)(.*?)(?=##|\Z)',
            content,
            re.DOTALL | re.IGNORECASE
        )
        
        if findings_section:
            findings_text = findings_section.group(1)
            # Count numbered items or bullet points
            numbered = len(re.findall(r'^\d+\.', findings_text, re.MULTILINE))
            bullets = len(re.findall(r'^[-*]', findings_text, re.MULTILINE))
            metadata['findings_count'] = max(numbered, bullets)
        else:
            metadata['findings_count'] = 0
        
        return metadata
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about all reports."""
        reports = self.search(limit=10000)  # Get all
        
        if not reports:
            return {
                'total_reports': 0,
                'message': 'No reports found'
            }
        
        # Calculate statistics
        severity_counts = {}
        file_types = {}
        total_findings = 0
        
        for report in reports:
            # Count by severity
            severity = report.get('severity', 'unknown')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            # Count by file type
            source_file = report.get('source_file', '')
            if source_file:
                ext = Path(source_file).suffix
                file_types[ext] = file_types.get(ext, 0) + 1
            
            # Sum findings
            total_findings += report.get('findings_count', 0)
        
        # Get date range
        dates = [r['modified'] for r in reports if 'modified' in r]
        
        return {
            'total_reports': len(reports),
            'severity_breakdown': severity_counts,
            'file_types': file_types,
            'total_findings': total_findings,
            'average_findings': total_findings / len(reports) if reports else 0,
            'date_range': {
                'oldest': min(dates) if dates else None,
                'newest': max(dates) if dates else None
            }
        }
    
    def export_results(self, results: List[Dict[str, Any]], format: str = 'json') -> str:
        """
        Export search results in various formats.
        
        Args:
            results: Search results
            format: Output format (json, csv, markdown)
            
        Returns:
            Formatted output string
        """
        if format == 'json':
            return json.dumps(results, indent=2)
        
        elif format == 'csv':
            if not results:
                return "No results"
            
            # CSV header
            headers = ['file', 'source_file', 'severity', 'findings_count', 'modified']
            lines = [','.join(headers)]
            
            # CSV rows
            for r in results:
                row = [
                    r.get('file', ''),
                    r.get('source_file', ''),
                    r.get('severity', ''),
                    str(r.get('findings_count', 0)),
                    r.get('modified', '')
                ]
                lines.append(','.join(f'"{v}"' for v in row))
            
            return '\n'.join(lines)
        
        elif format == 'markdown':
            if not results:
                return "No results found."
            
            lines = ['# Compliance Report Search Results\n']
            lines.append(f'**Total Results:** {len(results)}\n')
            
            for i, r in enumerate(results, 1):
                lines.append(f'## {i}. {r.get("file", "Unknown")}')
                lines.append(f'- **Source:** `{r.get("source_file", "N/A")}`')
                lines.append(f'- **Severity:** {r.get("severity", "unknown").upper()}')
                lines.append(f'- **Findings:** {r.get("findings_count", 0)}')
                lines.append(f'- **Modified:** {r.get("modified", "N/A")}')
                lines.append(f'- **Path:** `{r.get("path", "N/A")}`')
                lines.append('')
            
            return '\n'.join(lines)
        
        else:
            return f"Unknown format: {format}"


def main():
    """CLI interface for report search."""
    parser = argparse.ArgumentParser(
        description='Search and filter compliance reports',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Search for "security" in reports
  python search_reports.py --query security
  
  # Find high severity reports from last 7 days
  python search_reports.py --severity high --days 7
  
  # Search reports for specific file
  python search_reports.py --file-pattern "app.ts"
  
  # Get statistics
  python search_reports.py --stats
  
  # Export results as CSV
  python search_reports.py --query "ISO 13485" --format csv
        '''
    )
    
    parser.add_argument(
        '--query', '-q',
        help='Search query (case-insensitive)'
    )
    
    parser.add_argument(
        '--severity', '-s',
        choices=['low', 'medium', 'high', 'critical'],
        help='Filter by severity level'
    )
    
    parser.add_argument(
        '--file-pattern', '-f',
        help='Filter by source file pattern (regex)'
    )
    
    parser.add_argument(
        '--days', '-d',
        type=int,
        help='Only show reports from last N days'
    )
    
    parser.add_argument(
        '--limit', '-l',
        type=int,
        default=50,
        help='Maximum number of results (default: 50)'
    )
    
    parser.add_argument(
        '--format',
        choices=['json', 'csv', 'markdown'],
        default='markdown',
        help='Output format (default: markdown)'
    )
    
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show statistics instead of search results'
    )
    
    parser.add_argument(
        '--reports-dir',
        type=Path,
        help='Custom reports directory (default: from config)'
    )
    
    args = parser.parse_args()
    
    # Initialize searcher
    searcher = ReportSearcher(args.reports_dir)
    
    # Show statistics
    if args.stats:
        stats = searcher.get_statistics()
        print(json.dumps(stats, indent=2))
        return
    
    # Perform search
    results = searcher.search(
        query=args.query,
        severity=args.severity,
        file_pattern=args.file_pattern,
        days=args.days,
        limit=args.limit
    )
    
    # Export results
    output = searcher.export_results(results, args.format)
    print(output)
    
    # Summary
    if results and args.format == 'markdown':
        print(f'\n---\n**Found {len(results)} report(s)**')


if __name__ == '__main__':
    main()

# Made with Bob
