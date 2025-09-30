// Email Service for Google Workspace
// This service handles email sending through Google Workspace SMTP

export interface EmailData {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

class EmailService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private fromEmail: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    this.fromEmail = 'koratnrs@rockchatn.com';
  }

  /**
   * Send email through Supabase Edge Function with Google Workspace SMTP
   */
  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      console.log('📧 Sending email via Supabase Edge Function:', {
        from: this.fromEmail,
        to: emailData.to,
        cc: emailData.cc,
        subject: emailData.subject
      });

      const edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/send-email`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          replyTo: emailData.replyTo || this.fromEmail,
          to: emailData.to,
          cc: emailData.cc || [],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text || this.htmlToText(emailData.html)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('✅ Email sent successfully:', result);

      return {
        success: true,
        message: 'อีเมลถูกส่งเรียบร้อยแล้ว'
      };

    } catch (error) {
      console.error('❌ Email sending error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งอีเมล';

      return {
        success: false,
        message: 'ไม่สามารถส่งอีเมลได้',
        error: errorMessage
      };
    }
  }

  /**
   * Convert HTML to plain text for fallback
   */
  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate multiple email addresses
   */
  validateEmails(emails: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    emails.forEach(email => {
      if (this.validateEmail(email.trim())) {
        valid.push(email.trim());
      } else {
        invalid.push(email);
      }
    });

    return { valid, invalid };
  }

  /**
   * Format email addresses for display
   */
  formatEmailList(emails: string[]): string {
    return emails.join(', ');
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for external use
export type { EmailData, EmailResponse };
