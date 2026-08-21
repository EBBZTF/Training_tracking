import type { PlannedSession, SessionType } from '../../types';
import {
  addMonths,
  formatMonthLabel,
  isoDate,
  monthGrid,
  today,
  WEEKDAY_SHORT,
} from '../../utils/date';
import { sessionTypeAccent } from '../../utils/cssVar';
import styles from './CalendarView.module.scss';

interface CalendarViewProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  sessions: PlannedSession[];
  types: SessionType[];
  onSelectDay: (date: string) => void;
  onSelectSession: (session: PlannedSession) => void;
}

function groupByDate(sessions: PlannedSession[]): Map<string, PlannedSession[]> {
  const byDate = new Map<string, PlannedSession[]>();
  for (const s of sessions) {
    const list = byDate.get(s.date);
    if (list) list.push(s);
    else byDate.set(s.date, [s]);
  }
  return byDate;
}

export function CalendarView({
  month,
  onMonthChange,
  sessions,
  types,
  onSelectDay,
  onSelectSession,
}: CalendarViewProps) {
  const grid = monthGrid(month);
  const currentDate = today();
  const typeById = new Map(types.map((t) => [t.id, t]));
  const sessionsByDate = groupByDate(sessions);

  return (
    <div className={styles.calendar}>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Vorheriger Monat"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          ‹
        </button>
        <div className={styles.monthLabel}>{formatMonthLabel(month)}</div>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Nächster Monat"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          ›
        </button>
      </div>
      <button
        type="button"
        className={styles.todayButton}
        onClick={() => onMonthChange(new Date())}
      >
        Heute
      </button>

      <div className={styles.weekdayRow}>
        {WEEKDAY_SHORT.map((w) => (
          <div key={w} className={styles.weekdayName}>
            {w}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {grid.map((day) => {
          const date = isoDate(day);
          const outsideMonth = day.getMonth() !== month.getMonth();
          const daySessions = sessionsByDate.get(date) ?? [];
          return (
            <div
              key={date}
              role="button"
              tabIndex={0}
              aria-label={`Termin am ${date} planen`}
              className={`${styles.cell} ${outsideMonth ? styles.cellOutside : ''} ${
                date === currentDate ? styles.cellToday : ''
              }`}
              onClick={() => onSelectDay(date)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectDay(date);
              }}
            >
              <span className={styles.dayNumber}>{day.getDate()}</span>
              <span className={styles.pills}>
                {daySessions.map((s) => {
                  const type = typeById.get(s.sessionTypeId);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.pill} ${s.status !== 'planned' ? styles.pillDone : ''}`}
                      style={sessionTypeAccent(type)}
                      title={type?.label ?? ''}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSession(s);
                      }}
                    >
                      {s.time && <span className={styles.pillTime}>{s.time.slice(0, 5)} </span>}
                      {type?.label ?? '?'}
                      {s.ruleId != null && <span className={styles.repeat}> ↻</span>}
                    </button>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
