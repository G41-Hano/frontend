export const initialDrill = {
  title: '',
  description: '',
  openDate: '',
  dueDate: '',
  questions: [],
  status: 'draft',
  wordlistType: '', // 'builtin' or 'custom'
  wordlistName: '',
  word: '',
  definition: '',
  customWordList: [], // For custom word lists
};

export const emptyQuestion = {
  text: '',
  type: 'M', 
  pattern: '', // For Blank Buster
  hint: '',    // For hint
  answer: '',  // For Blank Buster and other types
  choices: [
    { text: '', media: null },
    { text: '', media: null },
    { text: '', media: null },
    { text: '', media: null },
  ],
  blankPosition: null,
  dragItems: [], // For Drag and Drop questions
  memoryCards: [], // For Memory Game questions
  pictureWord: [], // For Picture Word questions
  sentence: '', // For Drag and Drop sentence with blanks
  letterChoices: [], // For Blank Buster letter choices
};