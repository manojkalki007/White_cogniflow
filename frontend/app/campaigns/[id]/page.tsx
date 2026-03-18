'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { useCallLogs } from '@/lib/hooks/useCallLogs';
import { StatusBadge, Spinner } from '@/components/ui';
import { ScheduleToggle } from '@/components/campaigns/ScheduleToggle';
import { AudioPlayer } from '@/components/call-logs/AudioPlayer';
import { formatDistanceToNow } from 'date-fns';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: campaign, isLoading: loadingCampaign } = useCampaign(id);
  const { data: logsData, isLoading: loadingLogs } = useCallLogs({ campaignId: id });

  if (loadingCampaign) {
    return (
      <div className="flex justify-center pt-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-24 text-gray-500">Campaign not found.</div>
    );
  }

  const pct = Math.min(
    100,
    Math.round(
      ((campaign.processedCount + campaign.failedCount) /
        Math.max(1, campaign.totalContacts)) *
        100
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/campaigns"
          className="text-teal-600 hover:text-teal-700 flex items-center text-sm font-medium mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Campaigns
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {campaign.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              Agent: {campaign.smallestAgentId}
            </p>
          </div>
          <StatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Contacts',
            value: campaign.totalContacts,
            icon: Phone,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Processed',
            value: campaign.processedCount,
            icon: CheckCircle2,
            color: 'text-teal-600 bg-teal-50',
          },
          {
            label: 'Failed',
            value: campaign.failedCount,
            icon: XCircle,
            color: 'text-red-600 bg-red-50',
          },
          {
            label: 'Completion',
            value: `${pct}%`,
            icon: Loader2,
            color: 'text-purple-600 bg-purple-50',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-5"
          >
            <div
              className={`inline-flex rounded-lg p-2 mb-3 ${s.color}`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-5">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Overall Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-3 bg-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Schedule Toggle */}
      <ScheduleToggle campaign={campaign} />

      {/* Call Logs */}
      <div className="bg-white shadow ring-1 ring-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Call Logs</h2>
        </div>

        {loadingLogs ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Contact', 'Phone', 'Status', 'Duration', 'Recording', 'Time'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logsData?.data.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {log.contact?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap font-mono">
                    {log.contact?.phoneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {log.duration != null ? `${log.duration}s` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm min-w-[240px]">
                    {log.recordingUrl ? (
                      <AudioPlayer url={log.recordingUrl} />
                    ) : (
                      <span className="text-gray-400 text-xs">No recording</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))}
              {logsData?.data.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No calls initiated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
