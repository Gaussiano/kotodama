import type { ExerciseProps } from './types';
import { InfoCardView, LearnCard, WordCard } from './LearnCard';
import { ChoiceExercise } from './ChoiceExercise';
import { MatchExercise } from './MatchExercise';
import { KanaExercise } from './KanaExercise';
import { BuildExercise } from './BuildExercise';
import { TypeExercise } from './TypeExercise';
import { ReplyExercise } from './ReplyExercise';
import { SituationExercise } from './SituationExercise';
import { SayItExercise } from './SayItExercise';
import { PriceExercise } from './PriceExercise';
import { ClockExercise } from './ClockExercise';
import { SignExercise } from './SignExercise';
import { SceneExercise } from './SceneExercise';

/** Routes an exercise to its component (spec §6, E1–E15). */
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
    case 'E5':
      return <BuildExercise {...props} exercise={ex} />;
    case 'E6':
      return <TypeExercise {...props} exercise={ex} />;
    case 'E7':
      return <MatchExercise {...props} exercise={ex} />;
    case 'E8':
      return <ReplyExercise {...props} exercise={ex} />;
    case 'E9':
      return <SituationExercise {...props} exercise={ex} />;
    case 'E10':
      return <SayItExercise {...props} exercise={ex} />;
    case 'E11':
      return <KanaExercise {...props} exercise={ex} />;
    case 'E12':
      return <PriceExercise {...props} exercise={ex} />;
    case 'E13':
      return <ClockExercise {...props} exercise={ex} />;
    case 'E14':
      return <SignExercise {...props} exercise={ex} />;
    case 'E15':
      return <SceneExercise {...props} exercise={ex} />;
  }
}
