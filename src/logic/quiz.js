// Skin Quiz: short questions that make the skin analysis more accurate.
//
// Why: a photo can't reliably show skin TYPE (our 4 skin-type model
// experiments scored near chance), but simple questions about how skin
// feels and behaves can. This is the same idea dermatology questionnaires use.
//
// How it works:
//  - Each answer adds points to dry / normal / oily / combination.
//  - Points become probabilities (points / total), so the app can show
//    confidence bars and the matching algorithm gets a skin type.
//  - The breakout question gives a "prior" for acne level, which is blended
//    with the photo model's prediction (see blendWithPrior in postprocess.js).

export const QUIZ_TYPE_LABELS = ['dry', 'normal', 'oily', 'combination'];

export const QUESTIONS = [
  {
    id: 'afterWash',
    text: 'How does your skin feel 2–3 hours after washing?',
    options: [
      { key: 'tight', label: 'Tight or dry', points: { dry: 2 } },
      { key: 'comfortable', label: 'Comfortable', points: { normal: 2 } },
      { key: 'tzone', label: 'Shiny on forehead/nose only', points: { combination: 2 } },
      { key: 'shiny', label: 'Shiny all over', points: { oily: 2 } },
    ],
  },
  {
    id: 'midday',
    text: 'By midday, how shiny is your face?',
    options: [
      { key: 'none', label: 'Not shiny', points: { dry: 1, normal: 1 } },
      { key: 'tzone', label: 'Only forehead, nose, chin', points: { combination: 2 } },
      { key: 'allOver', label: 'Shiny all over', points: { oily: 2 } },
    ],
  },
  {
    id: 'flaky',
    text: 'Do you get flaky or rough patches?',
    options: [
      { key: 'often', label: 'Often', points: { dry: 2 } },
      { key: 'sometimes', label: 'Sometimes (e.g. cheeks)', points: { dry: 1, combination: 1 } },
      { key: 'never', label: 'Rarely or never', points: { normal: 1, oily: 1 } },
    ],
  },
  {
    id: 'pores',
    text: 'How do your pores look?',
    options: [
      { key: 'small', label: 'Barely visible', points: { dry: 1, normal: 1 } },
      { key: 'nose', label: 'Visible on nose only', points: { combination: 1, normal: 1 } },
      { key: 'large', label: 'Large on most of my face', points: { oily: 2 } },
    ],
  },
  {
    id: 'breakouts',
    text: 'How often do you break out?',
    options: [
      { key: 'rarely', label: 'Rarely' },
      { key: 'sometimes', label: 'A few spots a month' },
      { key: 'often', label: 'Most weeks' },
    ],
  },
  {
    id: 'reacts',
    text: 'Do new products ever sting, burn or turn you red?',
    options: [
      { key: 'often', label: 'Yes, often' },
      { key: 'sometimes', label: 'Sometimes' },
      { key: 'no', label: 'No' },
    ],
  },
];

// Acne prior from the breakout answer, in CONCERN_LABELS order [clear, mild, moderate].
export const BREAKOUT_PRIOR = {
  rarely: [0.6, 0.3, 0.1],
  sometimes: [0.25, 0.5, 0.25],
  often: [0.1, 0.4, 0.5],
};

/**
 * Turn quiz answers into a result.
 * @param answers  { questionId: optionKey }, e.g. { afterWash: 'tight', ... }
 * @returns {
 *   skinType: { label, confidence, probs, source: 'quiz' } | null  (null if no type questions answered)
 *   sensitive: boolean,
 *   acnePrior: [clear, mild, moderate] | null
 * }
 */
export function scoreQuiz(answers = {}) {
  const points = { dry: 0, normal: 0, oily: 0, combination: 0 };
  let answered = 0;

  QUESTIONS.forEach((q) => {
    const opt = q.options.find((o) => o.key === answers[q.id]);
    if (!opt || !opt.points) return;
    answered++;
    Object.entries(opt.points).forEach(([type, p]) => (points[type] += p));
  });

  let skinType = null;
  if (answered > 0) {
    const total = QUIZ_TYPE_LABELS.reduce((sum, l) => sum + points[l], 0);
    const probs = {};
    QUIZ_TYPE_LABELS.forEach((l) => (probs[l] = points[l] / total));
    // Highest score wins; ties go to the earlier label in QUIZ_TYPE_LABELS.
    const label = QUIZ_TYPE_LABELS.reduce((best, l) => (probs[l] > probs[best] ? l : best), QUIZ_TYPE_LABELS[0]);
    skinType = { label, confidence: probs[label], probs, source: 'quiz' };
  }

  return {
    skinType,
    sensitive: answers.reacts === 'often' || answers.reacts === 'sometimes',
    acnePrior: BREAKOUT_PRIOR[answers.breakouts] || null,
  };
}
