export default function TermsPage() {
  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <p>Welcome to <strong>Classic Motor Market</strong> (“CMM,” “we,” “our,” “us”). These Terms of Service (“Terms”) govern your use of our website, services, and marketplace platform (the “Service”).</p>
        <p>By accessing or using Classic Motor Market, you agree to these Terms.</p>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-4">1. Eligibility</h2>
        <p>You must be at least 18 years old to use this platform. By using CMM, you represent that you have the legal capacity to enter into a binding agreement.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Marketplace Platform</h2>
        <p>Classic Motor Market provides an online platform for listing, browsing, and connecting buyers and sellers of vehicles and related automotive items.</p>
        <p>We:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Do not own vehicles listed by users</li>
          <li>Do not guarantee the condition, accuracy, or availability of any listing</li>
          <li>Are not a party to transactions between buyers and sellers</li>
        </ul>
        <p className="mt-4">All negotiations and purchases occur independently between users.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p>You are responsible for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Maintaining account confidentiality</li>
          <li>All activity under your login</li>
          <li>Providing accurate, truthful information</li>
        </ul>
        <p className="mt-4">We reserve the right to suspend or terminate accounts for fraudulent or harmful activity.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Listings & Content</h2>
        <p>Users may create listings with text, images, and media. By submitting content, you grant us a license to display and distribute it.</p>
        <p>You may not post:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>False or misleading information</li>
          <li>Stolen or copyright-infringing content</li>
          <li>Offensive, illegal, or harmful material</li>
        </ul>
        <p className="mt-4">We may remove any content that violates our policies.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Transactions</h2>
        <p>Classic Motor Market is <strong>not</strong> responsible for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Payment disputes</li>
          <li>Failed transactions</li>
          <li>Vehicle condition, legality, or title issues</li>
          <li>Taxes, inspections, or registration</li>
        </ul>
        <p className="mt-4">Buyers and sellers must conduct due diligence and comply with local laws.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Fees</h2>
        <p>Some services may require fees (e.g., premium listings). All fees are disclosed before purchase and are non-refundable unless stated.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Prohibited Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the platform for illegal purposes</li>
          <li>Hack, disrupt, or misuse the Service</li>
          <li>Scrape data</li>
          <li>Post spam or fraudulent content</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Disclaimer of Warranties</h2>
        <p>The Service is provided <strong>“as is”</strong> without warranties of any kind. We do not guarantee accuracy, uptime, or security.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
        <p>CMM is not responsible for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Losses from transactions</li>
          <li>Damage to vehicles or property</li>
          <li>Fraud by users</li>
          <li>Technical outages</li>
        </ul>
        <p className="mt-4">Your sole remedy is discontinuing use of the Service.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
        <p>We may update these Terms at any time. Continued use constitutes acceptance of updated Terms.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
        <p>support@classicmotormarket.com</p>
      </div>
    </div>
  )
}

