import type { Exercise } from '@/domain/exercises';
import type { ExerciseProps } from './types';
import { InfoCardView, LearnCard, WordCard } from './LearnCard';
import { ChoiceExercise } from './ChoiceExercise';
import { MatchExercise } from './MatchExercise';
import { KanaExercise } from './KanaExercise';

/** Routes an exercise to its component. Unimplemented types render a placeholder that auto-completes. */
export function ExerciseView(props: ExerciseProps) {
  const ex = props.exercise;
  switch (ex.type) {
    case 'E1':
      return <LearnCard {...props} exercise={ex} />;
    case 'E1word':
      return <WordCard {...props} exercise={ex} />;
    case 'E1card':
      return <InfoCardView {...props} exercise={ex} />;
    case 'E2':
    case 'E3':
    case 'E4':
      return <ChoiceExercise {...props} exercise={ex} />;
    case 'E7':
      return <MatchExercise {...props} exercise={ex} />;
    case 'E11':
      return <KanaExercise {...props} exercise={ex} />;
    default:
      return <Unsupported exercise={ex} onAutoComplete={props.onAutoComplete} />;
  }
}

function Unsupported({ exercise, onAutoComplete }: { exercise: Exercise; onAutoComplete: ExerciseProps['onAutoComplete'] }) {
  return (
    <div className="card">
      <p className="text-ink-2">Este tipo de ejercicio ({exercise.type}) llega en una fase posterior.</p>
      <button className="btn-secondary mt-4" onClick={() => onAutoComplete({ correct: true, expected: {} })}>
        Saltar
      </button>
    </div>
  );
}
