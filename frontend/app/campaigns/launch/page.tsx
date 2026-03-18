'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function LaunchCampaignPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [activeHoursFrom, setActiveHoursFrom] = useState('');
  const [activeHoursTo, setActiveHoursTo] = useState('');

  const launchMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/campaigns/launch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      router.push('/campaigns');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !agentId) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('agentId', agentId);
    formData.append('contacts', file);

    formData.append('organizationId', process.env.NEXT_PUBLIC_ORG_ID || 'org_default');
    formData.append('createdById', process.env.NEXT_PUBLIC_DEFAULT_USER_ID || 'user_default');

    if (activeHoursFrom && activeHoursTo) {
      formData.append('activeHoursFrom', activeHoursFrom);
      formData.append('activeHoursTo', activeHoursTo);
    }

    launchMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <Link href="/campaigns" className="text-teal-600 hover:text-teal-700 flex items-center text-sm font-medium mb-4">
           <ArrowLeft className="w-4 h-4 mr-1" />
           Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Launch New Campaign
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CSV contact list and assign an agent to start an outbound calling campaign.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow sm:rounded-lg">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Campaign Name
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                placeholder="e.g. Q4 Reactivation"
              />
            </div>
          </div>

          {/* Agent ID */}
          <div>
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
              Smallest.ai Agent ID
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="agentId"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 font-mono text-sm sm:leading-6"
                placeholder="agt_xxx123"
              />
            </div>
          </div>

          {/* Active Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700">
                 Active From (Optional)
               </label>
               <input
                 type="time"
                 value={activeHoursFrom}
                 onChange={(e) => setActiveHoursFrom(e.target.value)}
                 className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">
                 Active To
               </label>
               <input
                 type="time"
                 value={activeHoursTo}
                 onChange={(e) => setActiveHoursTo(e.target.value)}
                 className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm"
               />
            </div>
          </div>

          {/* CSV File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audience (CSV)
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center">
                {file ? (
                  <CheckCircle2 className="mx-auto h-12 w-12 text-teal-600 mb-4" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
                )}
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-teal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 hover:text-teal-500"
                  >
                    <span>{file ? 'Change file' : 'Upload a file'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </label>
                  <p className="pl-1">{file ? '' : 'or drag and drop'}</p>
                </div>
                <p className="text-xs leading-5 text-gray-600 mt-2">
                  {file
                    ? `Selected: ${file.name}`
                    : 'CSV up to 10MB. Must contain a "phoneNumber" column.'}
                </p>
              </div>
            </div>
          </div>
        </div>

         <div className="mt-6 flex items-center justify-end gap-x-6">
            <Link href="/campaigns" className="text-sm font-semibold leading-6 text-gray-900">
               Cancel
            </Link>
            <button
               type="submit"
               disabled={launchMutation.isPending || !file}
               className="rounded-md bg-teal-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 transition-colors"
            >
               {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
            </button>
         </div>
         {launchMutation.isError && (
             <p className="text-red-500 text-sm mt-4 text-right">Error launching campaign.</p>
         )}
      </form>
    </div>
  );
}
