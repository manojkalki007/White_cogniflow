'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Clock } from 'lucide-react';
import { useCallLogDetails } from '@/lib/hooks/useCallLogs';
import { AudioPlayer } from '@/components/call-logs/AudioPlayer';
import { StatusBadge, Spinner } from '@/components/ui';
import { format } from 'date-fns';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CallLogDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: log, isLoading } = useCallLogDetails(id);

  if (isLoading) {
    return (
      <div className="flex justify-center pt-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-24 text-gray-500">Call log not found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/call-logs"
          className="text-teal-600 hover:text-teal-700 flex items-center text-sm font-medium mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Call Logs
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {log.contact?.name ?? log.contact?.phoneNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              Call ID: {log.smallestAiCallId ?? log.id}
            </p>
          </div>
          <StatusBadge status={log.status} />
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Phone, label: 'Phone Number', value: log.contact?.phoneNumber ?? '—' },
          { icon: Clock, label: 'Duration', value: log.duration ? `${log.duration}s` : '—' },
          {
            icon: Clock,
            label: 'Called At',
            value: log.startedAt ? format(new Date(log.startedAt), 'MMM d, h:mm a') : '—',
          },
          { icon: Phone, label: 'Campaign', value: log.campaign?.name ?? '—' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-4"
          >
            <item.icon className="h-5 w-5 text-teal-600 mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recording */}
      {log.recordingUrl && (
        <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recording</h2>
          <AudioPlayer url={log.recordingUrl} />
        </div>
      )}

      {/* Transcript */}
      <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Transcript</h2>
        {log.transcript ? (
          <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {log.transcript}
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">No transcript available.</p>
        )}
      </div>

      {/* Post-Call Metrics */}
      {log.postCallMetrics && (
        <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Post-Call Metrics
          </h2>
          <div className="space-y-2">
            {Object.entries(log.postCallMetrics as Record<string, unknown>).map(
              ([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-600 font-medium capitalize">
                    {k.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-teal-50 px-2.5 py-1 rounded-full">
                    {String(v)}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Disconnect reason */}
      {log.disconnectReason && (
        <div className="rounded-md bg-yellow-50 ring-1 ring-yellow-200 p-4 text-sm text-yellow-800">
          <strong>Disconnect reason:</strong> {log.disconnectReason}
        </div>
      )}
    </div>
  );
}
