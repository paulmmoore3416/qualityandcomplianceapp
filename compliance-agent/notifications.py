import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from pathlib import Path
from config import Config
import os

logger = logging.getLogger(__name__)


class NotificationError(Exception):
    """Raised when notification sending fails."""
    pass


class EmailNotifier:
    """Send email notifications for compliance reports."""
    
    def __init__(self):
        """Initialize email notifier with SMTP configuration."""
        self.enabled = self._validate_config()
        
        if self.enabled:
            self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
            self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
            self.smtp_user = os.getenv("SMTP_USER", "")
            self.smtp_password = os.getenv("SMTP_PASSWORD", "")
            self.from_email = os.getenv("SMTP_FROM", self.smtp_user)
            self.to_emails = os.getenv("SMTP_TO", "").split(",")
            self.to_emails = [email.strip() for email in self.to_emails if email.strip()]
            
            logger.info(f"Email notifications enabled: {self.smtp_host}:{self.smtp_port}")
        else:
            logger.info("Email notifications disabled - missing configuration")
    
    def _validate_config(self) -> bool:
        """Check if email configuration is complete."""
        enable_email = os.getenv("ENABLE_EMAIL_NOTIFICATIONS", "false").lower() == "true"
        
        if not enable_email:
            return False
        
        required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_TO"]
        missing = [var for var in required if not os.getenv(var)]
        
        if missing:
            logger.warning(f"Email notifications disabled - missing: {', '.join(missing)}")
            return False
        
        return True
    
    def send_report_notification(
        self,
        file_path: str,
        report_path: Path,
        severity: str = "medium",
        summary: str = ""
    ) -> bool:
        """
        Send email notification for a compliance report.
        
        Args:
            file_path: Path to the analyzed file
            report_path: Path to the generated report
            severity: Severity level (low, medium, high, critical)
            summary: Brief summary of findings
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            subject = self._generate_subject(file_path, severity)
            body = self._generate_body(file_path, report_path, severity, summary)
            
            return self._send_email(subject, body, html=True)
        except Exception as e:
            logger.error(f"Failed to send email notification: {e}")
            return False
    
    def _generate_subject(self, file_path: str, severity: str) -> str:
        """Generate email subject line."""
        severity_emoji = {
            "low": "ℹ️",
            "medium": "⚠️",
            "high": "🔴",
            "critical": "🚨"
        }
        
        emoji = severity_emoji.get(severity.lower(), "📋")
        filename = Path(file_path).name
        
        return f"{emoji} Compliance Report: {filename} [{severity.upper()}]"
    
    def _generate_body(
        self,
        file_path: str,
        report_path: Path,
        severity: str,
        summary: str
    ) -> str:
        """Generate HTML email body."""
        severity_colors = {
            "low": "#28a745",
            "medium": "#ffc107",
            "high": "#fd7e14",
            "critical": "#dc3545"
        }
        
        color = severity_colors.get(severity.lower(), "#6c757d")
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: {color};
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f8f9fa;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 0 0 5px 5px;
        }}
        .info-box {{
            background-color: white;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid {color};
            border-radius: 3px;
        }}
        .label {{
            font-weight: bold;
            color: #495057;
        }}
        .footer {{
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
        }}
        .button {{
            display: inline-block;
            padding: 10px 20px;
            background-color: {color};
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔍 Compliance Analysis Complete</h2>
        </div>
        <div class="content">
            <div class="info-box">
                <p><span class="label">File:</span> {file_path}</p>
                <p><span class="label">Severity:</span> <strong style="color: {color}">{severity.upper()}</strong></p>
                <p><span class="label">Report:</span> {report_path.name}</p>
            </div>
            
            {f'<div class="info-box"><p><span class="label">Summary:</span></p><p>{summary}</p></div>' if summary else ''}
            
            <p>A comprehensive compliance report has been generated and saved to:</p>
            <p><code>{report_path}</code></p>
            
            <p>Please review the report for detailed findings, regulatory context, and recommendations.</p>
            
            <h3>Next Steps:</h3>
            <ul>
                <li>Review the compliance report</li>
                <li>Address any critical or high-severity findings</li>
                <li>Update relevant documentation</li>
                <li>Obtain necessary approvals</li>
            </ul>
        </div>
        <div class="footer">
            <p>This is an automated notification from the Compliance Agent.</p>
            <p>For questions or issues, please contact your Quality Assurance team.</p>
        </div>
    </div>
</body>
</html>
"""
        return html
    
    def _send_email(self, subject: str, body: str, html: bool = False) -> bool:
        """
        Send email via SMTP.
        
        Args:
            subject: Email subject
            body: Email body
            html: Whether body is HTML
            
        Returns:
            True if sent successfully
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = ', '.join(self.to_emails)
            
            if html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {len(self.to_emails)} recipient(s)")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            raise NotificationError(f"Email sending failed: {e}")
    
    def send_batch_summary(
        self,
        total_files: int,
        reports_generated: int,
        errors: int,
        report_paths: List[Path]
    ) -> bool:
        """
        Send summary email for batch processing.
        
        Args:
            total_files: Total files processed
            reports_generated: Number of reports generated
            errors: Number of errors encountered
            report_paths: List of generated report paths
            
        Returns:
            True if sent successfully
        """
        if not self.enabled:
            return False
        
        subject = f"📊 Compliance Batch Summary: {reports_generated} Reports Generated"
        
        body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .stats {{ background-color: #f8f9fa; padding: 20px; border-radius: 5px; }}
        .stat-item {{ margin: 10px 0; }}
        .stat-label {{ font-weight: bold; }}
        .success {{ color: #28a745; }}
        .error {{ color: #dc3545; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>📊 Compliance Batch Processing Complete</h2>
        
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">Total Files Processed:</span> {total_files}
            </div>
            <div class="stat-item">
                <span class="stat-label success">Reports Generated:</span> {reports_generated}
            </div>
            <div class="stat-item">
                <span class="stat-label {'error' if errors > 0 else ''}">Errors:</span> {errors}
            </div>
        </div>
        
        <h3>Generated Reports:</h3>
        <ul>
            {''.join([f'<li>{path.name}</li>' for path in report_paths[:10]])}
            {f'<li>... and {len(report_paths) - 10} more</li>' if len(report_paths) > 10 else ''}
        </ul>
        
        <p>All reports have been saved to the compliance-reports directory.</p>
    </div>
</body>
</html>
"""
        
        try:
            return self._send_email(subject, body, html=True)
        except Exception as e:
            logger.error(f"Failed to send batch summary: {e}")
            return False


class SlackNotifier:
    """Send Slack notifications (webhook-based)."""
    
    def __init__(self):
        """Initialize Slack notifier."""
        self.enabled = os.getenv("ENABLE_SLACK_NOTIFICATIONS", "false").lower() == "true"
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")
        
        if self.enabled and not self.webhook_url:
            logger.warning("Slack notifications enabled but SLACK_WEBHOOK_URL not set")
            self.enabled = False
        
        if self.enabled:
            logger.info("Slack notifications enabled")
    
    def send_report_notification(
        self,
        file_path: str,
        report_path: Path,
        severity: str = "medium"
    ) -> bool:
        """Send Slack notification for compliance report."""
        if not self.enabled:
            return False
        
        try:
            import requests
            
            severity_emoji = {
                "low": ":information_source:",
                "medium": ":warning:",
                "high": ":red_circle:",
                "critical": ":rotating_light:"
            }
            
            emoji = severity_emoji.get(severity.lower(), ":clipboard:")
            
            payload = {
                "text": f"{emoji} *Compliance Report Generated*",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"{emoji} Compliance Report"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": f"*File:*\n`{Path(file_path).name}`"
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Severity:*\n{severity.upper()}"
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"Report saved to: `{report_path.name}`"
                        }
                    }
                ]
            }
            
            response = requests.post(self.webhook_url, json=payload)
            response.raise_for_status()
            
            logger.info("Slack notification sent successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send Slack notification: {e}")
            return False


class NotificationManager:
    """Manage multiple notification channels."""
    
    def __init__(self):
        """Initialize all notification channels."""
        self.email = EmailNotifier()
        self.slack = SlackNotifier()
        
        self.enabled_channels = []
        if self.email.enabled:
            self.enabled_channels.append("email")
        if self.slack.enabled:
            self.enabled_channels.append("slack")
        
        if self.enabled_channels:
            logger.info(f"Notifications enabled: {', '.join(self.enabled_channels)}")
        else:
            logger.info("No notification channels configured")
    
    def send_report_notification(
        self,
        file_path: str,
        report_path: Path,
        severity: str = "medium",
        summary: str = ""
    ):
        """Send notification via all enabled channels."""
        if self.email.enabled:
            self.email.send_report_notification(file_path, report_path, severity, summary)
        
        if self.slack.enabled:
            self.slack.send_report_notification(file_path, report_path, severity)
    
    def send_batch_summary(
        self,
        total_files: int,
        reports_generated: int,
        errors: int,
        report_paths: List[Path]
    ):
        """Send batch summary via all enabled channels."""
        if self.email.enabled:
            self.email.send_batch_summary(total_files, reports_generated, errors, report_paths)

# Made with Bob
