'use client';

import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function WebhookSettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secret, setSecret] = useState('Cogniflow_webhook_secret_7X9pL2vM5Q');
  const [copied, setCopied] = useState(false);

  const copyEndpoint = () => {
    navigator.clipboard.writeText('https://your-domain.com/api/webhooks/smallest');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Webhooks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Receive real-time events for call completions, transcripts, and failures.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 overflow-hidden text-sm relative">
         <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-base font-semibold">Your Receiving Endpoint</h2>
            <p className="mt-1 text-gray-500">
               Copy this URL and paste it into the Smallest.ai Platform &rarr; Webhooks section.
            </p>
         </div>
         <div className="p-6">
            <div className="flex gap-4 items-center">
               <div className="flex-1">
                 <label className="sr-only">Endpoint URL</label>
                 <code className="block w-full bg-gray-50 border border-gray-300 rounded p-2 text-teal-700 font-mono focus:outline-none overflow-x-auto whitespace-nowrap">
                   https://your-domain.com/api/webhooks/smallest
                 </code>
               </div>
               <button
                 onClick={copyEndpoint}
                 className="shrink-0 bg-gray-900 text-white rounded px-4 py-2 font-medium hover:bg-gray-800 transition-colors"
               >
                 {copied ? <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4"/> Copied</span> : 'Copy URL'}
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-lg shadow ring-1 ring-gray-200">
         <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-base font-semibold">Webhook Secret Signature</h2>
            <p className="mt-1 text-gray-500">
               Secure your endpoint against unauthorized events. Match this secret inside Atoms dashboard.
            </p>
         </div>
         <div className="p-6 space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Secret Hash</label>
               <input 
                 type="password"
                 value={secret} 
                 onChange={(e) => setSecret(e.target.value)}
                 className="w-full sm:w-[400px] border border-gray-300 rounded p-2 focus:ring-teal-500 focus:border-teal-500" 
               />
            </div>
            
            <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-700">
               <Save className="h-4 w-4" />
               Update Secret
            </button>
         </div>
      </div>
    </div>
  );
}
