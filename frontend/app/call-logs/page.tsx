'use client';

import { useState } from 'react';
import { useCallLogs } from '@/lib/hooks/useCallLogs';
import { AudioPlayer } from '@/components/call-logs/AudioPlayer';
import { StatusBadge, Spinner } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'org_default';

export default function CallLogsPage() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error } = useCallLogs({ organizationId: ORG_ID, page });

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Call Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse all call records, transcripts, and recordings.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load call logs.
        </div>
      ) : (
        <>
          <div className="bg-white shadow ring-1 ring-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Contact', 'Phone', 'Campaign', 'Status', 'Duration', 'Recording', 'Time', ''].map(
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
              <tbody className="divide-y divide-gray-200 bg-white">
                {data?.data.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {log.contact?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                        {log.contact?.phoneNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        <Link
                          href={`/campaigns/${log.campaignId}`}
                          className="text-teal-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {log.campaign?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {log.duration != null ? `${log.duration}s` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm min-w-[240px]">
                        {log.recordingUrl ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <AudioPlayer url={log.recordingUrl} />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No recording</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {expandedId === log.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded transcript row */}
                    {expandedId === log.id && (
                      <tr key={`${log.id}-expand`}>
                        <td
                          colSpan={8}
                          className="bg-gray-50 px-8 py-4 text-sm text-gray-700"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Transcript
                              </p>
                              {log.transcript ? (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                                  {log.transcript}
                                </p>
                              ) : (
                                <p className="text-gray-400 italic text-sm">
                                  No transcript available.
                                </p>
                              )}
                            </div>
                            {log.postCallMetrics && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  Post-Call Metrics
                                </p>
                                <div className="rounded-md bg-white ring-1 ring-gray-200 p-3 text-sm space-y-1">
                                  {Object.entries(
                                    log.postCallMetrics as Record<string, unknown>
                                  ).map(([k, v]) => (
                                    <div
                                      key={k}
                                      className="flex justify-between gap-4"
                                    >
                                      <span className="text-gray-500 font-medium">
                                        {k}
                                      </span>
                                      <span className="text-gray-900 font-semibold">
                                        {String(v)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {log.disconnectReason && (
                            <p className="mt-3 text-xs text-gray-500">
                              Disconnect reason:{' '}
                              <span className="font-medium">
                                {log.disconnectReason}
                              </span>
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-gray-500"
                    >
                      No call logs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.total > 20 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {(page - 1) * 20 + 1}–
                {Math.min(page * 20, data.total)} of {data.total}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded px-3 py-1 ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page * 20 >= data.total}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded px-3 py-1 ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
