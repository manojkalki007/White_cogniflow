'use client';

import { useState } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useUpdateSchedule, Campaign } from '@/lib/hooks/useCampaigns';

interface Props {
  campaign: Campaign;
}

export function ScheduleToggle({ campaign }: Props) {
  const [enabled, setEnabled] = useState(!!campaign.activeHoursFrom);
  const [from, setFrom] = useState(campaign.activeHoursFrom ?? '09:00');
  const [to, setTo] = useState(campaign.activeHoursTo ?? '18:00');
  const [saved, setSaved] = useState(false);

  const { mutate, isPending } = useUpdateSchedule();

  const handleSave = () => {
    mutate(
      {
        id: campaign.id,
        updates: {
          activeHoursFrom: enabled ? from : undefined,
          activeHoursTo: enabled ? to : undefined,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-600" />
          <h3 className="text-base font-semibold text-gray-900">
            Active Calling Hours
          </h3>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
            enabled ? 'bg-teal-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {enabled
          ? 'Only calls within this window will be placed.'
          : 'Calls will be placed 24/7 with no time restriction.'}
      </p>

      <div
        className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${
          enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Start Time
          </label>
          <input
            type="time"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            End Time
          </label>
          <input
            type="time"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-teal-600 font-medium">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
}
