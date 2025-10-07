// Helper: Group questions by word
export const groupQuestionsByWord = (questions) => {
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
    .map(([, group]) => {
      // Shuffle questions within each word group
      const shuffledQuestions = [...group.questions];
      for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
      }
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
export const calculatePoints = (attempts, timeSpent, isCorrect) => {
  if (!isCorrect) return 0;
  // Base points: 100
  // -10 points per wrong attempt (matching backend formula exactly)
  // -1 point per 5 seconds spent (frontend enhancement for better UX)
  // Maximum time penalty is 30 points
  const wrongAttempts = attempts || 0;
  const timePenalty = Math.min(30, Math.floor((timeSpent || 0) / 5));
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
