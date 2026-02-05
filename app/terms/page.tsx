export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-zinc-50 sm:text-5xl">
            Terms and Conditions
          </h1>
          <p className="text-sm text-zinc-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          {/* Important Notice */}
          <section className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6">
            <h2 className="mb-3 text-xl font-semibold text-yellow-300">
              Important Notice
            </h2>
            <p className="text-zinc-200">
              This application is a <strong>portfolio and educational project</strong> created for the purpose of 
              experimenting with Google's Gemini API and exploring how AI can be used in daily life. 
              This is <strong>not a commercial product</strong> and is not intended for commercial use or distribution.
            </p>
          </section>

          {/* Project Purpose */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              1. Project Purpose
            </h2>
            <p className="mb-4">
              Video Insights is a personal portfolio project designed to:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>Demonstrate technical skills in web development and AI integration</li>
              <li>Experiment with Google's Gemini API for video analysis</li>
              <li>Explore practical applications of AI in everyday scenarios</li>
              <li>Serve as a learning and experimentation platform</li>
            </ul>
            <p>
              This project is provided "as-is" for educational and demonstration purposes only.
            </p>
          </section>

          {/* API Key Responsibility */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              2. Bring Your Own API Key (BYOAK)
            </h2>
            <p className="mb-4">
              This application operates on a "bring your own API key" model. Users are responsible for:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>Obtaining their own Google Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline">Google AI Studio</a></li>
              <li>Securing and protecting their API key</li>
              <li>Managing their own API usage and associated costs</li>
              <li>Complying with Google's API terms of service</li>
            </ul>
            <p className="mb-4">
              The application does not provide API keys, manage API quotas, or assume responsibility for 
              any costs incurred through API usage.
            </p>
          </section>

          {/* No Warranty */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              3. No Warranty or Guarantee
            </h2>
            <p className="mb-4">
              This application is provided without any warranty, express or implied. Specifically:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>No guarantee of availability, reliability, or uptime</li>
              <li>No guarantee of accuracy in video analysis or transcription</li>
              <li>No guarantee of data security or privacy</li>
              <li>No guarantee of compatibility with all video sources</li>
            </ul>
            <p>
              Users acknowledge that this is an experimental project and use it at their own risk.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              4. Limitation of Liability
            </h2>
            <p className="mb-4">
              To the fullest extent permitted by law:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>The developer(s) shall not be liable for any direct, indirect, incidental, or consequential damages</li>
              <li>The developer(s) shall not be liable for any loss of data, revenue, or business opportunities</li>
              <li>The developer(s) shall not be liable for any issues arising from API usage or third-party services</li>
              <li>The developer(s) shall not be liable for any security breaches or data leaks</li>
            </ul>
            <p>
              Users agree to hold harmless the developer(s) from any claims, damages, or liabilities 
              arising from the use of this application.
            </p>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              5. Data and Privacy
            </h2>
            <p className="mb-4">
              While this project aims to respect user privacy:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>No guarantee is provided regarding data security or encryption</li>
              <li>Video URLs and analysis results may be stored in databases</li>
              <li>API keys are stored locally in browser storage and are the user's responsibility</li>
              <li>Users should not upload sensitive or confidential content</li>
            </ul>
            <p>
              Users are advised to review the Privacy Policy (if available) and use this application 
              with appropriate caution regarding sensitive information.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              6. Third-Party Services
            </h2>
            <p className="mb-4">
              This application integrates with third-party services:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li><strong>Google Gemini API:</strong> Subject to Google's terms of service and API usage policies</li>
              <li><strong>Supabase:</strong> Used for authentication and data storage, subject to Supabase's terms</li>
              <li><strong>YouTube:</strong> Video content is processed from YouTube URLs, subject to YouTube's terms</li>
            </ul>
            <p>
              Users must comply with all applicable third-party terms of service. The developer(s) 
              are not responsible for any issues arising from third-party service changes, outages, 
              or policy updates.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              7. Intellectual Property
            </h2>
            <p className="mb-4">
              This project is a portfolio piece:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>The application code and design are the property of the developer(s)</li>
              <li>Video content analyzed remains the property of its original creators</li>
              <li>AI-generated summaries and insights are provided for informational purposes only</li>
              <li>Users may not claim ownership of AI-generated content</li>
            </ul>
            <p>
              Users should respect copyright and intellectual property rights when using video content 
              for analysis.
            </p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              8. Prohibited Uses
            </h2>
            <p className="mb-4">
              Users agree not to:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>Use this application for any commercial purposes</li>
              <li>Attempt to reverse engineer or extract the source code</li>
              <li>Use the application to violate any laws or regulations</li>
              <li>Upload content that infringes on intellectual property rights</li>
              <li>Use the application to process illegal or harmful content</li>
              <li>Attempt to overload or disrupt the service</li>
            </ul>
          </section>

          {/* Modifications and Discontinuation */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              9. Modifications and Discontinuation
            </h2>
            <p className="mb-4">
              As a portfolio project:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>The application may be modified, updated, or discontinued at any time without notice</li>
              <li>Features may be added, removed, or changed without prior notification</li>
              <li>No guarantee is provided for backward compatibility</li>
              <li>Data may be deleted or lost during updates or discontinuation</li>
            </ul>
            <p>
              Users should not rely on this application for critical or production use cases.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              10. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By using this application, you acknowledge that:
            </p>
            <ul className="ml-6 list-disc space-y-2 mb-4">
              <li>You have read and understood these terms and conditions</li>
              <li>You understand this is a portfolio/educational project, not a commercial product</li>
              <li>You accept all risks associated with using experimental software</li>
              <li>You are responsible for your own API key and associated costs</li>
              <li>You will not hold the developer(s) liable for any issues or damages</li>
            </ul>
            <p>
              If you do not agree to these terms, please discontinue use of this application immediately.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
              11. Contact
            </h2>
            <p>
              For questions or concerns about these terms, please refer to the project repository 
              or contact the developer through the provided channels in the project documentation.
            </p>
          </section>

          {/* Final Disclaimer */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-3 text-xl font-semibold text-zinc-50">
              Final Disclaimer
            </h2>
            <p className="mb-4 text-zinc-200">
              This application is provided for educational and demonstration purposes only. 
              It is not intended for production use, commercial purposes, or handling of sensitive data. 
              Use at your own discretion and risk.
            </p>
            <p className="text-zinc-300">
              Thank you for understanding that this is a learning project and portfolio piece, 
              not a commercial product.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}



