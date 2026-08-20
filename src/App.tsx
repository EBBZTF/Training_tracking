import { useState } from 'react';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { DayView } from './components/DayView/DayView';
import { Sheet } from './components/Sheet/Sheet';
import { InfoSheet } from './components/InfoSheet/InfoSheet';
import { EntrySheet } from './components/EntrySheet/EntrySheet';
import { HistorySheet } from './components/HistorySheet/HistorySheet';
import { DataSheet } from './components/DataSheet/DataSheet';
import { Toast } from './components/Toast/Toast';
import type { SheetState } from './components/types';
import { useTrainingState } from './hooks/useTrainingState';
import { useToast } from './hooks/useToast';
import type { ExerciseType, Mode, Side } from './types';

export function App() {
  const toast = useToast();
  const t = useTrainingState(toast.show);
  const [sheet, setSheet] = useState<SheetState>(null);

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

  const closeSheet = () => setSheet(null);

  return (
    <>
      <Header
        today={t.today}
        onTodayChange={t.setToday}
        days={t.plan.days}
        dayId={t.dayId}
        onDayChange={handleDayChange}
      />

      <main>
        <DayView
          day={t.day}
          blocks={t.blocks}
          mode={t.mode}
          warmup={t.plan.warmup}
          session={t.session}
          warmOpen={t.open === 'warm'}
          onToggleWarmOpen={() => t.setOpen(t.open === 'warm' ? null : 'warm')}
          onToggleWarmupItem={t.toggleWarmupItem}
          getVal={t.getVal}
          lastVal={t.lastVal}
          onOpenInfo={(exId) => setSheet({ type: 'info', exId })}
          onOpenEntry={openEntry}
          actions={actions}
          onAddBlock={t.addBlock}
        />
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
            />
          )}
        </Sheet>
      )}

      <Toast message={toast.message} />
    </>
  );
}
