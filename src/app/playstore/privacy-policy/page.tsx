import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | RPS Stationery',
  description: 'Privacy Policy for RPS Stationery Android App. Learn how we collect, use, and protect your information.',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      <div className="prose prose-sm max-w-none">
        <h1>Privacy Policy for RPS Stationery</h1>
          
        <p>
          <strong>Effective Date:</strong> March 2026
        </p>

        <p>
          Welcome to RPS Stationery! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. We are committed to protecting your privacy and ensuring you have a positive experience on our platform.
        </p>

        <h2>1. Information We Collect</h2>
          
        <h3>1.1 Personal Information</h3>
        <p>We collect the following personal information when you use our app:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register</li>
          <li><strong>Profile Information:</strong> Profile picture and preferences</li>
          <li><strong>Address Information:</strong> Delivery addresses including street address, city, state, and postal code</li>
        </ul>

        <h3>1.2 Order and Transaction Information</h3>
        <ul>
          <li>Products purchased (stationery items and cleaning materials)</li>
          <li>Order history and transaction details</li>
          <li>Payment information (processed securely through Razorpay - we do not store complete payment card details)</li>
        </ul>

        <h3>1.3 Device and Usage Information</h3>
        <ul>
          <li>Device type, operating system, and unique device identifiers</li>
          <li>IP address and location data (with your permission)</li>
          <li>App usage data, including pages viewed and features used</li>
        </ul>

        <h3>1.4 Communication Data</h3>
        <ul>
          <li>Customer support inquiries and correspondence</li>
          <li>Feedback and reviews you provide</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li><strong>Order Processing:</strong> To process and fulfill your orders for stationery and cleaning materials</li>
          <li><strong>Account Management:</strong> To create and manage your account</li>
          <li><strong>Payment Processing:</strong> To facilitate secure payment transactions</li>
          <li><strong>Delivery Services:</strong> To arrange delivery of products to your specified address</li>
          <li><strong>Customer Support:</strong> To respond to your inquiries and provide assistance</li>
          <li><strong>App Improvement:</strong> To analyze usage patterns and improve our services</li>
          <li><strong>Notifications:</strong> To send order updates, promotional offers, and important announcements</li>
          <li><strong>Security:</strong> To detect and prevent fraud and unauthorized access</li>
        </ul>

        <h2>3. Information Sharing and Disclosure</h2>
        <p>We may share your information with:</p>
        <ul>
          <li><strong>Service Providers:</strong> Third-party vendors who assist with payment processing (Razorpay), delivery services, and app infrastructure (Firebase/Google Cloud)</li>
          <li><strong>Business Partners:</strong> With your consent, for promotional purposes</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>

        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures to protect your information:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication using Firebase Authentication</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and monitoring</li>
        </ul>

        <h2>5. Your Rights and Choices</h2>
        <p>You have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct your information through the app</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data - <Link href="/playstore/data-deletion" className="text-blue-600 hover:underline font-medium">Click here to request data deletion</Link></li>
          <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
          <li><strong>Data Portability:</strong> Request your data in a portable format</li>
        </ul>

        <h2>6. Children's Privacy</h2>
        <p>Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.</p>

        <h2>7. Data Retention</h2>
        <p>We retain your personal information for as long as necessary to:</p>
        <ul>
          <li>Fulfill the purposes outlined in this policy</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes and enforce agreements</li>
        </ul>
        <p>You may request deletion of your account at any time through the app settings.</p>

        <h2>8. Third-Party Services</h2>
        <p>Our app integrates with the following third-party services:</p>
        <ul>
          <li><strong>Firebase (Google):</strong> Authentication, database, and analytics</li>
          <li><strong>Razorpay:</strong> Payment processing</li>
          <li><strong>Delivery Partners:</strong> Order fulfillment and logistics</li>
        </ul>
        <p>These services have their own privacy policies, and we encourage you to review them.</p>

        <h2>9. International Data Transfers</h2>
        <p>Your information may be transferred to and stored on servers located in India and other countries where our service providers operate. We ensure appropriate safeguards are in place for such transfers.</p>

        <h2>10. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or via email. Your continued use of the app after changes constitutes acceptance of the updated policy.</p>

        <h2>11. Contact Us</h2>
        <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> support@rpsstationery.com</li>
          <li><strong>Address:</strong> RPS Stationery, Jaipur, Rajasthan, India</li>
          <li><strong>Phone:</strong> +91-XXXXXXXXXX</li>
        </ul>

        <h2>12. Products and Services Offered</h2>
        <p>RPS Stationery offers:</p>
        <ul>
          <li><strong>Stationery Items:</strong> Pens, pencils, notebooks, art supplies, office supplies, school supplies, and related products</li>
          <li><strong>Cleaning Materials:</strong> Cleaning supplies, sanitizers, and related products</li>
        </ul>

        <h2>13. Consent</h2>
        <p>By using the RPS Stationery app, you consent to the collection, use, and sharing of your information as described in this Privacy Policy.</p>

        <hr />
          
        <p className="text-xs text-gray-600 italic">
          This Privacy Policy is designed to comply with Google Play Store requirements and applicable Indian data protection laws.
        </p>
      </div>
    </article>
  );
}
