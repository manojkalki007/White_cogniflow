'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui';
import { Users, UploadCloud, Trash2, Search, CheckCircle2 } from 'lucide-react';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'org_default';

interface Contact {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

function useContacts(search: string, page: number) {
  return useQuery({
    queryKey: ['audiences', { search, page }],
    queryFn: async () => {
      const { data } = await api.get<{ data: Contact[]; total: number }>('/audiences', {
        params: { organizationId: ORG_ID, page, search: search || undefined },
      });
      return data;
    },
  });
}

export default function AudiencesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  const { data, isLoading } = useContacts(search, page);

  const importMutation = useMutation({
    mutationFn: async (f: File) => {
      const formData = new FormData();
      formData.append('contacts', f);
      formData.append('organizationId', ORG_ID);
      const { data } = await api.post('/audiences/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      setFile(null);
      setUploadDone(true);
      setTimeout(() => setUploadDone(false), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/audiences/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audiences'] }),
  });

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Audiences</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage contact lists for outbound campaigns. Import via CSV.
        </p>
      </div>

      {/* Import CSV */}
      <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-teal-600" />
          Import Contacts via CSV
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              {file ? file.name : 'Choose CSV file'}
            </span>
            <input
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            disabled={!file || importMutation.isPending}
            onClick={() => file && importMutation.mutate(file)}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition-colors"
          >
            {importMutation.isPending ? 'Importing...' : 'Import'}
          </button>
          {uploadDone && (
            <span className="flex items-center gap-1 text-sm text-teal-700 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Imported successfully!
            </span>
          )}
          {importMutation.isError && (
            <span className="text-sm text-red-600">Import failed. Check CSV format.</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          CSV must contain a <code className="bg-gray-100 px-1 rounded">phoneNumber</code> column. Other columns (Name, Email, etc.) are stored as metadata.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-md border-0 pl-9 pr-4 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner className="h-8 w-8" /></div>
      ) : (
        <div className="bg-white shadow ring-1 ring-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              {data?.total ?? 0} Contacts
            </span>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Phone', 'Email', 'Added', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data?.data.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{c.phoneNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                    No contacts found. Import a CSV to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {data && data.total > 50 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
              <span>Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, data.total)} of {data.total}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded px-3 py-1 ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-40">Prev</button>
                <button disabled={page * 50 >= data.total} onClick={() => setPage(p => p + 1)} className="rounded px-3 py-1 ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
