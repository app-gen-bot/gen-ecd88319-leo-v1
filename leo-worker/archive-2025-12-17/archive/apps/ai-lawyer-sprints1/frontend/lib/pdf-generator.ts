import jsPDF from 'jspdf';
import type { ChatMessage, Citation } from '@/shared/types/api';

export class PDFGenerator {
  private doc: jsPDF;
  private pageHeight: number = 280;
  private pageWidth: number = 190;
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 7;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }

  private checkPageBreak(requiredSpace: number = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addText(text: string, fontSize: number = 12, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...color);
    if (isBold) {
      this.doc.setFont('helvetica', 'bold');
    } else {
      this.doc.setFont('helvetica', 'normal');
    }

    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    const requiredSpace = lines.length * this.lineHeight;
    this.checkPageBreak(requiredSpace);

    lines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private addSeparator() {
    this.checkPageBreak(10);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
  }

  generateConversationPDF(
    conversationTitle: string,
    messages: ChatMessage[],
    userName: string,
    conversationDate: string
  ): Blob {
    // Header
    this.addText('AI Tenant Rights Advisor', 20, true, [37, 99, 235]);
    this.currentY += 5;
    this.addText('Conversation Export', 16, true);
    this.currentY += 10;

    // Metadata
    this.addText(`User: ${userName}`, 10);
    this.addText(`Date: ${conversationDate}`, 10);
    this.addText(`Title: ${conversationTitle}`, 10);
    this.currentY += 5;
    this.addSeparator();

    // Messages
    messages.forEach((message, index) => {
      // Add spacing between messages
      if (index > 0) {
        this.currentY += 5;
      }

      // Message header
      const isUser = message.role === 'user';
      const timestamp = new Date(message.timestamp).toLocaleString();
      
      this.addText(
        `${isUser ? 'You' : 'AI Legal Advisor'} - ${timestamp}`,
        10,
        true,
        isUser ? [74, 144, 226] : [40, 167, 69]
      );
      this.currentY += 2;

      // Message content
      this.addText(message.content, 11);

      // Citations if present
      if (message.citations && message.citations.length > 0) {
        this.currentY += 3;
        this.addText('Legal References:', 9, true, [108, 117, 125]);
        message.citations.forEach((citation: Citation) => {
          const citationText = `• ${citation.law} ${citation.section} - ${citation.text}`;
          this.addText(citationText, 9, false, [52, 58, 64]);
        });
      }

      // Add separator between messages
      if (index < messages.length - 1) {
        this.currentY += 3;
        this.addSeparator();
      }
    });

    // Footer
    this.currentY = this.pageHeight - 30;
    this.addSeparator();
    this.addText(
      'This service provides legal information, not legal advice. Always consult with a qualified attorney.',
      8,
      false,
      [108, 117, 125]
    );
    this.addText('Powered by PlanetScale', 8, false, [108, 117, 125]);
    this.addText(`Generated on ${new Date().toLocaleString()}`, 8, false, [108, 117, 125]);

    // Return as blob
    return this.doc.output('blob');
  }

  generateConversationSummaryPDF(
    conversations: Array<{
      id: string;
      title: string;
      created_at: string;
      message_count: number;
      last_message_at: string;
    }>,
    userName: string
  ): Blob {
    // Header
    this.addText('AI Tenant Rights Advisor', 20, true, [37, 99, 235]);
    this.currentY += 5;
    this.addText('Conversation History', 16, true);
    this.currentY += 10;

    // Metadata
    this.addText(`User: ${userName}`, 10);
    this.addText(`Total Conversations: ${conversations.length}`, 10);
    this.addText(`Export Date: ${new Date().toLocaleDateString()}`, 10);
    this.currentY += 5;
    this.addSeparator();

    // Conversations list
    conversations.forEach((conv, index) => {
      this.checkPageBreak(25);
      
      // Conversation title
      this.addText(`${index + 1}. ${conv.title}`, 12, true);
      
      // Conversation details
      this.addText(`Created: ${new Date(conv.created_at).toLocaleDateString()}`, 10);
      this.addText(`Messages: ${conv.message_count}`, 10);
      this.addText(`Last Activity: ${new Date(conv.last_message_at).toLocaleString()}`, 10);
      
      if (index < conversations.length - 1) {
        this.currentY += 3;
        this.addSeparator();
      }
    });

    // Footer
    this.currentY = this.pageHeight - 25;
    this.addSeparator();
    this.addText('Powered by PlanetScale', 8, false, [108, 117, 125]);
    this.addText(`Generated on ${new Date().toLocaleString()}`, 8, false, [108, 117, 125]);

    return this.doc.output('blob');
  }
}

// Helper function to download PDF
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}