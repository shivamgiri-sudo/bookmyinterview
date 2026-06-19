/**
 * Tabs — Book My Interview Design System
 *
 * Accessible, animated tab navigation.
 *
 * Props API:
 *   tabs      : Tab[]  — tab definitions
 *     { id: string; label: string; icon?: ReactNode; badge?: string | number; disabled?: boolean }
 *   activeTab : string — id of the currently active tab
 *   onChange  : (id: string) => void
 *   variant   : 'underline' | 'pills'  (default: 'underline')
 *   size      : 'sm' | 'md'           (default: 'md')
 *   className : string
 *
 * Usage:
 *   const [tab, setTab] = useState('jobs');
 *   <Tabs
 *     tabs={[
 *       { id: 'jobs', label: 'Live Jobs', icon: <BriefcaseBusiness size={16} /> },
 *       { id: 'talent', label: 'Talent', icon: <UserRoundCheck size={16} />, badge: 12 },
 *       { id: 'settings', label: 'Settings', disabled: true },
 *     ]}
 *     activeTab={tab}
 *     onChange={setTab}
 *   />
 *   {tab === 'jobs' && <JobsPanel />}
 *   {tab === 'talent' && <TalentPanel />}
 */

import React, { useRef } from 'react';
import './Tabs.css';

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  className = '',
}) {
  const listRef = useRef(null);

  function handleKeyDown(e, currentIdx) {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentEnabled = enabledTabs.findIndex((t) => t.id === tabs[currentIdx].id);

    if (e.key === 'ArrowRight') {
      const next = enabledTabs[(currentEnabled + 1) % enabledTabs.length];
      onChange?.(next.id);
      listRef.current?.querySelector(`[data-tabid="${next.id}"]`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = enabledTabs[(currentEnabled - 1 + enabledTabs.length) % enabledTabs.length];
      onChange?.(prev.id);
      listRef.current?.querySelector(`[data-tabid="${prev.id}"]`)?.focus();
    } else if (e.key === 'Home') {
      const first = enabledTabs[0];
      onChange?.(first.id);
      listRef.current?.querySelector(`[data-tabid="${first.id}"]`)?.focus();
    } else if (e.key === 'End') {
      const last = enabledTabs[enabledTabs.length - 1];
      onChange?.(last.id);
      listRef.current?.querySelector(`[data-tabid="${last.id}"]`)?.focus();
    }
  }

  return (
    <div
      className={`bmi-tabs bmi-tabs--${variant} bmi-tabs--${size} ${className}`}
      role="tablist"
      ref={listRef}
      aria-label="Page sections"
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            data-tabid={tab.id}
            className={[
              'bmi-tab',
              isActive ? 'bmi-tab--active' : '',
              tab.disabled ? 'bmi-tab--disabled' : '',
            ].filter(Boolean).join(' ')}
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => !tab.disabled && onChange?.(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {tab.icon && <span className="bmi-tab__icon" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="bmi-tab__badge" aria-label={`${tab.badge} items`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
