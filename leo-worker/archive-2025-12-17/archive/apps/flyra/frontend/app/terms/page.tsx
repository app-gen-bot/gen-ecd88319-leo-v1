'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardNav />}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 13, 2025</p>
        </div>

        <Card>
          <CardContent className="prose dark:prose-invert max-w-none pt-6">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Flyra ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  Flyra provides international money transfer services using blockchain technology and stablecoins. We facilitate transfers from the United States to supported international destinations through partnerships with local payment providers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Eligibility</h2>
                <p className="text-muted-foreground">
                  You must be at least 18 years old and a legal resident of the United States to use our services. By using Flyra, you represent and warrant that you meet these eligibility requirements.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Account Registration</h2>
                <p className="text-muted-foreground">
                  To use our services, you must create an account and provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Know Your Customer (KYC) Requirements</h2>
                <p className="text-muted-foreground">
                  As a regulated money transmitter, we are required to verify your identity. You agree to provide all requested documentation and information for identity verification purposes. We reserve the right to suspend or terminate accounts that fail to complete verification.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Transfer Limits and Restrictions</h2>
                <p className="text-muted-foreground">
                  Individual transfers are limited to a minimum of $1 and maximum of $2,999. Daily and monthly limits may apply based on your verification status. We reserve the right to modify these limits at our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Fees and Exchange Rates</h2>
                <p className="text-muted-foreground">
                  We charge a flat fee of $2.99 per transfer. Exchange rates are provided at the time of transfer and are based on real-time market rates. The total cost and amount to be received will be clearly displayed before you confirm any transfer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-2">You agree not to use Flyra for any of the following:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Any illegal activities or purposes</li>
                  <li>Money laundering or terrorist financing</li>
                  <li>Fraud or deceptive practices</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Circumventing our security measures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Transaction Processing</h2>
                <p className="text-muted-foreground">
                  While most transfers are completed instantly, processing times may vary based on recipient location and payment method. We are not responsible for delays caused by third-party payment providers or banking systems.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Refunds and Cancellations</h2>
                <p className="text-muted-foreground">
                  Due to the instant nature of our transfers, transactions cannot be cancelled once confirmed. Refunds may be available in limited circumstances at our sole discretion. Contact customer support for assistance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Privacy and Data Protection</h2>
                <p className="text-muted-foreground">
                  Your use of our services is also governed by our Privacy Policy. We are committed to protecting your personal information and maintaining the security of your data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, Flyra shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to indemnify and hold harmless Flyra, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of the service or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Dispute Resolution</h2>
                <p className="text-muted-foreground">
                  Any disputes arising from these terms or your use of Flyra shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">15. Modifications to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify you of any material changes via email or through the service. Your continued use of Flyra after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">16. Governing Law</h2>
                <p className="text-muted-foreground">
                  These terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">17. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at:
                  <br /><br />
                  Flyra, Inc.<br />
                  123 Main Street<br />
                  San Francisco, CA 94105<br />
                  Email: legal@flyra.com<br />
                  Phone: 1-800-FLYRA-US
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}