export default function PrivacyPage() {
  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <p>This Privacy Policy explains how Classic Motor Market (“CMM,” “we,” “our,” “us”) collects, uses, and protects your information.</p>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
        
        <h3 className="font-semibold mt-4">1.1 Information You Provide</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Account details (name, email, phone number)</li>
          <li>Listings (vehicle details, images, descriptions)</li>
          <li>Messages or inquiries</li>
        </ul>

        <h3 className="font-semibold mt-4">1.2 Automatically Collected Information</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>IP address</li>
          <li>Browser & device data</li>
          <li>Cookies</li>
          <li>Usage analytics</li>
        </ul>

        <h3 className="font-semibold mt-4">1.3 Optional Information</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Payment information (if using paid services)</li>
          <li>Location data if enabled</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Operate and improve the marketplace</li>
          <li>Provide customer support</li>
          <li>Prevent fraud and ensure security</li>
          <li>Personalize your experience</li>
          <li>Send updates or service notices</li>
          <li>Enable interactions between buyers and sellers</li>
        </ul>
        <p className="mt-4">We do <strong>not</strong> sell personal information.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. Sharing of Information</h2>
        <p>We may share information with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Service providers (hosting, analytics, email)</li>
          <li>Legal authorities if required</li>
          <li>Other users when facilitating communication or transactions</li>
        </ul>
        <p className="mt-4">We do <strong>not</strong> share data with external advertisers unless stated.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Cookies & Tracking</h2>
        <p>We use cookies to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Improve usability</li>
          <li>Analyze performance</li>
          <li>Remember preferences</li>
        </ul>
        <p className="mt-4">Disabling cookies may affect functionality.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p>We implement reasonable security measures to protect your data, but cannot guarantee absolute security.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Retention</h2>
        <p>We retain data as long as:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your account is active</li>
          <li>Required for business or legal reasons</li>
        </ul>
        <p className="mt-4">You may request deletion at any time.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
        <p>You may request to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access your data</li>
          <li>Correct inaccurate information</li>
          <li>Delete your account/data</li>
          <li>Opt out of marketing communications</li>
        </ul>
        <p className="mt-4">Some restrictions may apply.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Children’s Privacy</h2>
        <p>CMM is not intended for individuals under 13. We do not knowingly collect children’s information.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy occasionally. Users will be notified of significant changes.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
        <p>privacy@classicmotormarket.com</p>
      </div>
    </div>
  )
}

