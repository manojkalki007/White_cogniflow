'use client';

import { Plug, ExternalLink } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your voice agents to external CRMs and platforms.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 overflow-hidden text-sm">
         <div className="p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-gray-900">
               <img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" className="h-6 w-auto" alt="Salesforce" />
               Salesforce
            </h2>
            <p className="text-gray-500 mb-6 max-w-2xl">
               Sync your phone conversations automatically with Salesforce leads and contacts. Agents can log calls directly or lookup lead variables dynamically.
            </p>
            
            <a 
               href="https://app.smallest.ai" 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
               <Plug className="h-4 w-4 text-gray-500" /> Connect via Atoms Platform <ExternalLink className="h-3 w-3 text-gray-400" />
            </a>
         </div>
         <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
               Connection requires your Salesforce subdomain (.my.salesforce.com). OAuth redirect runs through Smallest.ai secure servers.
            </p>
         </div>
      </div>
    </div>
  );
}
