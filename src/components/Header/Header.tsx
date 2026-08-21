import { Tabs } from '../Tabs/Tabs';
import type { TabItem } from '../Tabs/Tabs';
import styles from './Header.module.scss';

interface HeaderProps {
  monthLabel: string;
  view: 'training' | 'calendar';
  onViewChange: (view: 'training' | 'calendar') => void;
  tabItems: TabItem[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  /** Only while editing plans — in log mode the strip follows the calendar, not the plan list. */
  onAddPlan?: () => void;
}

export function Header({
  monthLabel,
  view,
  onViewChange,
  tabItems,
  activeTabId,
  onSelectTab,
  onPrevMonth,
  onNextMonth,
  onAddPlan,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.hrow}>
        <div className={styles.eyebrow}>Training</div>
        <div className={styles.datewrap}>
          {view === 'training' && <span className={styles.month}>{monthLabel}</span>}
          <button
            type="button"
            className={styles.viewToggle}
            onClick={() => onViewChange(view === 'training' ? 'calendar' : 'training')}
          >
            {view === 'training' ? 'Kalender' : 'Training'}
          </button>
        </div>
      </div>
      {view === 'training' && (
        <Tabs
          items={tabItems}
          activeId={activeTabId}
          onSelect={onSelectTab}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onAddPlan={onAddPlan}
        />
      )}
    </header>
  );
}
