import { createStreamableUI } from 'ai/rsc';
import { tool } from 'ai';
import { z } from 'zod';
import supabaseAdmin from '@/lib/supabase/admin';
import { ReactNode } from 'react';

export function SupabaseQuery({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <p>No data returned from the query.</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(header => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map(header => (
                <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {typeof row[header] === 'object' ? JSON.stringify(row[header]) : row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const querySupabaseTool = tool({
  description: 'Query the Supabase database.',
  parameters: z.object({
    query: z.string().describe('The SQL query to execute.'),
  }),
  execute: async function ({ query }: { query: string }) {
    const supabase = supabaseAdmin();
    console.log(query);
    // Remove trailing semicolon to prevent syntax errors
    const sanitizedQuery = query.trim().replace(/;$/, '');
    const { data, error } = await supabase.rpc('execute_sql', { query: sanitizedQuery });

    if (error) {
      console.error('Supabase query error:', error);
      return JSON.stringify({ error: `Error running query: ${error.message}` });
    }

    if (!data) {
      return JSON.stringify({ result: "Query returned no results." });
    }

    return JSON.stringify(data);
  },
});
