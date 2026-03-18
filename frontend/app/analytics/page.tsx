'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { Spinner } from '@/components/ui';
import { Phone, CheckCircle2, Clock, TrendingUp, Megaphone, XCircle, PhoneMissed, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  totalCalls: number;
  completed: number;
  failed: number;
  noAnswer: number;
  busy: number;
  inProgress: number;
  connectionRate: number;
  avgDurationSeconds: number;
  totalCampaigns: number;
  statusBreakdown: { status: string; count: number; pct: number }[];
}

function fmtDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-teal-500',
  FAILED: 'bg-red-400',
  NO_ANSWER: 'bg-gray-300',
  BUSY: 'bg-yellow-400',
  IN_CALL: 'bg-blue-400',
  INITIATED: 'bg-blue-300',
  RINGING: 'bg-orange-300',
  PENDING: 'bg-gray-200',
};

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', user?.organizationId],
    queryFn: async () => {
      const params = user?.organizationId ? `?organizationId=${user.organizationId}` : '';
      const { data } = await api.get<{ data: AnalyticsData }>(`/analytics${params}`);
      return data.data;
    },
    enabled: true,
  });

  const stats = data
    ? [
        {
          name: 'Total Calls',
          value: data.totalCalls.toLocaleString(),
          icon: Phone,
          color: 'bg-blue-50 text-blue-600',
        },
        {
          name: 'Calls Completed',
          value: data.completed.toLocaleString(),
          icon: CheckCircle2,
          color: 'bg-teal-50 text-teal-600',
        },
        {
          name: 'Avg Duration',
          value: fmtDuration(data.avgDurationSeconds),
          icon: Clock,
          color: 'bg-purple-50 text-purple-600',
        },
        {
          name: 'Connection Rate',
          value: `${data.connectionRate}%`,
          icon: TrendingUp,
          color: 'bg-green-50 text-green-600',
        },
      ]
    : [];

  const quickStats = data
    ? [
        { label: 'Campaigns', value: data.totalCampaigns, icon: Megaphone, color: 'text-indigo-600' },
        { label: 'Failed', value: data.failed, icon: XCircle, color: 'text-red-500' },
        { label: 'No Answer', value: data.noAnswer, icon: PhoneMissed, color: 'text-gray-500' },
        { label: 'Busy', value: data.busy, icon: AlertTriangle, color: 'text-yellow-500' },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Live overview of all call activity across your campaigns.
          </p>
        </div>
        {error && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            ⚠ Using live data — connect backend for real stats
          </span>
        )}
      </div>

      {/* Primary Stat Cards */}
      {data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.name} className="bg-white rounded-xl shadow ring-1 ring-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className={`inline-flex rounded-lg p-2 mb-3 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.name}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl ring-1 ring-gray-200 p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status Breakdown Chart */}
          {data.statusBreakdown.length > 0 ? (
            <div className="bg-white rounded-xl shadow ring-1 ring-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Call Status Breakdown</h2>
              <div className="space-y-4">
                {data.statusBreakdown.map((b) => (
                  <div key={b.status} className="flex items-center gap-4">
                    <span className="w-28 text-sm text-gray-600 font-medium text-right shrink-0 capitalize">
                      {b.status.replace('_', ' ')}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-5 ${STATUS_COLORS[b.status] ?? 'bg-gray-400'} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                        style={{ width: `${Math.max(b.pct, 2)}%` }}
                      >
                        <span className="text-xs font-bold text-white">{b.pct}%</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right shrink-0">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-8 text-center text-gray-400 text-sm">
              No call data yet. Launch a campaign to see analytics.
            </div>
          )}

          {/* Connection Rate Visual */}
          <div className="bg-white rounded-xl shadow ring-1 ring-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Call Connected %</h2>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 shrink-0">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#0d9488" strokeWidth="3"
                    strokeDasharray={`${data.connectionRate} ${100 - data.connectionRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{data.connectionRate}%</span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-semibold text-teal-700">{data.completed}</span> calls connected</p>
                <p><span className="font-semibold text-gray-900">{data.totalCalls}</span> total attempts</p>
                <p className="text-xs text-gray-400 mt-2">
                  Disconnection reasons: No Answer ({data.noAnswer}), Failed ({data.failed}), Busy ({data.busy})
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Fallback when API is down
        <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-5 text-sm text-amber-800">
          <strong>Backend not connected.</strong> Run{' '}
          <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">npm run dev</code>{' '}
          in <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">/backend</code>{' '}
          and run Prisma migrations to see live analytics data.
        </div>
      )}
    </div>
  );
}
