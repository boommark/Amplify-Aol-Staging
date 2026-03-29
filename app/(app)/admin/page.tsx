import Link from 'next/link'

// Admin placeholder page — accessible only to users with role: 'admin'
// Route guard enforced by middleware.ts (AUTH-05)
export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-lg w-full text-center">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#3D8BE8' }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mb-8">
          You have admin access to the Amplify platform.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6 text-left">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Coming in Phase 5</h2>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              Prompt Lab — manage and version AI prompts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              User management — approve access requests, assign roles
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              Analytics — usage metrics and campaign performance
            </li>
          </ul>
        </div>

        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: '#3D8BE8' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Chat
        </Link>
      </div>
    </div>
  )
}
