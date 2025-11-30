// Seeded random number generator for consistent shuffling
const seededRandom = (seed) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Fisher-Yates shuffle with seed
const shuffleWithSeed = (array, seed) => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280; // Linear congruential generator
    const j = Math.floor(seededRandom(currentSeed) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Helper: Group questions by word
export const groupQuestionsByWord = (questions, shuffleSeed = Math.random()) => {
  const map = {};
  questions.forEach(q => {
    const wordKey = q.word_id || q.word; // Use word_id if available, otherwise use word as key
    if (!map[wordKey]) {
      map[wordKey] = {
        word: q.word,
        definition: q.definition,
        image: q.image,
        signVideo: q.signVideo,
        questions: []
      };
    }
    map[wordKey].questions.push(q);
  });
  
  // Convert map to array and maintain word order
  const sortedGroups = Object.entries(map)
    .sort(([keyA], [keyB]) => {
      // Get first question from each group to determine order
      const firstQuestionA = map[keyA].questions[0];
      const firstQuestionB = map[keyB].questions[0];
      return questions.indexOf(firstQuestionA) - questions.indexOf(firstQuestionB);
    })
    .map(([, group], groupIndex) => {
      // Shuffle questions within each word group using seed
      // Use different seed for each group to ensure variety
      const groupSeed = shuffleSeed + groupIndex * 1000;
      const shuffledQuestions = shuffleWithSeed(group.questions, groupSeed);
      return { ...group, questions: shuffledQuestions };
    });
  
  return sortedGroups;
};

// Calculate total steps for the entire drill
export const calculateTotalSteps = (wordGroups) => {
  let total = 1; // Global intro
  for (let i = 0; i < wordGroups.length; i++) {
    total += 4; // 4 steps per word (intro, definition, sign, transition)
    total += wordGroups[i].questions.length; // Add questions for this word
  }
  return total;
};

// Calculate current step number
export const calculateCurrentStep = (introStep, currentWordIdx, currentQuestionIdx, wordGroups) => {
  // If we're on the congratulations page, return total steps
  if (introStep === 6) {
    return calculateTotalSteps(wordGroups);
  }
  
  if (introStep === 0) return 1; // Global intro
  
  let step = 1; // Start after global intro
  
  // Add completed words
  for (let i = 0; i < currentWordIdx; i++) {
    step += 4; // 4 intro steps per completed word
    step += wordGroups[i].questions.length; // Questions in completed words
  }
  
  // Add current word progress
  if (introStep < 5) {
    step += introStep - 1; // Subtract 1 because we want progress to show before the step is complete
  } else {
    step += 4; // All intro steps for current word are done
    step += currentQuestionIdx; // Only count completed questions
  }
  
  return step;
};

// Points calculation helper - frontend is the single source of truth for scoring
export const calculatePoints = (attempts, timeSpent, isCorrect, questionType = null) => {
  if (!isCorrect) return 0;

  // Base points: 100
  // -10 points per wrong attempt (matching backend formula exactly)
  // -1 point per 5 seconds spent (frontend enhancement for better UX)
  // Maximum time penalty is 30 points

  const wrongAttempts = attempts || 0;

  // Adjust time penalty based on question type
  let timePenaltyMultiplier = 1;
  let timePenaltyThreshold = 15;
  
  if (questionType === 'G') {
    // Memory games need more time due to animations and multiple interactions
    // -1 point per 20 seconds
    timePenaltyMultiplier = 1;
    timePenaltyThreshold = 20;
  }
  
  const timePenalty = Math.min(30, Math.floor((timeSpent || 0) / timePenaltyThreshold) * timePenaltyMultiplier);

  const points = Math.max(0, 100 - (wrongAttempts * 10) - timePenalty);
  return points;
};

// Initialize or reset currentAnswer based on question type
export const initializeAnswer = (question) => {
  if (!question) return '';
  
  switch (question.type) {
    case 'M':
      return -1;
    case 'F':
      return Array(question.pattern.split('_').length - 1).fill(undefined);
    case 'D':
      return Array(question.dragItems?.length || 0).fill(null);
    case 'G':
      return [];
    case 'P':
    default:
      return '';
  }
};
