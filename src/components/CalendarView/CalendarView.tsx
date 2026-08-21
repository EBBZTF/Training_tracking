import type { PlannedSession, SessionType } from '../../types';
import { addMonths, formatMonthLabel, isoDate, monthGrid, WEEKDAY_SHORT } from '../../utils/date';
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

export function CalendarView({
  month,
  onMonthChange,
  sessions,
  types,
  onSelectDay,
  onSelectSession,
}: CalendarViewProps) {
  const grid = monthGrid(month);
  const today = isoDate(new Date());
  const typeById = new Map(types.map((t) => [t.id, t]));
  const sessionsByDate = new Map<string, PlannedSession[]>();
  for (const s of sessions) {
    const list = sessionsByDate.get(s.date);
    if (list) list.push(s);
    else sessionsByDate.set(s.date, [s]);
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          ‹
        </button>
        <div className={styles.label}>{formatMonthLabel(month)}</div>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          ›
        </button>
      </div>
      <button type="button" className={styles.today} onClick={() => onMonthChange(new Date())}>
        Heute
      </button>

      <div className={styles.weekdays}>
        {WEEKDAY_SHORT.map((w) => (
          <div key={w} className={styles.weekday}>
            {w}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {grid.map((day) => {
          const date = isoDate(day);
          const inMonth = day.getMonth() === month.getMonth();
          const daySessions = sessionsByDate.get(date) ?? [];
          return (
            <div
              key={date}
              role="button"
              tabIndex={0}
              className={`${styles.cell} ${inMonth ? '' : styles.dim} ${
                date === today ? styles.today2 : ''
              }`}
              onClick={() => onSelectDay(date)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectDay(date);
              }}
            >
              <span className={styles.daynum}>{day.getDate()}</span>
              <span className={styles.pills}>
                {daySessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.pill} ${s.status !== 'planned' ? styles.pillDone : ''}`}
                    style={sessionTypeAccent(typeById.get(s.sessionTypeId))}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(s);
                    }}
                    title={typeById.get(s.sessionTypeId)?.label ?? ''}
                  >
                    {s.time && <span className={styles.pillTime}>{s.time.slice(0, 5)} </span>}
                    {typeById.get(s.sessionTypeId)?.label ?? '?'}
                    {s.ruleId != null && <span className={styles.repeat}> ↻</span>}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
