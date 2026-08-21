import { useEffect, useState } from 'react';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { DayView } from './components/DayView/DayView';
import { CalendarView } from './components/CalendarView/CalendarView';
import { Sheet } from './components/Sheet/Sheet';
import { InfoSheet } from './components/InfoSheet/InfoSheet';
import { EntrySheet } from './components/EntrySheet/EntrySheet';
import { HistorySheet } from './components/HistorySheet/HistorySheet';
import { DataSheet } from './components/DataSheet/DataSheet';
import { AddSessionSheet } from './components/AddSessionSheet/AddSessionSheet';
import { SessionDetailSheet } from './components/SessionDetailSheet/SessionDetailSheet';
import { Toast } from './components/Toast/Toast';
import { AuthScreen } from './components/AuthScreen/AuthScreen';
import type { SheetState } from './components/types';
import { useTrainingState } from './hooks/useTrainingState';
import { usePlannedSessions } from './hooks/usePlannedSessions';
import { useToast } from './hooks/useToast';
import { useAuth } from './auth/AuthContext';
import type { ExerciseType, Mode, Side } from './types';
import { monthRange } from './utils/date';

export function App() {
  const { status, user, logout } = useAuth();

  if (status === 'loading') return null;
  if (status === 'anonymous') return <AuthScreen />;

  return <TrainingApp userEmail={user?.email ?? ''} onLogout={logout} />;
}

function TrainingApp({ userEmail, onLogout }: { userEmail: string; onLogout: () => void }) {
  const toast = useToast();
  const t = useTrainingState(toast.show);
  const sessions = usePlannedSessions(toast.show);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [view, setView] = useState<'training' | 'calendar'>('training');
  const [month, setMonth] = useState(() => new Date());

  useEffect(() => {
    const { from, to } = monthRange(month);
    sessions.setVisibleRange(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  if (!t.ready) return null;

  const handleDayChange = (dayId: string) => {
    t.setDayId(dayId);
    t.setOpen(null);
  };

  const handleModeChange = (mode: Mode) => {
    t.setMode(mode);
    t.setOpen(null);
  };

  const openEntry = (exId: string, side: Side, index: number, name: string, exType: ExerciseType) =>
    setSheet({ type: 'entry', exId, side, index, name, exType });

  const actions = {
    addExercise: t.addExercise,
    deleteExercise: t.deleteExercise,
    moveExercise: t.moveExercise,
    setUni: t.setExerciseUni,
    setType: t.setExerciseType,
    setText: t.setExerciseText,
    setSets: t.setExerciseSets,
  };

  const warmupActions = {
    addWarmupItem: t.addWarmupItem,
    deleteWarmupItem: t.deleteWarmupItem,
    moveWarmupItem: t.moveWarmupItem,
    setWarmupText: t.setWarmupText,
  };

  const closeSheet = () => setSheet(null);

  return (
    <>
      <Header
        today={t.today}
        onTodayChange={t.setToday}
        days={t.plan.days}
        dayId={t.dayId}
        onDayChange={handleDayChange}
        view={view}
        onViewChange={setView}
      />

      <main>
        {view === 'training' ? (
          <DayView
            day={t.day}
            blocks={t.blocks}
            mode={t.mode}
            warmup={t.plan.warmup}
            session={t.session}
            warmOpen={t.open === 'warm'}
            onToggleWarmOpen={() => t.setOpen(t.open === 'warm' ? null : 'warm')}
            onToggleWarmupItem={t.toggleWarmupItem}
            warmupActions={warmupActions}
            getVal={t.getVal}
            lastVal={t.lastVal}
            onOpenInfo={(exId) => setSheet({ type: 'info', exId })}
            onOpenEntry={openEntry}
            actions={actions}
            onAddBlock={t.addBlock}
          />
        ) : (
          <CalendarView
            month={month}
            onMonthChange={setMonth}
            sessions={sessions.sessions}
            types={sessions.types}
            onSelectDay={(date) => setSheet({ type: 'addSession', date })}
            onSelectSession={(session) => setSheet({ type: 'sessionDetail', session })}
          />
        )}
      </main>

      <Footer
        mode={t.mode}
        onModeChange={handleModeChange}
        onOpenHistory={() => setSheet({ type: 'history' })}
        onOpenData={() => setSheet({ type: 'data' })}
      />

      {sheet && (
        <Sheet onClose={closeSheet}>
          {sheet.type === 'info' &&
            (() => {
              const exercise = t.findExercise(sheet.exId);
              return exercise ? <InfoSheet exercise={exercise} onClose={closeSheet} /> : null;
            })()}

          {sheet.type === 'entry' && (
            <EntrySheet
              key={`${sheet.exId}-${sheet.side}-${sheet.index}`}
              name={sheet.name}
              type={sheet.exType}
              side={sheet.side}
              index={sheet.index}
              current={t.getVal(sheet.exId, sheet.side, sheet.index)}
              last={t.lastVal(sheet.exId, sheet.side, sheet.index)}
              onSubmit={(value) => {
                t.setVal(sheet.exId, sheet.side, sheet.index, value);
                closeSheet();
              }}
              onClear={() => {
                t.setVal(sheet.exId, sheet.side, sheet.index, '');
                closeSheet();
              }}
            />
          )}

          {sheet.type === 'history' && <HistorySheet plan={t.plan} logs={t.logs} />}

          {sheet.type === 'data' && (
            <DataSheet
              state={{ plan: t.plan, logs: t.logs }}
              today={t.today}
              onImport={(data) => {
                t.importState(data);
                closeSheet();
              }}
              onReset={() => {
                t.resetPlan();
                closeSheet();
              }}
              notify={toast.show}
              userEmail={userEmail}
              onLogout={onLogout}
            />
          )}

          {sheet.type === 'addSession' && (
            <AddSessionSheet
              date={sheet.date}
              types={sessions.types}
              onAddType={sessions.addSessionType}
              onSubmit={async (input) => {
                const created = await sessions.addSession(input);
                if (created) closeSheet();
              }}
            />
          )}

          {sheet.type === 'sessionDetail' && (
            <SessionDetailSheet
              key={sheet.session.id}
              session={sheet.session}
              type={sessions.types.find((ty) => ty.id === sheet.session.sessionTypeId)}
              onReschedule={async (date, time) => {
                const updated = await sessions.reschedule(sheet.session.id, date, time);
                if (updated) closeSheet();
              }}
              onMarkStatus={async (status) => {
                const updated = await sessions.markStatus(sheet.session.id, status);
                if (updated) closeSheet();
              }}
              onDelete={async () => {
                const ok = await sessions.removeSession(sheet.session.id);
                if (ok) closeSheet();
              }}
            />
          )}
        </Sheet>
      )}

      <Toast message={toast.message} />
    </>
  );
}
