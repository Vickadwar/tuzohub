import React from "react";
import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-satoshi selection:bg-brand-100 selection:text-brand-900 flex flex-col">
      
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 py-3 px-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white shadow-theme-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              TuzoHub <span className="font-medium text-gray-500 ml-1">Developers</span>
            </span>
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900">Back to Website</Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <Link href="/auth/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Dashboard</Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-61px)]">
        
        {/* 2. Sidebar Navigation */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto hidden lg:block shrink-0 px-4 py-6">
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Getting Started</h4>
            <ul className="space-y-1">
              <li><a href="#introduction" className="block px-2 py-1.5 text-sm font-semibold text-brand-600 bg-brand-50 rounded-md">Introduction</a></li>
              <li><a href="#authentication" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Authentication</a></li>
              <li><a href="#idempotency" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Idempotency</a></li>
              <li><a href="#errors" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Errors</a></li>
            </ul>
          </div>

          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Core API</h4>
            <ul className="space-y-1">
              <li><a href="#record-purchase" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Record a Purchase</a></li>
              <li><a href="#redeem-points" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Redeem Points</a></li>
              <li><a href="#redeem-voucher" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Redeem Physical Voucher</a></li>
              <li><a href="#get-wallet" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Get Wallet Balance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Webhooks</h4>
            <ul className="space-y-1">
              <li><a href="#webhooks" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Event Signatures</a></li>
              <li><a href="#event-types" className="block px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Event Types</a></li>
            </ul>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto">
            
            {/* Section: Introduction & Auth */}
            <div id="introduction" className="grid grid-cols-1 xl:grid-cols-2 border-b border-gray-200">
              {/* Content Side */}
              <div className="p-8 xl:p-12 xl:pr-16">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">TuzoHub API Reference</h1>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  The TuzoHub API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
                </p>
                
                <h2 id="authentication" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Authentication</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  The TuzoHub API uses API keys to authenticate requests. You can view and manage your API keys in the Tenant Dashboard.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed bg-brand-50 p-4 border border-brand-100 rounded-lg text-sm">
                  <strong className="text-brand-700">Important:</strong> Keep your API keys secure. Do not share them in publicly accessible areas such as GitHub or client-side code.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Authentication to the API is performed via Bearer Auth. Provide your API key as the bearer token in the Authorization header.
                </p>

                <h2 id="idempotency" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Idempotency</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  The API supports idempotency for safely retrying requests without accidentally performing the same operation twice. For example, if a request to record a purchase fails due to a network connection error, you can retry the request with the same idempotency key to guarantee that points are only issued once.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Include an <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200">Idempotency-Key</code> header or body parameter. We recommend using V4 UUIDs.
                </p>
              </div>

              {/* Code Side */}
              <div className="bg-[#0c111d] p-8 xl:p-12 border-l border-gray-800">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Base URL</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 mb-8">
                  https://api.tuzohub.com/v1
                </div>

                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Authentication Example</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="text-blue-light-400 mb-2">curl <span className="text-gray-300">https://api.tuzohub.com/v1/wallets/usr_123</span> \</div>
                  <div className="text-gray-300 ml-4 mb-2">-H <span className="text-success-400">"Authorization: Bearer sk_live_abc123..."</span> \</div>
                  <div className="text-gray-300 ml-4">-H <span className="text-success-400">"Content-Type: application/json"</span></div>
                </div>
              </div>
            </div>

            {/* Section: Record Purchase */}
            <div id="record-purchase" className="grid grid-cols-1 xl:grid-cols-2 border-b border-gray-200">
              <div className="p-8 xl:p-12 xl:pr-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Record a Purchase</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Logs a purchase event for a consumer. The rules engine will automatically calculate applicable campaigns, stackable promotions, and velocity limits before issuing points via FIFO ledger entry.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Body Parameters</h4>
                <ul className="space-y-4">
                  <li>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900">consumer_id</span>
                      <span className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">string (uuid)</span>
                      <span className="text-xs text-error-500 font-bold uppercase">Required</span>
                    </div>
                    <p className="text-sm text-gray-600">The unique identifier of the consumer making the purchase.</p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900">dealer_organization_id</span>
                      <span className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">string (uuid)</span>
                      <span className="text-xs text-error-500 font-bold uppercase">Required</span>
                    </div>
                    <p className="text-sm text-gray-600">The ID of the organization/dealer where the purchase occurred.</p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900">total_amount</span>
                      <span className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">number</span>
                      <span className="text-xs text-error-500 font-bold uppercase">Required</span>
                    </div>
                    <p className="text-sm text-gray-600">The fiat amount spent. Used to calculate points if product-specific points are not provided.</p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900">idempotency_key</span>
                      <span className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">string</span>
                    </div>
                    <p className="text-sm text-gray-600">Unique key to prevent duplicate point issuance during network retries.</p>
                  </li>
                </ul>
              </div>

              <div className="bg-[#0c111d] p-8 xl:p-12 border-l border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-success-500 text-white text-xs font-bold px-2 py-1 rounded">POST</span>
                  <code className="text-gray-300 font-mono text-sm">/v1/purchases</code>
                </div>

                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 mt-6">Request</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto text-gray-300">
                  {`{`} <br/>
                  <span className="text-theme-pink-500 ml-4">"consumer_id"</span>: <span className="text-success-400">"cons_01H9Z..."</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"dealer_organization_id"</span>: <span className="text-success-400">"org_881ba..."</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"total_amount"</span>: <span className="text-orange-400">250.00</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"idempotency_key"</span>: <span className="text-success-400">"req_991823"</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"metadata"</span>: {`{`} <br/>
                  <span className="text-theme-pink-500 ml-8">"receipt_number"</span>: <span className="text-success-400">"RCPT-00192"</span> <br/>
                  <span className="ml-4">{`}`}</span> <br/>
                  {`}`}
                </div>

                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 mt-6">Response <span className="text-success-400 font-normal ml-2">201 Created</span></h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto text-gray-300">
                  {`{`} <br/>
                  <span className="text-theme-pink-500 ml-4">"id"</span>: <span className="text-success-400">"pur_abc123"</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"points_earned"</span>: <span className="text-orange-400">25.00</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"wallet_balance_after"</span>: <span className="text-orange-400">145.00</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"applied_campaigns"</span>: [<span className="text-success-400">"camp_weekend_multiplier"</span>],<br/>
                  <span className="text-theme-pink-500 ml-4">"status"</span>: <span className="text-success-400">"processed"</span><br/>
                  {`}`}
                </div>
              </div>
            </div>

            {/* Section: Redeem Physical Voucher */}
            <div id="redeem-voucher" className="grid grid-cols-1 xl:grid-cols-2 border-b border-gray-200">
              <div className="p-8 xl:p-12 xl:pr-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Redeem Physical Voucher</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Validates a secure hash from a physical scratch card/voucher and assigns the base point value to the consumer's wallet. Automatically triggers the Enterprise Fraud Engine to detect brute-force attempts.
                </p>
                <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 text-warning-800 font-bold mb-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    Anti-Fraud Active
                  </div>
                  <p className="text-sm text-warning-700">More than 5 failed attempts from the same IP or Consumer ID within 1 hour will result in a temporary block and trigger an administrative <code className="bg-warning-100 px-1 rounded">fraud_alert</code>.</p>
                </div>
              </div>

              <div className="bg-[#0c111d] p-8 xl:p-12 border-l border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-success-500 text-white text-xs font-bold px-2 py-1 rounded">POST</span>
                  <code className="text-gray-300 font-mono text-sm">/v1/vouchers/redeem</code>
                </div>

                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 mt-6">Request</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto text-gray-300">
                  {`{`} <br/>
                  <span className="text-theme-pink-500 ml-4">"consumer_id"</span>: <span className="text-success-400">"cons_01H9Z..."</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"pin_code"</span>: <span className="text-success-400">"8812-4491-0021"</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"device_fingerprint"</span>: <span className="text-success-400">"df_99x811a..."</span><br/>
                  {`}`}
                </div>

                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 mt-6">Response <span className="text-success-400 font-normal ml-2">200 OK</span></h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto text-gray-300">
                  {`{`} <br/>
                  <span className="text-theme-pink-500 ml-4">"success"</span>: <span className="text-orange-400">true</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"transaction_id"</span>: <span className="text-success-400">"tx_vouch_881"</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"points_awarded"</span>: <span className="text-orange-400">500.00</span><br/>
                  {`}`}
                </div>
              </div>
            </div>

            {/* Section: Webhooks */}
            <div id="webhooks" className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 xl:p-12 xl:pr-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhooks & Events</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  TuzoHub can send webhook events that notify your application any time an event happens on your account. This is particularly useful for syncing balances to your ERP or triggering SMS notifications via your own gateway.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Verifying Signatures</h4>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  We sign the webhook events we send to your endpoints by including a signature in each event's <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200">Tuzo-Signature</code> header. This allows you to verify that the events were sent by TuzoHub.
                </p>
                
                <h4 className="font-semibold text-gray-900 mt-8 mb-3 border-b border-gray-200 pb-2">Common Event Types</h4>
                <ul className="space-y-2 text-sm text-gray-600 font-mono">
                  <li><span className="text-brand-600">wallet.updated</span> - Fired on any point change</li>
                  <li><span className="text-brand-600">redemption.approved</span> - Payout ready for processing</li>
                  <li><span className="text-brand-600">fraud.alert.created</span> - System flagged suspicious behavior</li>
                  <li><span className="text-brand-600">consumer.tier_upgraded</span> - Consumer reached new lifetime tier</li>
                </ul>
              </div>

              <div className="bg-[#0c111d] p-8 xl:p-12 border-l border-gray-800">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Webhook Payload Example</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto text-gray-300">
                  {`{`} <br/>
                  <span className="text-theme-pink-500 ml-4">"event_id"</span>: <span className="text-success-400">"evt_99102"</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"type"</span>: <span className="text-success-400">"wallet.updated"</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"created_at"</span>: <span className="text-success-400">"2026-04-22T11:52:00Z"</span>,<br/>
                  <span className="text-theme-pink-500 ml-4">"data"</span>: {`{`} <br/>
                  <span className="text-theme-pink-500 ml-8">"consumer_id"</span>: <span className="text-success-400">"cons_01H9Z"</span>,<br/>
                  <span className="text-theme-pink-500 ml-8">"new_balance"</span>: <span className="text-orange-400">145.00</span>,<br/>
                  <span className="text-theme-pink-500 ml-8">"banked_balance"</span>: <span className="text-orange-400">0.00</span>,<br/>
                  <span className="text-theme-pink-500 ml-8">"trigger_transaction"</span>: <span className="text-success-400">"pur_abc123"</span><br/>
                  <span className="ml-4">{`}`}</span><br/>
                  {`}`}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}