import type { QuizQuestion } from '../data/quiz-types';

export const PASS_PERCENTAGE = 0.75;
export const HINT_XP_MULTIPLIER = 0.6;
export const CLOSE_XP_MULTIPLIER = 0.75;

export type QuizAnswerQuality = 'correct' | 'close' | 'wrong';

export type QuizAnswerResult = {
  correct: boolean;
  quality?: QuizAnswerQuality;
  usedHint?: boolean;
};

export function getPassingScore(totalQuestions: number) {
  return Math.ceil(totalQuestions * PASS_PERCENTAGE);
}

export function getQuizPassed(correctCount: number, totalQuestions: number) {
  return correctCount >= getPassingScore(totalQuestions);
}

export function getQuizMaxXp(questions: QuizQuestion[]) {
  return questions.reduce((total, question) => total + question.xpValue, 0);
}

export function getQuestionAttemptXp(
  question: QuizQuestion,
  result: QuizAnswerResult,
  options: { isRemediation?: boolean } = {},
) {
  if (!result.correct || options.isRemediation) return 0;
  const multiplier =
    result.usedHint ? HINT_XP_MULTIPLIER :
    result.quality === 'close' ? CLOSE_XP_MULTIPLIER :
    1;
  return Math.round(question.xpValue * multiplier);
}
