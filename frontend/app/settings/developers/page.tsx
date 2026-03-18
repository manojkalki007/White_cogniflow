'use client';

import { Key, Plus, Copy, CheckCircle2 } from 'lucide-react';

export default function DevelopersPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Developer API Keys</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate API keys to interact with your AI Telephony SaaS programmatically.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-base font-semibold">API Keys</h2>
            <button className="flex items-center gap-1.5 text-sm font-semibold bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-800">
               <Plus className="h-4 w-4" /> Create API Key
            </button>
         </div>
         <div className="p-6">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
               <table className="min-w-full">
                  <thead className="bg-gray-50">
                     <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Token</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Created At</th>
                        <th className="px-4 py-3"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                     <tr>
                        <td className="px-4 py-3 text-sm font-medium">Production Access Token</td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">sk_prod_a9bc...2efgh</td>
                        <td className="px-4 py-3 text-sm text-gray-400">Mar 12, 2026</td>
                        <td className="px-4 py-3 text-right">
                           <button className="text-teal-600 hover:text-teal-700">Revoke</button>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
         
         <div className="px-6 py-4 bg-teal-50 border-t border-teal-100 flex items-start gap-3">
             <Key className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
             <div className="text-sm text-teal-900">
                <strong>Important:</strong> Keep your API keys secure. Do not expose them in browsers or public repositories. Requests to <code className="bg-teal-100 text-teal-800 px-1 py-0.5 rounded">/api/campaigns/launch</code> must carry this Bearer token in the <code className="bg-teal-100 text-teal-800 px-1 py-0.5 rounded">Authorization</code> header.
             </div>
         </div>
      </div>
    </div>
  );
}
