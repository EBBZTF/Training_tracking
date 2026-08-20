/** Anleitungstexte, per Übungsname nachgeschlagen und beim Erststart in den Plan geschrieben. */
export const DESC: Record<string, string> = {
  'Side-lying Clam mit Band':
    'Seitlage, Knie 90° gebeugt, Band über den Knien. Die Füsse bleiben zusammen, das obere Knie öffnet sich wie eine Muschel. Becken senkrecht halten und nicht nach hinten rollen — sonst übernimmt der Rumpf die Arbeit.',
  'Side-lying Abduction':
    'Seitlage, oberes Bein gestreckt und leicht nach hinten geführt, Zehen zeigen leicht zur Decke. Bein anheben und langsam senken. Die Rückführung nach hinten trifft die hinteren Fasern des Glutaeus medius.',
  'Banded Lateral Walk':
    'Band über den Knien, leichte Kniebeuge, seitliche Schritte. Oberkörper aufrecht, die Spannung im Band nie ganz verlieren. Nicht die Füsse zusammenziehen zwischen den Schritten.',
  'Stehende Aussenrotation am Band':
    'Band um ein Bein, im Stand das Bein gegen den Bandzug nach aussen drehen. Das Standbein arbeitet aktiv mit und ist Teil der Übung, nicht nur Stütze.',
  'Box Pistol':
    'Einbeinig vor einer Box stehen, das freie Bein nach vorne gestreckt. Kontrolliert auf die Box absetzen und wieder hoch. Abbruchkriterium ist nicht die Kraft, sondern das Becken: sobald es hinten wegkippt, ist die Box zu niedrig.',
  'Assisted Pistol an Ringen':
    'Wie ein voller Pistol Squat, aber die Hände halten sich an Ringen oder TRX. Nur so viel ziehen wie nötig — die Hilfe soll mit der Zeit weniger werden.',
  'Bulgarian Split Squat':
    'Hinterer Fuss erhöht auf einer Bank, das vordere Bein macht die Arbeit. Kurzhanteln in den Händen. Oberkörper leicht vorgeneigt.',
  'Einbeiniges Kreuzheben':
    'Auf einem Bein stehen, den Oberkörper nach vorne kippen während das freie Bein nach hinten steigt. Rücken gerade, Hüfte bleibt waagrecht. Starker Aussenrotations-Reiz im Standbein.',
  'Step-down von der Box':
    'Auf einer Box stehen, ein Bein langsam absenken bis die Ferse den Boden tippt, dann kontrolliert zurück. Das Standbein-Knie darf dabei nicht nach innen wandern.',
  'Kettlebell Swing':
    'Hüftbeugung mit geradem Rücken, Kettlebell zwischen den Beinen durch und explosiv durch Hüftstreckung nach vorne schwingen. Die Kraft kommt aus der Hüfte, nicht aus den Armen — die Arme sind nur Seile.',
  Standweitsprung:
    'Aus dem Stand mit beiden Beinen so weit wie möglich nach vorne springen, weich auf beiden Füssen landen, kurz stabilisieren. Jeder Sprung startet aus dem Stillstand, kein Hüpf-Rhythmus. Die Landung ist der eigentliche Punkt: rechtes Knie darf nicht nach innen kippen. Von vorne filmen, notfalls kürzer springen.',
  'Hollow Body Hold':
    'Rückenlage, Arme und Beine gestreckt leicht über dem Boden, unterer Rücken fest an den Boden gedrückt. Der Körper bildet eine flache Schale. Löst sich der Rücken vom Boden, ist die Position zu flach — Arme oder Beine höher nehmen.',
  'Pallof Press':
    'Seitlich zum Kabelzug oder Band stehen, Griff vor der Brust, die Arme nach vorne strecken und der Rotation widerstehen. Es bewegt sich nichts ausser den Armen.',
  'Suitcase Carry':
    'Ein schweres Gewicht einhändig wie einen Koffer tragen. Oberkörper bleibt aufrecht und gerade, keine Seitneigung. Hier bewusst nur links tragen.',
  'Wall Handstand Hold':
    'Mit den Füssen die Wand hochlaufen bis der Bauch zur Wand zeigt und der Körper gestreckt ist. Deutlich wertvoller als die Rücken-zur-Wand-Version, weil sie die richtige Linie erzwingt.',
  'Pike Compression':
    'Sitzen mit gestreckten Beinen, Hände neben der Hüfte, aktiv die Beine vom Boden abheben. Sieht nach wenig aus und ist eine der härtesten Voraussetzungen für den Press Handstand.',
  'Pike Push-up':
    'Umgekehrtes V mit hoher Hüfte, Kopf Richtung Boden senken und drücken. Ein Liegestütz in Schulterdrück-Position.',
  'Push Press (LH)':
    'Langhantel auf Schulterhöhe, kurze Kniebeuge, dann explosiv über Kopf drücken. Der Impuls kommt aus den Beinen, die Arme führen nur zu Ende.',
  'Clap Push-up':
    'Liegestütz mit so viel Druck, dass die Hände abheben. Auf einer Bank erhöht ist die einfachere Einstiegsvariante.',
  Bankdrücken:
    'Rückenlage auf der Bank, Gewicht kontrolliert zur Brust senken und nach oben drücken. Schulterblätter bleiben zusammengezogen.',
  'Liegestütz-Volumen':
    'Saubere Liegestütz, Körper in einer Linie von Kopf bis Ferse. Bewusst nicht bis zum Versagen — ca. 65 % deines Maximums pro Satz. Das Volumen ist der Motor Richtung 20, nicht die Maximalversuche.',
  'Dips / Schrägbankdrücken':
    'Dips: an Barren stützen, Körper absenken bis der Oberarm waagrecht ist, dann drücken. Schrägbank: Bankdrücken mit 30–45° Neigung.',
  'Überkopfdrücken KH':
    'Im Stehen oder Sitzen Kurzhanteln von Schulterhöhe über Kopf drücken, ohne Beinimpuls. Rippen unten halten, nicht ins Hohlkreuz ausweichen.',
  'Hollow Rocks':
    'Die Hollow-Position einnehmen und in dieser Form vor und zurück schaukeln. Die Form darf sich beim Schaukeln nicht verändern.',
  'Dead Bug mit Gewicht':
    'Rückenlage, Arme zur Decke, Beine im 90°-Winkel, Hantel in den Händen. Gegenüberliegender Arm und Bein senken sich ab, der untere Rücken bleibt am Boden.',
  'Front Squat / Back Squat':
    'Kniebeuge mit der Langhantel vorne auf den Schultern (Front) oder im Nacken (Back). Volle Tiefe, solange das Becken neutral bleibt und nicht hinten wegkippt.',
  'Hip Thrust':
    'Schultern auf einer Bank, Langhantel über der Hüfte (gepolstert), Becken kraftvoll nach oben drücken bis Knie, Hüfte und Schulter eine waagrechte Linie bilden. Oben kurz halten.',
  'Cossack Squat mit KH':
    'Breiter Stand, Gewicht auf ein Bein verlagern und tief absinken, das andere Bein bleibt gestreckt mit angehobener Fussspitze. Hier als Kraftübung geführt, nicht als Dehnung.',
  'Side-lying Abduction mit Gewicht':
    'Wie im Hüft-Block, aber mit Gewichtsmanschette oder Kurzhantel auf dem Oberschenkel. Langsam senken, das ist der wertvolle Teil.',
  'Zone 2 / Intervalle':
    'Zone 2: gleichmässiges Tempo, bei dem du dich noch in ganzen Sätzen unterhalten könntest. Intervalle: 8× eine Minute hart, eine Minute locker. Gelenkschonend bevorzugt — Rudern, Bike, Crosstrainer.',
  'Negative Klimmzüge':
    'Von einer Box in die obere Klimmzugposition springen, Kinn über der Stange, dann so langsam wie möglich absenken — Ziel 5 Sekunden. Deine wichtigste Übung für den ersten sauberen Klimmzug.',
  'Scapular Pulls':
    'Im Hang nur die Schulterblätter nach unten und zusammenziehen, die Arme bleiben gestreckt. Der Körper hebt sich dabei nur wenige Zentimeter.',
  'Ring Rows, Füsse erhöht':
    'Unter den Ringen hängend den Körper zu den Ringen ziehen. Je waagrechter der Körper, desto schwerer. Die Füsse erhöht zu stellen macht es deutlich anspruchsvoller.',
  'Kettlebell High Pull':
    'Wie ein Swing, aber am Umkehrpunkt wird die Kettlebell mit dem Ellenbogen nach hinten auf Brusthöhe gezogen. Der Schwung kommt weiterhin aus der Hüfte.',
  'Explosive Ring Rows':
    'Ring Row so kraftvoll ausgeführt, dass die Hände am oberen Punkt kurz abheben könnten. Tempo statt Last.',
  'Einarmiges KH-Rudern':
    'Eine Hand und ein Knie auf der Bank, Kurzhantel zur Hüfte ziehen. Der Oberkörper bleibt ruhig und dreht nicht mit.',
  Latzug:
    'Am Kabelzug sitzend die Stange zur oberen Brust ziehen. Ellenbogen nach unten denken, nicht die Arme nach hinten reissen.',
  'Face Pulls':
    'Seil am Kabelzug auf Gesichtshöhe zum Gesicht ziehen, Ellenbogen hoch und weit aussen. Gut für die Schultergesundheit beim vielen Drücken.',
  'Bizeps Curls':
    'Kurzhanteln aus gestreckten Armen zur Schulter beugen. Ellenbogen bleiben am Körper.',
  'Hanging Leg Raises':
    'Im Hang an der Stange die gestreckten Beine anheben. Vorher die Schulterblätter aktivieren, nicht passiv durchhängen.',
};
