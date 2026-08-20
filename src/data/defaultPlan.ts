import type {
  BilateralExercise,
  Block,
  Day,
  Exercise,
  ExerciseType,
  Plan,
  UnilateralExercise,
} from '../types';
import { DESC } from './descriptions';

export const uid = (): string => Math.random().toString(36).slice(2, 9);

/** Beidseitige Übung. */
function e(
  name: string,
  type: ExerciseType,
  sets: number,
  reps: string,
  note = '',
): BilateralExercise {
  return { id: uid(), name, type, uni: false, sets, reps, note };
}

/** Einseitige Übung (links/rechts getrennt gezählt). */
function u(
  name: string,
  type: ExerciseType,
  setsL: number,
  setsR: number,
  reps: string,
  note = '',
): UnilateralExercise {
  return { id: uid(), name, type, uni: true, setsL, setsR, reps, note };
}

export function defaultPlan(): Plan {
  const days: Day[] = [
    {
      id: 'mo',
      short: 'Mo',
      slot: 'morgens',
      title: 'Unterkörper + Pistol',
      blocks: [
        {
          kind: 'skill',
          name: 'Skill — Pistol',
          ex: [
            u(
              'Box Pistol',
              'cm',
              6,
              4,
              '3',
              'Links 2 Extra-Sätze. Boxhöhe notieren, mit der Zeit senken',
            ),
            u('Assisted Pistol an Ringen', 'bw', 3, 3, '5', 'Nur so viel ziehen wie nötig'),
          ],
        },
        {
          kind: 'kraft',
          name: 'Kraft',
          ex: [
            u('Bulgarian Split Squat', 'kg', 4, 4, '6-8'),
            u(
              'Einbeiniges Kreuzheben',
              'kg',
              3,
              3,
              '8',
              'Starker Aussenrotations-Reiz im Standbein',
            ),
            u('Step-down von der Box', 'kg', 3, 3, '8', 'Langsam, Kontrolle in der Frontalebene'),
          ],
        },
        {
          kind: 'explosiv',
          name: 'Explosiv',
          ex: [
            e('Kettlebell Swing', 'kg', 6, '8', 'Kraft aus der Hüfte, nicht aus den Armen'),
            e(
              'Standweitsprung',
              'm',
              4,
              '3',
              'Landung ist der Punkt — rechtes Knie nicht einwärts',
            ),
          ],
        },
        {
          kind: 'core',
          name: 'Core',
          ex: [
            e('Hollow Body Hold', 'sek', 4, '—'),
            u('Pallof Press', 'kg', 3, 3, '10'),
            u('Suitcase Carry', 'kg', 3, 0, '30 m', 'Nur links tragen'),
          ],
        },
      ],
    },
    {
      id: 'do',
      short: 'Do',
      slot: 'nachmittags',
      title: 'Push + Handstand',
      blocks: [
        {
          kind: 'skill',
          name: 'Skill — Handstand',
          ex: [
            e('Wall Handstand Hold', 'sek', 5, '—', 'Bauch zur Wand'),
            e('Pike Compression', 'sek', 3, '—'),
            e('Pike Push-up', 'bw', 3, '5'),
          ],
        },
        {
          kind: 'explosiv',
          name: 'Explosiv',
          ex: [
            e('Push Press (LH)', 'kg', 5, '3', 'Impuls aus den Beinen'),
            e('Clap Push-up', 'bw', 5, '3'),
          ],
        },
        {
          kind: 'kraft',
          name: 'Kraft',
          ex: [
            e('Bankdrücken', 'kg', 4, '5-6'),
            e('Liegestütz-Volumen', 'bw', 5, '6-7', 'Ca. 65% vom Maximum, 90 Sek. Pause'),
            e('Dips / Schrägbankdrücken', 'kg', 3, '8'),
            e('Überkopfdrücken KH', 'kg', 3, '8'),
          ],
        },
        {
          kind: 'core',
          name: 'Core',
          ex: [e('Hollow Rocks', 'bw', 3, '10'), u('Dead Bug mit Gewicht', 'kg', 3, 3, '8')],
        },
      ],
    },
    {
      id: 'fr',
      short: 'Fr',
      slot: 'nachmittags',
      title: 'Unterkörper Kraft',
      blocks: [
        {
          kind: 'kraft',
          name: 'Kraft',
          ex: [
            e(
              'Front Squat / Back Squat',
              'kg',
              4,
              '5',
              'Volle Tiefe, solange Becken neutral bleibt',
            ),
            e('Hip Thrust', 'kg', 4, '8'),
            u('Cossack Squat mit KH', 'kg', 3, 3, '6', 'Kraftübung, nicht Dehnung'),
            u('Side-lying Abduction mit Gewicht', 'kg', 3, 4, '12'),
          ],
        },
      ],
    },
    {
      id: 'we',
      short: 'Sa/So',
      slot: 'morgens',
      title: 'Pull + Ausdauer',
      blocks: [
        {
          kind: 'skill',
          name: 'Skill — Klimmzug',
          ex: [
            e('Negative Klimmzüge', 'sek', 5, '3', 'Je 5 Sek. runter. Deine wichtigste Übung'),
            e('Scapular Pulls', 'bw', 3, '8'),
            e('Ring Rows, Füsse erhöht', 'bw', 3, '8-10'),
          ],
        },
        {
          kind: 'explosiv',
          name: 'Explosiv',
          ex: [u('Kettlebell High Pull', 'kg', 5, 5, '5'), e('Explosive Ring Rows', 'bw', 4, '5')],
        },
        {
          kind: 'kraft',
          name: 'Kraft',
          ex: [
            u('Einarmiges KH-Rudern', 'kg', 4, 4, '8'),
            e('Latzug', 'kg', 3, '8'),
            e('Face Pulls', 'kg', 3, '15'),
            e('Bizeps Curls', 'kg', 3, '10'),
          ],
        },
        {
          kind: 'core',
          name: 'Core',
          ex: [e('Hanging Leg Raises', 'bw', 3, '8'), u('Pallof Press', 'kg', 3, 3, '10')],
        },
        {
          kind: 'ausdauer',
          name: 'Ausdauer',
          ex: [
            e(
              'Zone 2 / Intervalle',
              'min',
              1,
              '—',
              'Woche A: 25 Min gleichmässig · Woche B: 8×1 Min hart / 1 Min locker. Nach schwerem Freitag lieber Bike als Rudern',
            ),
          ],
        },
      ],
    },
  ];

  const hip: Block = {
    kind: 'huefte',
    name: 'Hüft-Block',
    ex: [
      u(
        'Side-lying Clam mit Band',
        'band',
        2,
        3,
        '15',
        'Becken senkrecht, nicht nach hinten rollen',
      ),
      u('Side-lying Abduction', 'band', 2, 3, '12', 'Bein leicht hinten, Zehen zur Decke'),
      e('Banded Lateral Walk', 'band', 2, '12 Schritte', 'Oberkörper aufrecht, Spannung halten'),
      u('Stehende Aussenrotation am Band', 'band', 2, 2, '12', 'Standbein arbeitet mit'),
    ],
  };

  return {
    warmup: [
      'Kreislauf 5 Min — Rudern, Bike oder Seilspringen',
      'Morgens zusätzlich: 3 Min länger Kreislauf, bis du wirklich warm bist',
      'Hüftkreisen · 10 pro Richtung',
      'Beinpendel vorne/seitlich · 10 pro Seite',
      'Bird Dog · 8 pro Seite',
      'Glute Bridge · 2×12',
      'Dead Bug · 2×8 pro Seite',
      'Side Plank · 2×20 Sek.',
      'Morgens zusätzlich: erster Arbeitssatz mit halber Last als Testlauf',
    ],
    hip,
    days,
  };
}

/** Ergänzt Übungen um ihre Anleitung, sofern eine unter ihrem Namen hinterlegt ist. */
export function attachDesc(plan: Plan): Plan {
  const all: Block[] = [plan.hip, ...plan.days.flatMap((d) => d.blocks)];
  all.forEach((b) =>
    b.ex.forEach((x: Exercise) => {
      if (!x.desc && DESC[x.name]) x.desc = DESC[x.name];
    }),
  );
  return plan;
}
