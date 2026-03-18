'use client';

import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { Spinner, StatusBadge } from '@/components/ui';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID || 'org_default';
  const { data, isLoading, error } = useCampaigns(orgId, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Campaigns
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor your outbound calling campaigns.
          </p>
        </div>
        <Link
          href="/campaigns/launch"
          className="inline-flex items-center gap-x-2 rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors"
        >
          <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Create Campaign
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">Failed to load campaigns.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow ring-1 ring-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Campaign Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Agent ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Progress
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Active Hours
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data?.data.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {campaign.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-500 truncate max-w-[120px]">
                    {campaign.smallestAgentId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-semibold">{campaign.processedCount + campaign.failedCount} / {campaign.totalContacts}</span>
                       <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                             className="bg-teal-600 h-1.5"
                             style={{
                               width: `${Math.min(100, ((campaign.processedCount + campaign.failedCount) / Math.max(1, campaign.totalContacts)) * 100)}%`
                             }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {campaign.activeHoursFrom ? `${campaign.activeHoursFrom} - ${campaign.activeHoursTo}` : '24/7'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="text-teal-600 hover:text-teal-900 font-semibold"
                    >
                      View<span className="sr-only">, {campaign.name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                      No campaigns found. Create one to get started.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
