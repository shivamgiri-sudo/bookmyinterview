/**
 * DataTable — Book My Interview Design System
 *
 * A production-grade sortable table with loading, empty, and pagination states.
 *
 * Props API:
 *   columns  : Column[]  — array of column definitions
 *     { key: string; label: string; sortable?: boolean; render?: (value, row) => ReactNode; width?: string }
 *   rows     : object[]  — data rows (must have a unique `id` field, or use rowKey)
 *   rowKey   : string    — key to use as row identifier   (default: 'id')
 *   loading  : boolean   — shows skeleton rows             (default: false)
 *   loadingRows: number  — skeleton row count              (default: 5)
 *   empty    : ReactNode — content to show when no rows
 *   onRowClick: (row) => void — click handler for rows
 *   caption  : string   — accessible table caption
 *   className: string
 *
 * Usage:
 *   const columns = [
 *     { key: 'name', label: 'Candidate', sortable: true },
 *     { key: 'role', label: 'Role' },
 *     { key: 'score', label: 'Score', render: (v) => <ScoreBar value={v} showLabel={false} /> },
 *     { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
 *   ];
 *
 *   <DataTable
 *     columns={columns}
 *     rows={candidates}
 *     loading={isLoading}
 *     empty={<EmptyState title="No candidates yet" />}
 *     onRowClick={(row) => go(`/candidate/${row.id}`)}
 *   />
 */

import React, { useState } from 'react';
import { SkeletonRow } from './Skeleton.jsx';
import './DataTable.css';

export function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  loading = false,
  loadingRows = 5,
  empty,
  onRowClick,
  caption,
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(col) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  }

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (loading) {
    return (
      <div className={`bmi-datatable ${className}`} aria-busy="true" aria-label="Loading table">
        {Array.from({ length: loadingRows }, (_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={`bmi-datatable bmi-datatable--empty ${className}`}>
        {empty}
      </div>
    );
  }

  return (
    <div className={`bmi-datatable-wrap ${className}`}>
      <table className="bmi-datatable" role="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bmi-datatable__head">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  'bmi-datatable__th',
                  col.sortable ? 'bmi-datatable__th--sortable' : '',
                  sortKey === col.key ? 'bmi-datatable__th--sorted' : '',
                ].filter(Boolean).join(' ')}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleSort(col)}
                aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span>{col.label}</span>
                {col.sortable && (
                  <span className="bmi-datatable__sort-icon" aria-hidden="true">
                    {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row[rowKey]}
              className={['bmi-datatable__row', onRowClick ? 'bmi-datatable__row--clickable' : ''].filter(Boolean).join(' ')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(row); }} : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="bmi-datatable__td">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
