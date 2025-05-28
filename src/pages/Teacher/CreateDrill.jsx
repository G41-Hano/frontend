import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import ClassroomHeader from './ClassroomHeader';
import Definitions, {useDefinitionFetcher} from '../../components/gen-ai/GenerateDefinition';
import CreateCustomWordList from '../../components/CreateCustomWordList';

const initialDrill = {
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

const emptyQuestion = {
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
  dropZones: [], // For Drag and Drop questions
  memoryCards: [], // For Memory Game questions
  pictureWord: [], // For Picture Word questions
  story_title: '',
  story_context: '',
  sign_language_instructions: '',
  sentence: '', // For Drag and Drop sentence with blanks
  letterChoices: [], // For Blank Buster letter choices
};

const Stepper = ({ step, setStep }) => (
  <div className="flex justify-center gap-4 mb-8">
    {["Overview", "Word List", "Add Questions", "Review"].map((label, i) => {
      const isClickable = i < step;
      return (
        <div
          key={label}
          className={`flex items-center gap-2 ${step === i ? 'font-bold text-[#4C53B4]' : 'text-gray-400'}`}
        >
          <button
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && setStep(i)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition
              ${step === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-300 bg-white'}
              ${isClickable ? 'cursor-pointer hover:border-[#4C53B4] hover:bg-[#EEF1F5]' : 'cursor-default'}
            `}
            style={{ outline: 'none', border: 'none', padding: 0 }}
            tabIndex={isClickable ? 0 : -1}
          >
            {i + 1}
          </button>
          <span
            className={isClickable ? 'cursor-pointer hover:text-[#4C53B4]' : ''}
            onClick={() => isClickable && setStep(i)}
          >
            {label}
          </span>
          {i < 3 && <div className="w-8 h-1 bg-gray-200 rounded-full" />}
      </div>
      );
    })}
  </div>
);

export const FileInput = ({ value, onChange, onPreview }) => {
  const isFile = value instanceof File;
  const src = isFile ? URL.createObjectURL(value) : (value && value.url ? value.url : '');
  const [inputKey, setInputKey] = useState(0);
  const handleRemove = () => {
    onChange(null);
    setInputKey(k => k + 1);
  };
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <label className="cursor-pointer px-3 py-1 bg-[#EEF1F5] rounded-lg border border-gray-200 text-sm text-[#4C53B4] hover:bg-[#e6e9ff]">
        <i className="fa-solid fa-paperclip mr-1"></i> {value ? 'Change File' : 'Add File'}
        <input
          key={inputKey}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            onChange(file);
          }}
        />
      </label>
      {src && value && value.type && value.type.startsWith('image/') && (
        <div className="relative mt-1 w-full">
          <img
            src={src}
            alt="preview"
            className="w-full max-h-48 object-cover rounded border cursor-pointer"
            onClick={() => onPreview && onPreview(src, value.type)}
          />
          <button
            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700"
            onClick={handleRemove}
            type="button"
            style={{lineHeight:0}}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      {src && value && value.type && value.type.startsWith('video/') && (
        <div className="relative mt-1 w-full">
          <video
            src={src}
            className="w-full max-h-48 object-cover rounded border cursor-pointer"
            controls
            onClick={() => onPreview && onPreview(src, value.type)}
          />
          <button
            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700"
            onClick={handleRemove}
            type="button"
            style={{lineHeight:0}}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      {value && value.name && (
        <span className="truncate max-w-[120px] text-xs text-gray-500 mt-1">{value.name}</span>
      )}
    </div>
  );
};

// New component for AI generation button
export const AiGenerateButton = ({ onClick, loading, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={`px-3 py-1 rounded-lg border border-[#4C53B4] text-[#4C53B4] hover:bg-[#EEF1F5] transition ${loading ? 'opacity-50' : ''} ${className}`}
    title="Generate with AI"
  >
    <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
  </button>
);

const MemoryGameCard = ({ card, cards, onRemove, onTextChange, onMediaChange, onPairChange, setNotification, setMediaModal }) => {
  const handleMediaChange = (file) => {
    if (file && !file.type.startsWith('image/')) {
      setNotification({
        show: true,
        message: 'Only image files are allowed for Memory Game cards.',
        type: 'error'
      });
      // Auto-hide notification after a few seconds
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    onMediaChange(file);
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <input
          type="text"
          value={card.content}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter text content"
          className="flex-1 mr-2 p-2 border rounded"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
      <FileInput
        value={card.media}
        onChange={handleMediaChange}
        onPreview={(src, type) => setMediaModal({ open: true, src, type })}
      />
      <div className="mt-2">
        <label className="block text-xs text-gray-600 mb-1">Pair With</label>
        <select
          className="w-full border rounded p-1"
          value={card.pairId || ''}
          onChange={e => onPairChange(e.target.value)}
        >
          <option value="">Select a card</option>
          {cards.filter(c => c.id !== card.id).map(c => (
            <option key={c.id} value={c.id}>
              {c.content || c.media?.name || c.media?.url || 'Card'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const MemoryGameQuestionForm = ({ question, onChange, setNotification, setMediaModal }) => {
  const addCard = () => {
    const newCard = {
      id: `card_${Date.now()}`,
      content: '',
      pairId: '',
      media: null
    };
    onChange({
      ...question,
      memoryCards: [...(question.memoryCards || []), newCard]
    });
  };

  const removeCard = (cardId) => {
    const cards = (question.memoryCards || []).filter(card => card.id !== cardId);
    // Remove pairings to this card
    const updatedCards = cards.map(card => {
      if (card.pairId === cardId) {
        return { ...card, pairId: '' };
      }
      return card;
    });
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  const updateCard = (cardId, field, value) => {
    const updatedCards = (question.memoryCards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, [field]: value };
      }
      return card;
    });
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  const updateCardMedia = (cardId, file) => {
    const updatedCards = (question.memoryCards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, media: file };
      }
      return card;
    });
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  const updateCardPair = (cardId, pairId) => {
    let updatedCards = (question.memoryCards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, pairId };
      }
      // If this card was previously paired with cardId, clear it if the new pairId is not this card
      if (card.pairId === cardId && pairId !== card.id) {
        return { ...card, pairId: '' };
      }
      return card;
    });
    // Make the pairing mutual
    if (pairId) {
      updatedCards = updatedCards.map(card => {
        if (card.id === pairId) {
          return { ...card, pairId: cardId };
        }
        return card;
      });
    }
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Memory Game Cards</h3>
        <button
          type="button"
          onClick={addCard}
          className="px-3 py-1 bg-[#4C53B4] text-white rounded hover:bg-[#3a3f8f]"
        >
          Add Card
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(question.memoryCards || []).map((card) => (
          <MemoryGameCard
            key={card.id}
            card={card}
            cards={question.memoryCards}
            onRemove={() => removeCard(card.id)}
            onTextChange={(value) => updateCard(card.id, 'content', value)}
            onMediaChange={(file) => updateCardMedia(card.id, file)}
            onPairChange={(pairId) => updateCardPair(card.id, pairId)}
            setNotification={setNotification}
            setMediaModal={setMediaModal}
          />
        ))}
      </div>
      {(question.memoryCards || []).length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <i className="fa-solid fa-info-circle mr-2"></i>
            Make sure to add an even number of cards for matching pairs. Each card should have either text or media content. Use the 'Pair With' dropdown to set matching pairs. Each pair must be unique and mutual.
          </p>
        </div>
      )}
    </div>
  );
};

const PictureWordQuestionForm = ({ question, onChange }) => {
  const addPicture = () => {
    const newPicture = {
      id: `pic_${Date.now()}`,
      media: null
    };
    onChange({
      ...question,
      pictureWord: [...(question.pictureWord || []), newPicture]
    });
  };

  const removePicture = (picId) => {
    const pictures = (question.pictureWord || []).filter(pic => pic.id !== picId);
    onChange({
      ...question,
      pictureWord: pictures
    });
  };

  const updatePicture = (picId, file) => {
    const updatedPictures = (question.pictureWord || []).map(pic => {
      if (pic.id === picId) {
        return { ...pic, media: file };
      }
      return pic;
    });
    onChange({
      ...question,
      pictureWord: updatedPictures
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Four Pics One Word</h3>
        <button
          type="button"
          onClick={addPicture}
          className="px-3 py-1 bg-[#4C53B4] text-white rounded hover:bg-[#3a3f8f]"
          disabled={(question.pictureWord || []).length >= 4}
        >
          Add Picture
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(question.pictureWord || []).map((pic, index) => (
          <div key={pic.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-600 mb-2 block">Picture {index + 1}</span>
              <button
                type="button"
                onClick={() => removePicture(pic.id)}
                className="text-red-500 hover:text-red-700"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
            <FileInput
              value={pic.media}
              onChange={(file) => updatePicture(pic.id, file)}
            />
          </div>
        ))}
      </div>
      {/* Correct answer field */}
      <div className="mt-4">
        <label className="block mb-1 font-medium">Correct Answer</label>
        <input
          type="text"
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
          placeholder="Enter the correct word that connects all pictures"
          value={question.answer || ''}
          onChange={(e) => onChange({ ...question, answer: e.target.value })}
        />
      </div>
      {(question.pictureWord || []).length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <i className="fa-solid fa-info-circle mr-2"></i>
            Add exactly 4 pictures that have a common word or theme. Make sure each picture is clear and relevant to the answer.
          </p>
        </div>
      )}
    </div>
  );
};

const CreateDrill = ({ onDrillCreated, classroom, students }) => {
  const [step, setStep] = useState(0);
  const [drill, setDrill] = useState(initialDrill);
  const [questionEditIdx, setQuestionEditIdx] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion);
  const [selectedQuestionWord, setSelectedQuestionWord] = useState('');
  const [selectedQuestionWordData, setSelectedQuestionWordData] = useState({});
  const [builtinWords, setBuiltinWords] = useState([]); // <-- for builtin words
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [successMsg, setSuccessMsg] = useState('');
  const [mediaModal, setMediaModal] = useState({ open: false, src: '', type: '' });
  const [submittingAction, setSubmittingAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const questionFormRef = useRef(null);
  const [aiLoading, setAiLoading] = useState({ definition: false, question: false });
  const definitionFetcher = useDefinitionFetcher();

  // New: Built-in word lists state
  const [builtinWordLists, setBuiltinWordLists] = useState([]);
  const [customListDesc, setCustomListDesc] = useState('');
  const [aiLoadingListDesc, setAiLoadingListDesc] = useState(false);

  // Fetch built-in word lists when needed
  useEffect(() => {
    if (step === 1 && drill.wordlistType === 'builtin') {
      api.get('/api/builtin-wordlist/')
        .then(res => {
          setBuiltinWordLists(res.data);
        })
        .catch(() => {
          setNotification({ show: true, message: 'Failed to load word lists', type: 'error' });
        });
    }
  }, [step, drill.wordlistType]);

  useEffect(() => {
    if (!drill.openDate) return;
    const open = new Date(drill.openDate);
    open.setMinutes(open.getMinutes() + 10);
    const minDue = open.toISOString().slice(0, 16);
    if (drill.dueDate && drill.dueDate < minDue) {
      setDrill(d => ({ ...d, dueDate: minDue }));
    }
  }, [drill.openDate, drill.dueDate]);

  // Add generateDefinitionForWord function
  const generateDefinitionForWord = async (index, word) => {
    if (!word) return;
    
    setAiLoading(prev => ({ ...prev, definition: true }));
    try {
      const definition = await definitionFetcher(word);
      handleUpdateCustomWord(index, 'definition', definition);
      setNotification({
        show: true,
        message: 'Definition generated successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to generate definition:', err);
      setNotification({
        show: true,
        message: 'Failed to generate definition: ' + (err.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setAiLoading(prev => ({ ...prev, definition: false }));
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  // New function for AI question generation
  const generateQuestion = async () => {
    setAiLoading(prev => ({ ...prev, question: true }));
    try {
      let defaultQuestion = '';
      let defaultAnswer = '';
      let defaultChoices = [];
      let defaultPattern = '';
      let defaultHint = '';
      let word = '';
      let pattern = '';
      let missingLetters = [];
      let letterChoices = [];
      const allPossibleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      
      // Generate default content based on question type
      switch(questionDraft.type) {
        case 'M': {
          // Get available words excluding the current word
          const availableWords = getAvailableWords().filter(w => w.word !== selectedQuestionWord);
          
          // Shuffle available words for random selection
          const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);
          
          // Create choices array with correct definition and other word definitions
          let choices = [];
          
          // Randomly place the correct answer
          const correctAnswerPosition = Math.floor(Math.random() * 4); // Random position 0-3
          
          // Fill all positions
          for (let i = 0; i < 4; i++) {
            if (i === correctAnswerPosition) {
              choices[i] = { text: selectedQuestionWordData.definition || 'Correct definition here', media: null };
            } else {
              const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
              choices[i] = { text: otherWord?.definition || `Alternative word definition ${i + 1}`, media: null };
            }
          }

          defaultQuestion = `What is the definition of "${selectedQuestionWord}"?`;
          defaultChoices = choices;
          defaultAnswer = correctAnswerPosition;
          break;
        }
          
        case 'F': {
          word = selectedQuestionWord.toUpperCase();
          
          // Ensure word is at least 4 letters long
          if (word.length < 4) {
            throw new Error('Word must be at least 4 letters long for Blank Buster');
          }
          
          // Create pattern with first and last letters visible
          pattern = word.split('').map((char, idx) => 
            idx === 0 || idx === word.length - 1 ? char : '_'
          ).join(' ');
          
          // Find missing letter indices
          const missingIndices = word.split('').reduce((acc, char, idx) => {
            if (idx !== 0 && idx !== word.length - 1) acc.push(idx);
            return acc;
          }, []);
          
          // Get missing letters
          missingLetters = missingIndices.map(idx => word[idx]);
          
          // Create letter choices: include missing letters and some random letters
          letterChoices = [
            ...missingLetters,
            ...allPossibleLetters
              .filter(l => !missingLetters.includes(l))
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.max(0, 6 - missingLetters.length))
          ].sort(() => Math.random() - 0.5);
          
          // Ensure unique letter choices
          letterChoices = [...new Set(letterChoices)];
          
          defaultQuestion = `Complete the word by filling in the missing letters:`;
          defaultPattern = pattern;
          defaultAnswer = word;
          defaultHint = `Hint: ${selectedQuestionWordData.definition || 'A word related to the lesson'}`;
          
          // Create choices for the question (optional, but can help with validation)
          defaultChoices = letterChoices.map(letter => ({
            text: letter,
            is_correct: missingLetters.includes(letter)
          }));
          break;
        }
        case 'D': {
          defaultQuestion = `Build the correct sentence using the given words:`;
          defaultAnswer = selectedQuestionWord;
          break;
        }
          
        case 'G': {
          defaultQuestion = `Find matching pairs to complete this exercise:`;
          break;
        }
          
        case 'P': {
          defaultQuestion = `What word connects all these pictures?`;
          defaultAnswer = selectedQuestionWord;
          break;
        }
        
        default:
          break;
      }

      const newQuestionDraft = {
        ...questionDraft,
        text: defaultQuestion,
        answer: defaultAnswer,
        pattern: defaultPattern,
        hint: defaultHint,
        letterChoices: questionDraft.type === 'F' ? letterChoices : undefined,
        choices: defaultChoices
      };

      setQuestionDraft(newQuestionDraft);
    } catch (err) {
      console.error('Failed to generate question:', err);
      setNotification({
        show: true,
        message: 'Failed to generate question: ' + (err.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setAiLoading(prev => ({ ...prev, question: false }));
    }
  };

  // New function for word list selection
  const handleWordListChange = (type) => {
    setDrill(prev => ({
      ...prev,
      wordlistType: type,
      wordlistName: '',
      word: '',
      definition: '',
      customWordList: type === 'custom' ? [] : prev.customWordList,
    }));
  };

  // New function for built-in word list selection
  const handleBuiltinListChange = async (listId) => {
    setDrill(prev => ({
      ...prev,
      wordlistName: listId,
      word: '',
      definition: '',
    }));

    if (listId) {
      try {
        const response = await api.get(`/api/builtin-wordlist/${listId}/`);
        const words = response.data.words || [];
        setBuiltinWords(words);
          setDrill(prev => ({
            ...prev,
            builtinWords: words,
          }));
        
        if (words.length === 0) {
          setNotification({
            show: true,
            message: 'Selected word list has no words.',
            type: 'warning'
          });
        }
      } catch (err) {
        console.error('Error fetching words:', err);
        setNotification({
          show: true,
          message: 'Failed to load words',
          type: 'error'
        });
        setBuiltinWords([]);
        setDrill(prev => ({
          ...prev,
          builtinWords: [],
        }));
      }
    }
  };

  

  // New function to add custom word
  const handleAddCustomWord = () => {
    const newWord = {
      word: '',
      definition: '',
    };
    setDrill(prev => ({
      ...prev,
      customWordList: [...prev.customWordList, newWord],
    }));
  };

  // New function to update custom word
  const handleUpdateCustomWord = (index, field, value) => {
    setDrill(prev => ({
      ...prev,
      customWordList: prev.customWordList.map((w, i) =>
        i === index ? { ...w, [field]: value } : w
      ),
    }));
  };

  // New function to remove custom word
  const handleRemoveCustomWord = (index) => {
    setDrill(prev => ({
      ...prev,
      customWordList: prev.customWordList.filter((_, i) => i !== index),
      word: prev.word === prev.customWordList[index].word ? '' : prev.word,
      definition: prev.word === prev.customWordList[index].word ? '' : prev.definition,
    }));
  };

  // Step 1: Overview
  const handleOverviewChange = e => {
    setDrill({ ...drill, [e.target.name]: e.target.value });
  };

  // Step 2: Questions
  const startAddQuestion = () => {
    setQuestionDraft(emptyQuestion);
    setQuestionEditIdx(null);
  };
  const handleChoiceChange = (i, field, value) => {
    const newChoices = questionDraft.choices.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    setQuestionDraft({ ...questionDraft, choices: newChoices });
  };
  const handleChoiceMedia = (i, file) => {
    const newChoices = questionDraft.choices.map((c, idx) => idx === i ? { ...c, media: file } : c);
    setQuestionDraft({ ...questionDraft, choices: newChoices });
  };

  // Step 3: Review
  const handleSubmit = async (status = 'draft') => {
    setSubmittingAction(status);
    // Validate: each choice must have text or media
    for (const q of drill.questions) {
      if (q.type === 'M') {
        for (const c of q.choices) {
          if (!c.text && !c.media) {
            alert('Each choice in Multiple Choice must have text or media.');
            setSubmittingAction(null);
            return;
          }
        }
      }
      if (q.type === 'G') {
        if (!q.memoryCards || q.memoryCards.length < 2) {
          alert('Memory game must have at least 2 cards.');
          setSubmittingAction(null);
          return;
        }
        if (q.memoryCards.length % 2 !== 0) {
          alert('Memory game must have an even number of cards for matching pairs.');
          setSubmittingAction(null);
          return;
        }
        for (const card of q.memoryCards) {
          if (!card.content && !card.media) {
            alert('Each memory game card must have either text or media content.');
            setSubmittingAction(null);
            return;
          }
        }
      }
      if (q.type === 'P') {
        if (!q.text) {
          alert('Picture Word questions must have a drill instructions.');
          setSubmittingAction(null);
          return;
        }
        if (!q.answer) {
          alert('Picture Word questions must have a correct answer.');
          setSubmittingAction(null);
          return;
        }
        if (!q.pictureWord || q.pictureWord.length !== 4) {
          alert('Picture Word questions must have exactly 4 pictures.');
          setSubmittingAction(null);
          return;
        }
        for (const pic of q.pictureWord) {
          if (!pic.media) {
            alert('Each picture in Picture Word questions must have an image.');
            setSubmittingAction(null);
            return;
          }
        }
      }
    }
    try {
      // First, save custom wordlist if it exists
      let customWordlistId = null;
      if (drill.wordlistType === 'custom' && drill.customWordList.length > 0) {
        const customWordlistData = {
          name: drill.wordlistName,
          description: customListDesc,
          words: []
        };
        for (const word of drill.customWordList) {
          const wordData = { 
            word: word.word, 
            definition: word.definition 
          };
          if (word.image instanceof File) {
            const imageFormData = new FormData();
            imageFormData.append('image', word.image);
            try {
              const imageResponse = await api.post('/api/upload-image/', imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              wordData.image_url = imageResponse.data.url;
            } catch (imageError) {
              console.error('Image upload error:', imageError);
            }
          } else if (word.image && typeof word.image === 'string') {
            wordData.image_url = word.image;
          }
          if (word.signVideo instanceof File) {
            const videoFormData = new FormData();
            videoFormData.append('video', word.signVideo);
            try {
              const videoResponse = await api.post('/api/upload-video/', videoFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              wordData.video_url = videoResponse.data.url;
            } catch (videoError) {
              console.error('Video upload error:', videoError);
            }
          } else if (word.signVideo && typeof word.signVideo === 'string') {
            wordData.video_url = word.signVideo;
          }
          if (wordData.word && wordData.definition) {
            customWordlistData.words.push(wordData);
          }
        }
        const wordlistResponse = await api.post('/api/wordlist/', customWordlistData);
        customWordlistId = wordlistResponse.data.id;
      }
      const formData = new FormData();
      const questions = drill.questions.map((q, qIdx) => {
        const base = {
          text: q.text,
          type: q.type,
          story_title: q.story_title,
          story_context: q.story_context,
          sign_language_instructions: q.sign_language_instructions,
        };
        if (q.type === 'M' || q.type === 'F') {
          base.answer = q.answer;
          base.choices = (q.choices || []).map((c, cIdx) => {
            let choice = { ...c, is_correct: q.answer === cIdx };
            if (c.media instanceof File) {
              const key = `media_${qIdx}_${cIdx}`;
              formData.append(key, c.media);
              choice.media = key;
            } else if (c.media && c.media.url) {
              choice.media = c.media.url;
            }
            Object.keys(choice).forEach(k => (choice[k] == null) && delete choice[k]);
            return choice;
          });
        }
        if (q.type === 'F') {
          base.pattern = q.pattern;
          base.hint = q.hint;
          base.letterChoices = q.letterChoices;
        }
        if (q.type === 'D') {
          base.sentence = q.sentence || '';
          base.dragItems = Array.isArray(q.dragItems) ? q.dragItems : [];
          base.incorrectChoices = Array.isArray(q.incorrectChoices) ? q.incorrectChoices : [];
          base.dropZones = Array.isArray(q.dropZones) ? q.dropZones : [];
        }
        if (q.type === 'G') {
          base.memoryCards = Array.isArray(q.memoryCards) ? q.memoryCards.map(card => {
            let mediaValue = null;
            if (card.media instanceof File) {
              const key = `media_${qIdx}_card_${card.id}`;
              formData.append(key, card.media);
              mediaValue = key;
            } else if (card.media && card.media.url) {
              mediaValue = card.media.url;
            } else if (card.media) {
              mediaValue = card.media;
            }
            return {
              id: card.id,
              content: card.content,
              pairId: card.pairId,
              media: mediaValue,
            };
          }) : [];
        }
        if (q.type === 'P') {
          base.pictureWord = Array.isArray(q.pictureWord) ? q.pictureWord.map((pic, pIdx) => {
            let updatedPic = { ...pic };
            if (pic.media instanceof File) {
              const key = `media_${qIdx}_${pIdx}`;
              formData.append(key, pic.media);
              updatedPic.media = key;
            } else if (pic.media && pic.media.url) {
              updatedPic.media = pic.media.url;
            }
            return {
              id: updatedPic.id,
              media: updatedPic.media,
              type: 'image'
            };
          }) : [];
          base.answer = q.answer;
        }
        Object.keys(base).forEach(k => (base[k] == null) && delete base[k]);
        return base;
      });
      formData.append('title', drill.title);
      formData.append('description', drill.description);
      formData.append('deadline', drill.dueDate);
      formData.append('classroom', classroom.id);
      formData.append('questions_input', JSON.stringify(questions));
      formData.append('status', status);
      if (customWordlistId) {
        formData.append('custom_wordlist', customWordlistId);
      }
      await api.post('/api/drills/', formData);
      setDrill(prev => ({ ...prev, status }));
      setSuccessMsg('Drill created successfully!');
      if (onDrillCreated) onDrillCreated();
      setTimeout(() => {
        setSuccessMsg('');
        setSearchParams({});
        setSubmittingAction(null);
      }, 2000);
    } catch (err) {
      setSubmittingAction(null);
      if (err.response && err.response.data) {
        alert('Failed to create drill: ' + JSON.stringify(err.response.data));
      } else {
        alert('Failed to create drill: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Add this function after handleOverviewChange
  const validateOverviewFields = () => {
    if (!drill.title || !drill.openDate || !drill.dueDate) return false;
    const open = new Date(drill.openDate);
    const due = new Date(drill.dueDate);
    // At least 10 minutes difference
    return due.getTime() - open.getTime() >= 10 * 60 * 1000;
  };

  // Add this function after validateOverviewFields
  const getMinOpenDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMinDueDate = () => {
    if (!drill.openDate) return getMinOpenDate();
    const open = new Date(drill.openDate);
    open.setMinutes(open.getMinutes() + 10);
    return open.toISOString().slice(0, 16);
  };

  const validateCustomWordList = () => {
    if (!drill.wordlistName || !customListDesc) return false;
    if (drill.customWordList.length < 3) return false;
    for (const w of drill.customWordList) {
      if (!w.word || !w.definition || !w.image || !w.signVideo) return false;
    }
    return true;
  };

  // Fetch words for selected builtin wordlist
  useEffect(() => {
    if (drill.wordlistType === 'builtin' && drill.wordlistName) {
      api.get(`/api/builtin-wordlist/${drill.wordlistName}/`)
        .then(res => setBuiltinWords(res.data.words || []))
        .catch(error => {
          console.error('Failed to load words:', error);
          setNotification({ show: true, message: 'Failed to load words', type: 'error' });
        });
    } else {
      setBuiltinWords([]);
    }
  }, [drill.wordlistType, drill.wordlistName]);

  // Wrap getAvailableWords in useCallback
  const getAvailableWords = useCallback(() => {
    if (drill.wordlistType === 'builtin') return builtinWords;
    if (drill.wordlistType === 'custom') return drill.customWordList;
    return [];
  }, [drill.wordlistType, drill.customWordList, builtinWords]);

  // When a word is selected for a question, auto-fill definition/image/video
  useEffect(() => {
    const words = getAvailableWords();
    const w = words.find(w => w.word === selectedQuestionWord);
    setSelectedQuestionWordData(w || {});
    // Only reset if NOT editing (i.e., questionEditIdx === null)
    if (w && questionEditIdx === null) {
      setQuestionDraft(q => ({
        ...q,
        text: '',
        choices: emptyQuestion.choices.map(() => ({ text: '', media: null })),
        answer: '',
        // Optionally, you can prefill question text or content here
      }));
    }
  }, [selectedQuestionWord, questionEditIdx, getAvailableWords]);

  return (
    <div className="min-h-screen bg-[#EEF1F5]">
      {/* Media Modal */}
      {mediaModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(246, 241, 241, 0.25)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMediaModal({ open: false, src: '', type: '' })}
        >
          <button
            className="fixed top-6 right-8 z-50 flex items-center justify-center w-12 h-12 bg-white text-3xl text-red-500 rounded-full shadow-lg border-2 border-white hover:bg-red-100 hover:text-red-700 transition"
            style={{ cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setMediaModal({ open: false, src: '', type: '' }); }}
            aria-label="Close preview"
          >
            &times;
          </button>
          {mediaModal.type.startsWith('image/') ? (
            <img
              src={mediaModal.src}
              alt="media"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          ) : mediaModal.type.startsWith('video/') ? (
            <video
              src={mediaModal.src}
              controls
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl bg-black/70"
              onClick={e => e.stopPropagation()}
            />
          ) : null}
        </div>
      )}
      {/* Header */}
      <ClassroomHeader
        classroom={classroom}
        students={students}
        onEdit={() => {}}
        onDelete={() => {}}
        onBack={() => navigate(-1)}
      />
      {/* Drill Creation Form */}
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-[95%] mx-auto">
        <Stepper step={step} setStep={setStep} />
        
        {/* Word List Step */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Drill Overview</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Drill Title <span className="text-red-500">*</span>
              </label>
              <input name="title" value={drill.title} onChange={handleOverviewChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Description
              </label>
              <textarea name="description" value={drill.description} onChange={handleOverviewChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium">
                  Open Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="openDate"
                  value={drill.openDate}
                  onChange={handleOverviewChange}
                  min={getMinOpenDate()}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={drill.dueDate}
                  onChange={handleOverviewChange}
                  min={getMinDueDate()}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                />
                {drill.openDate && (
                  <div className="text-xs mt-1 text-gray-500">
                    {drill.dueDate && new Date(drill.dueDate) - new Date(drill.openDate) < 10 * 60 * 1000 && (
                      <span className="text-red-500 ml-2">Due date must be at least 10 minutes after open date.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition" onClick={() => navigate(-1)}>Cancel</button>
              <button
                className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
                onClick={() => setStep(1)}
                disabled={!validateOverviewFields()}
                style={{ opacity: validateOverviewFields() ? 1 : 0.5, cursor: validateOverviewFields() ? 'pointer' : 'not-allowed' }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Select Word List</h2>
            {/* Word List Type Selection */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">Word List Type</label>
              <div className="flex gap-4">
                <button
                  className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                    drill.wordlistType === 'builtin'
                      ? 'border-[#4C53B4] bg-[#EEF1F5] text-[#4C53B4]'
                      : 'border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5]'
                  }`}
                  onClick={() => handleWordListChange('builtin')}
                >
                  <i className="fa-solid fa-book mr-2"></i>
                  Built-in Word List
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                    drill.wordlistType === 'custom'
                      ? 'border-[#4C53B4] bg-[#EEF1F5] text-[#4C53B4]'
                      : 'border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5]'
                  }`}
                  onClick={() => handleWordListChange('custom')}
                >
                  <i className="fa-solid fa-pencil mr-2"></i>
                  Custom Word List
                </button>
              </div>
            </div>
            {drill.wordlistType === 'builtin' && (
              <div className="mb-6">
                <label className="block mb-2 font-medium">Select Word List <span className="text-red-500">*</span></label>
                <div className="relative">
                <select
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                  value={drill.wordlistName}
                  onChange={(e) => handleBuiltinListChange(e.target.value)}
                >
                  <option value="">Select a list</option>
                  {builtinWordLists.length === 0 && <option disabled>No wordlists found</option>}
                  {builtinWordLists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                  {loadingWordLists && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <i className="fa-solid fa-spinner fa-spin text-[#4C53B4]"></i>
                    </div>
                  )}
                </div>
              </div>
            )}
            {drill.wordlistType === 'custom' && (
              <>
                {/* Custom Word List Name */}
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Custom Word List Name <span className="text-red-500">*</span></label>
                  <input
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                    value={drill.wordlistName}
                    onChange={e => setDrill(prev => ({ ...prev, wordlistName: e.target.value }))}
                    placeholder="e.g. Fruits"
                  />
                </div>
                {/* Custom Word List Description */}
            <div className="mb-6">
                  <label className="block mb-2 font-medium">Description <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <textarea
                      className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                      value={customListDesc}
                      onChange={e => setCustomListDesc(e.target.value)}
                      placeholder="Describe this word list"
                    />
                    {/* <AiGenerateButton
                      onClick={generateListDescription}
                      loading={aiLoadingListDesc}
                    /> */}
                  </div>
                </div>
                {/* Add Words */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium">Add Vocabulary Words</label>
                  </div>
                  {drill.customWordList.map((word, index) => (
                    <CreateCustomWordList 
                      key={index} 
                      index={index} 
                      word={word} 
                      handleUpdateCustomWord={handleUpdateCustomWord}
                      handleRemoveCustomWord={handleRemoveCustomWord}
                      setMediaModal={setMediaModal}
                      onGenerateDefinition={() => generateDefinitionForWord(index, word.word)}
                      isGeneratingDefinition={aiLoading.definition}
                    />
                  ))}
                    <button
                    className="px-3 py-1 rounded-lg bg-[#4C53B4] text-white hover:bg-[#3a4095]"
                    onClick={handleAddCustomWord}
                  >
                    <i className="fa-solid fa-plus mr-1"></i> Add Word
                  </button>
                </div>
              </>
            )}
            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              {drill.wordlistType === 'custom' && (
                <div className="text-sm" style={{ color: validateCustomWordList() ? '#22c55e' : '#ef4444', minWidth: 260 }}>
                  {validateCustomWordList()
                    ? 'Ready!'
                    : 'Add at least 3 words and fill all required fields to proceed.'}
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
                  onClick={async () => {
                    if (drill.wordlistType === 'custom' && !validateCustomWordList()) {
                      setNotification({
                        show: true,
                        message: 'Add at least 3 words and fill all required fields to proceed.',
                        type: 'error',
                      });
                      return;
                    }
                    
                    if (drill.wordlistType === 'builtin') {
                      if (!drill.wordlistName) {
                        setNotification({
                          show: true,
                          message: 'Please select a word list.',
                        type: 'error',
                      });
                      return;
                    }

                      // Check if words are already loaded for this wordlist
                      if (builtinWords.length > 0 && drill.builtinWords?.length > 0) {
                    setStep(2);
                        return;
                      }
                      
                      try {
                        // Set loading state
                        setSubmittingAction('loading');
                        
                        // Fetch words one final time to ensure we have them
                        const response = await api.get(`/api/builtin-wordlist/${drill.wordlistName}/`);
                        const words = response.data.words || [];
                        
                        if (words.length === 0) {
                          setNotification({
                            show: true,
                            message: 'Selected word list has no words.',
                            type: 'error',
                          });
                          setSubmittingAction(null);
                          return;
                        }
                        
                        // Update builtinWords state
                        setBuiltinWords(words);
                        // Update drill state with the words
                        setDrill(prev => ({
                          ...prev,
                          builtinWords: words
                        }));
                        
                        // Clear loading state and proceed
                        setSubmittingAction(null);
                        
                        // Proceed to next step
                        setStep(2);
                      } catch (error) {
                        console.error('Error fetching words:', error);
                        setNotification({
                          show: true,
                          message: 'Failed to load words. Please try again.',
                          type: 'error',
                        });
                        setSubmittingAction(null);
                        return;
                      }
                    } else {
                      setStep(2);
                    }
                  }}
                  disabled={
                    drill.wordlistType === 'custom' 
                      ? !validateCustomWordList() 
                      : !drill.wordlistName || submittingAction === 'loading'
                  }
                >
                  {submittingAction === 'loading' ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Loading words...
                    </>
                  ) : 'Continue'}
                </button>
                  </div>
                  </div>
                        </div>
                      )}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Add Questions</h2>
            {notification.show && (
              <div className={`mb-4 p-3 rounded-xl text-center font-semibold animate-fadeIn ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 
                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                notification.type === 'error' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {notification.message}
                        </div>
                      )}
            <div className="mb-6">
              {drill.questions.length === 0 && <div className="text-gray-400 mb-2">No questions yet.</div>}
              {drill.questions.map((q, idx) => (
                <div key={idx} className="mb-4 p-4 rounded-xl border-2 border-gray-100 bg-[#F7F9FC] relative">
                  <div className="font-medium mb-2">Word: {q.word}</div>
                  <div className="text-gray-600 mb-2">Definition: {q.definition}</div>
                  {/* Preview for question types */}
                  <div className="mb-2">
                    <span className="font-semibold">Type:</span> {q.type === 'M' ? 'Smart Select' : q.type === 'F' ? 'Blank Busters' : q.type === 'D' ? 'Sentence Builder' : q.type === 'G' ? 'Memory Game' : q.type === 'P' ? 'Four Pics One Word' : ''}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Question:</span> {q.type === 'F' ? (
                      <span>{(q.text || '').split('_')[0]}<span className="inline-block w-16 border-b-2 border-gray-400 mx-2 align-middle" />{(q.text || '').split('_')[1]}</span>
                    ) : q.text}
                    </div>
                  {q.type === 'M' && (
                    <div className="mt-2">
                      <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#4C53B4]/10">
                        <div className="flex flex-wrap gap-2">
                      {(q.choices || []).map((c, i) => (
                            <div key={i} className={`relative w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}>
                              {q.answer === i && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#4C53B4] border-2 border-white flex items-center justify-center">
                                  <i className="fa-solid fa-check text-white text-sm"></i>
                                </div>
                              )}
                          {c.media ? (
                            (() => {
                              let src = null;
                              let type = '';
                              if (c.media instanceof File) {
                                src = URL.createObjectURL(c.media);
                                type = c.media.type;
                              } else if (c.media && c.media.url) {
                                src = c.media.url;
                                type = c.media.type || '';
                              }
                              if (type.startsWith('image/')) {
                                return <img src={src} alt="preview" className="rounded w-full h-full object-contain border cursor-pointer" onClick={() => setMediaModal({ open: true, src, type })} />;
                              } else if (type.startsWith('video/')) {
                                return <video src={src} className="rounded w-full h-full object-contain border cursor-pointer" controls onClick={e => { e.stopPropagation(); setMediaModal({ open: true, src, type }); }} />;
                              }
                              return null;
                            })()
                          ) : c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <i className="fa-regular fa-image text-lg text-gray-200"></i>
                          )}
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>
                  )}
                  {q.type === 'F' && (
                    <div className="space-y-2">
                      <div className="font-mono text-xl tracking-wider text-[#4C53B4] bg-[#EEF1F5] p-4 rounded-xl text-center">
                        {q.pattern}
                      </div>
                      {q.hint && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Hint:</span> {q.hint}
                        </div>
                      )}
                      <div className="text-sm text-[#4C53B4] bg-[#EEF1F5]/50 p-2 rounded">
                        <span className="font-medium">Answer:</span> {q.answer}
                        </div>
                    </div>
                  )}
                  {q.type === 'D' && (
                    <div className="mt-2">
                      <div className="mb-4 p-4 bg-[#F7F9FC] rounded-lg border border-[#4C53B4]/10">
                        {/* Sentence with Blanks */}
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          {(q.sentence || '').split('_').map((part, index, array) => (
                            <span key={index}>
                              {part}
                              {index < array.length - 1 && (
                                <span className="inline-block min-w-[100px] h-8 mx-2 bg-[#EEF1F5] border-2 border-dashed border-[#4C53B4]/30 rounded-lg align-middle"></span>
                              )}
                            </span>
                          ))}
                          </div>
                        {/* Available Words */}
                        <div className="mt-4">
                          <div className="text-sm text-gray-600 mb-2">Choices:</div>
                          <div className="flex flex-wrap gap-2">
                            {[...(q.dragItems || []), ...(q.incorrectChoices || [])].map((item, i) => (
                              <div
                                key={i}
                                className={`px-4 py-2 rounded-lg text-sm font-medium 
                                  ${item.isCorrect 
                                    ? 'bg-[#4C53B4]/10 text-[#4C53B4] border-2 border-[#4C53B4]/20' 
                                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                  }`}
                              >
                                {item.text}
                              </div>
                            ))}
                          </div>
                      </div>
                      </div>
                    </div>
                  )}
                  {q.type === 'G' && (
                    <div className="mt-2">
                      <div className="font-semibold mb-1">Memory Cards:</div>
                      <div className="flex flex-wrap gap-2">
                        {(q.memoryCards || []).map((card, i) => {
                          // Find the paired card's content or index
                          let pairContent = null;
                          if (card.pairId) {
                            const pairCard = (q.memoryCards || []).find(c => c.id === card.pairId);
                            pairContent = pairCard ? (pairCard.content || (pairCard.media && pairCard.media.name) || `Card ${q.memoryCards.indexOf(pairCard)+1}`) : card.pairId;
                          }
                          return (
                            <div key={i} className="w-32 h-24 border rounded flex flex-col items-center justify-center bg-white p-1">
                              {card.media ? (
                                <img src={typeof card.media === 'string' ? card.media : URL.createObjectURL(card.media)} alt="card" className="max-h-16 max-w-full mb-1" />
                              ) : null}
                              <span className="text-xs text-center">{card.content}</span>
                              <span className="text-xs text-gray-400">Pair: {pairContent || <span className="text-gray-300">None</span>}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {q.type === 'P' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {(q.pictureWord || []).map((pic, index) => (
                          <div key={pic.id} className="border rounded-lg p-4 bg-white">
                            <span className="text-sm text-gray-600 mb-2 block">Picture {index + 1}</span>
                            {pic.media ? (
                              (() => {
                                let src = null;
                                let type = '';
                                if (pic.media instanceof File) {
                                  src = URL.createObjectURL(pic.media);
                                  type = pic.media.type;
                                } else if (pic.media && pic.media.url) {
                                  src = pic.media.url;
                                  type = pic.media.type || '';
                                }
                                if (type.startsWith('image/')) {
                                  return (
                                    <img
                                      src={src}
                                      alt="preview"
                                      className="w-full h-48 object-cover rounded border cursor-pointer"
                                      onClick={() => setMediaModal({ open: true, src, type })}
                                    />
                                  );
                                }
                                return null;
                              })()
                            ) : (
                              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                <i className="fa-regular fa-image text-4xl text-gray-300"></i>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-[#EEF1F5] rounded-lg border border-[#4C53B4]">
                        <span className="text-sm text-gray-600">Correct Answer:</span>
                        <p className="font-medium text-[#4C53B4]">{q.answer || 'Not set'}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                              <button
                      className="text-[#4C53B4] hover:bg-[#EEF1F5] hover:scale-110 transition p-1 rounded"
                                onClick={() => {
                        setQuestionDraft(q);
                        setQuestionEditIdx(idx);
                        setSelectedQuestionWord(q.word); // <-- add this line
                        
                        // Show notification
                        setNotification({
                          show: true,
                          message: `Editing question ${idx+1}`,
                          type: 'info'
                        });
                        
                        // Scroll to the question form
                        setTimeout(() => {
                          questionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          // Auto-hide notification after a few seconds
                          setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                          document.getElementById('question-text-input')?.focus();
                        }, 100);
                      }}
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen"></i>
                              </button>
                        <button
                      className="text-red-500 hover:bg-red-100 hover:scale-110 transition p-1 rounded"
                          onClick={() => {
                            setDrill(prev => ({
                              ...prev,
                          questions: prev.questions.filter((_, i) => i !== idx)
                        }));
                        
                        if (questionEditIdx === idx) {
                          setQuestionDraft(emptyQuestion);
                          setQuestionEditIdx(null);
                        }
                        
                        // Show notification
                        setNotification({
                          show: true,
                          message: `Question ${idx+1} deleted`,
                          type: 'warning'
                        });
                        
                        // Auto-hide notification after a few seconds
                        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                      }}
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                </div>
              ))}
            </div>
            {/* Add/Edit Question Form */}
            <div className="mb-6 p-6 rounded-xl border-2 border-gray-100 bg-[#F7F9FC]" ref={questionFormRef}>
              <div className="mb-4">
                <div className="font-bold text-lg mb-2">
                  {questionEditIdx !== null ? 'Edit' : 'Add'} Question
                </div>
                {/* Select Word */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Select Word <span className="text-red-500">*</span></label>
                  <select
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                    value={selectedQuestionWord}
                    onChange={e => setSelectedQuestionWord(e.target.value)}
                  >
                    <option value="">Select a word</option>
                    {getAvailableWords().map((w, i) => (
                      <option key={i} value={w.word}>{w.word}</option>
                    ))}
                  </select>
                  {selectedQuestionWordData && selectedQuestionWordData.definition && (
                    <div className="mt-2 text-gray-600">Definition: {selectedQuestionWordData.definition}</div>
                  )}
                </div>
                {/* Disable rest of form if no word selected */}
                {selectedQuestionWord && (
                  <>
              {/* Question Type Selection */}
              <div className="mb-4">
                      <label className="block mb-1 font-medium"> Drill Type <span className="text-red-500">*</span></label>
                <select
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                  value={questionDraft.type}
                  onChange={e => {
                    const newType = e.target.value;
                    setQuestionDraft({
                      ...questionDraft,
                      type: newType,
                      text: '',
                      choices: newType === 'M' ? emptyQuestion.choices.map(() => ({ text: '', media: null })) : [],
                      answer: '',
                      pattern: newType === 'F' ? '' : undefined,
                      hint: newType === 'F' ? '' : undefined,
                      dragItems: newType === 'D' ? [] : undefined,
                      dropZones: newType === 'D' ? [] : undefined,
                      memoryCards: newType === 'G' ? [] : undefined,
                      pictureWord: newType === 'P' ? [] : undefined,
                    });
                  }}
                >
                  <option value="M">Smart Select</option>
                  <option value="F">Blank Busters</option>
                  <option value="D">Sentence Builder</option>
                  <option value="G">Memory Game</option>
                  <option value="P">Four Pics One Word</option>
                </select>

                {/* Preview Text and Popover */}
                <div className="mt-2 flex items-center gap-2 text-sm text-[#4C53B4]">
                  <div className="relative group">
                    <div className="flex items-center gap-1 cursor-help">
                      <i className="fa-solid fa-circle-info"></i>
                      <span>Hover to preview question</span>
                    </div>

                    {/* Popover Content */}
                    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 absolute left-0 top-full mt-2 w-[400px] bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-[#4C53B4]">
                            {questionDraft.type === 'M' ? 'Smart Select' :
                             questionDraft.type === 'F' ? 'Blank Busters' :
                             questionDraft.type === 'D' ? 'Sentence Builder' :
                             questionDraft.type === 'G' ? 'Memory Game' :
                             'Four Pics One Word'} Preview
                          </div>
                          <div className="text-xs text-gray-500">How students will see it</div>
                        </div>

                        {/* Smart Select Preview */}
                        {questionDraft.type === 'M' && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Choose the correct answer:</div>
                            <div className="text-sm text-gray-700 mb-2">What is the definition of "backpack"?</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-3 rounded-lg border-2 border-[#4C53B4] bg-[#FFF] text-[#4C53B4] cursor-pointer text-sm">
                                A bag carried on your back for holding books and supplies
                              </div>
                              <div className="p-3 rounded-lg border-2 border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5] cursor-pointer text-sm">
                                A type of shoe worn for hiking
                              </div>
                              <div className="p-3 rounded-lg border-2 border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5] cursor-pointer text-sm">
                                A small pocket in front of pants
                              </div>
                              <div className="p-3 rounded-lg border-2 border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5] cursor-pointer text-sm">
                                A strap used to secure items
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Blank Busters Preview */}
                        {questionDraft.type === 'F' && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Fill in the missing letters:</div>
                            <div className="flex items-center justify-center gap-1">
                              {['B','_','_','K','P','_','C','K'].map((letter, i) => (
                                <div 
                                  key={`letter-${i}-${letter}`}
                                  className={`w-8 h-8 flex items-center justify-center rounded ${
                                    letter === '_' 
                                      ? 'bg-[#EEF1F5] text-[#4C53B4]' 
                                      : 'bg-[#4C53B4] text-white'
                                  } font-bold text-lg`}
                                >
                                  {letter}
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                              {['A', 'E', 'C', 'O', 'A'].map((letter, i) => (
                                <div 
                                  key={`choice-${i}-${letter}`}
                                  className="w-8 h-8 flex items-center justify-center rounded bg-white border-2 border-[#4C53B4] text-[#4C53B4] cursor-pointer hover:bg-[#EEF1F5] font-bold text-lg"
                                >
                                  {letter}
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg">
                              <i className="fa-solid fa-lightbulb text-yellow-500 mr-1"></i>
                              Hint: Something you carry on your back
                            </div>
                          </div>
                        )}

                        {/* Drag and Drop Preview */}
                        {questionDraft.type === 'D' && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Fill in the blanks:</div>
                            <div className="p-4 bg-[#F7F9FC] rounded-lg text-sm">
                              A <span className="inline-block w-24 border-b-2 border-[#4C53B4] mx-1"></span> is worn on your 
                              <span className="inline-block w-24 border-b-2 border-[#4C53B4] mx-1"></span>.
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="px-3 py-1 bg-white border-2 border-[#4C53B4] rounded text-sm text-[#4C53B4] cursor-move hover:bg-[#EEF1F5]">
                                backpack
                              </div>
                              <div className="px-3 py-1 bg-white border-2 border-[#4C53B4] rounded text-sm text-[#4C53B4] cursor-move hover:bg-[#EEF1F5]">
                                back
                              </div>
                              <div className="px-3 py-1 bg-white border-2 border-[#4C53B4] rounded text-sm text-[#4C53B4] cursor-move hover:bg-[#EEF1F5]">
                                shoulders
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Memory Game Preview */}
                        {questionDraft.type === 'G' && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Match the pairs:</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-square bg-[#4C53B4] rounded-lg flex items-center justify-center text-white p-2 cursor-pointer hover:bg-[#3a4095] transition-colors">
                                <img 
                                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop" 
                                  alt="Backpack"
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="aspect-square bg-[#4C53B4] rounded-lg flex items-center justify-center text-white p-2 cursor-pointer hover:bg-[#3a4095] transition-colors">
                                <div className="text-sm text-center">A bag carried on the back, used to carry books and supplies</div>
                              </div>
                            </div>
                            <div className="text-xs text-center text-gray-500">
                              Click cards to find matching pairs
                            </div>
                          </div>
                        )}

                        {/* Four Pics One Word Preview */}
                        {questionDraft.type === 'P' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src="https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=150&h=150&fit=crop" 
                                  alt="School backpack"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop" 
                                  alt="Backpack front view"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src="https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=150&h=150&fit=crop" 
                                  alt="Hiking backpack"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src="https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=150&h=150&fit=crop" 
                                  alt="Student wearing backpack"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="text-center font-bold text-xl text-[#4C53B4]">
                              BACKPACK
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-2">
                          <i className="fa-solid fa-circle-info mr-1"></i>
                          This is just a preview. You can customize all content when creating your question.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                    {/* Question Text with AI Generation */}
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">
                        {questionDraft.type === 'M' ? 'Question Text' : 'Drill Instruction'} <span className="text-red-500">*</span>
                      </label>
              {questionDraft.type === 'F' ? (
                  <div className="mb-4">
                    <div className="space-y-4">
                      {/* Question Text */}
                      <div>
                        <div className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                            placeholder="Enter drill instruction"
                            value={questionDraft.text}
                            onChange={e => setQuestionDraft({ ...questionDraft, text: e.target.value })}
                            id="question-text-input"
                          />
                          <AiGenerateButton
                            onClick={generateQuestion}
                            loading={aiLoading.question}
                    />
                        </div>
                      </div>
                      {/* Word Pattern */}
                      <div>
                        <label className="block mb-1 font-medium">Word Pattern <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 items-center">
                    <input
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4] font-mono text-lg tracking-wider"
                            placeholder="e.g., W _ _ D _ _ T"
                            value={questionDraft.pattern || ''}
                      onChange={e => {
                              const pattern = e.target.value.toUpperCase();
                              setQuestionDraft({ ...questionDraft, pattern });
                            }}
                          />
                          <button
                            type="button"
                            className="px-3 py-2 rounded-xl bg-[#EEF1F5] text-[#4C53B4] hover:bg-[#4C53B4] hover:text-white transition-colors"
                            onClick={() => {
                              if (selectedQuestionWord) {
                                const word = selectedQuestionWord.toUpperCase();
                                const pattern = word.split('').map((char, idx) => idx === 0 || (idx !== word.length - 1 && Math.random() > 0.7) ? char : '_').join(' ');
                                // --- letterChoices logic ---
                                const missingLetters = word.split('').filter((char, idx) => pattern.split(' ')[idx] === '_');
                                const allPossibleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                                let letterChoices = [
                                  ...missingLetters,
                                  ...allPossibleLetters.filter(l => !missingLetters.includes(l)).sort(() => Math.random() - 0.5).slice(0, Math.max(0, 5 - missingLetters.length))
                                ];
                                letterChoices = letterChoices.sort(() => Math.random() - 0.5);
                                setQuestionDraft(prev => ({ ...prev, pattern, answer: word, letterChoices }));
                              }
                            }}
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Pattern
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Use underscores (_) for blank letters and spaces between each character. First letter is typically shown.
                        </p>
                      </div>
                      {/* Correct Answer */}
                      <div>
                        <label className="block mb-1 font-medium">Correct Answer <span className="text-red-500">*</span></label>
                        <input
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                          placeholder="Enter the complete word"
                          value={questionDraft.answer || ''}
                          onChange={e => setQuestionDraft({ ...questionDraft, answer: e.target.value.toUpperCase() })}
                        />
                      </div>
                      {/* Hint Section */}
                      <div>
                        <label className="block mb-1 font-medium">Hint (Optional)</label>
                        <input
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                          placeholder="Provide a hint for students"
                          value={questionDraft.hint || ''}
                          onChange={e => setQuestionDraft({ ...questionDraft, hint: e.target.value })}
                    />
                      </div>
                    </div>
                  </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                            placeholder={questionDraft.type === 'M' ? "Enter question text" : "Enter drill instruction"}
                            value={questionDraft.text}
                            onChange={e => setQuestionDraft({ ...questionDraft, text: e.target.value })}
                            id="question-text-input"
                          />
                          <AiGenerateButton
                            onClick={generateQuestion}
                            loading={aiLoading.question}
                          />
                        </div>
                      )}
                    </div>
              {/* Type-specific form for Drag and Drop and Memory Game */}
              {questionDraft.type === 'D' && (
                <div className="space-y-4">
                        {/* Sentence with Blanks */}
                  <div className="space-y-2">
                          <label className="block font-medium">Sentence with Blanks <span className="text-red-500">*</span></label>
                          <div className="text-sm text-gray-500 mb-2">
                            Use underscores (_) to indicate blank spaces. Example: "A backpack is a _ you wear on your _, with straps over your shoulders"
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                              placeholder="Enter the sentence with blanks (_)..."
                              value={questionDraft.sentence || ''}
                              onChange={e => {
                                const sentence = e.target.value;
                                // Count blanks
                                const blankCount = (sentence.match(/_/g) || []).length;
                                let dragItems = questionDraft.dragItems || [];
                                if (blankCount > dragItems.length) {
                                  // Add empty answers
                                  dragItems = [...dragItems, ...Array(blankCount - dragItems.length).fill({ text: '', isCorrect: true })];
                                } else if (blankCount < dragItems.length) {
                                  // Remove extra answers
                                  dragItems = dragItems.slice(0, blankCount);
                                }
                                setQuestionDraft({ ...questionDraft, sentence, dragItems });
                              }}
                              rows={3}
                            />
                            <AiGenerateButton
                              onClick={async () => {
                                setAiLoading(prev => ({ ...prev, sentence: true }));
                                try {
                                  // Get the definition
                                  const definition = selectedQuestionWordData.definition || '';
                                  if (!definition) {
                                    setNotification({
                                      show: true,
                                      message: 'No definition available to generate sentence',
                                      type: 'error'
                                    });
                                    return;
                                  }
                                  // Create initial sentence with the word
                                  const word = selectedQuestionWord;
                                  const initialSentence = `A ${word} is ${definition}`;
                                  const allWords = initialSentence.split(/\s+/);
                                  // Decide if we want to blank out the main word (50% chance)
                                  const blankMainWord = Math.random() < 0.5;
                                  // Select 2-3 additional random words to blank out (excluding very short words)
                                  const eligibleWords = allWords.slice(2).filter(word => word.length > 3);
                                  const numAdditionalBlanks = Math.min(Math.floor(Math.random() * 2) + 1, eligibleWords.length);
                                  const wordsToBlank = new Set();
                                  if (blankMainWord) {
                                    wordsToBlank.add(word.toLowerCase());
                                  }
                                  while (wordsToBlank.size < (blankMainWord ? numAdditionalBlanks + 1 : numAdditionalBlanks) && eligibleWords.length > 0) {
                                    const randomWord = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
                                    const cleanWord = randomWord.toLowerCase().replace(/[.,!?]/g, '');
                                    if (cleanWord !== word.toLowerCase()) {
                                      wordsToBlank.add(cleanWord);
                                    }
                                  }
                                  const sentenceWithBlanks = allWords.map((word, index) => {
                                    if (index === 0 || index === 2) return word;
                                    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
                                    return wordsToBlank.has(cleanWord) ? '_' : word;
                                  }).join(' ');
                                  const dragItems = Array.from(wordsToBlank).map(word => ({ text: word, isCorrect: true }));
                                  const otherWords = allWords.map(w => w.toLowerCase().replace(/[.,!?]/g, '')).filter(w => w.length > 3 && !wordsToBlank.has(w) && w !== 'is');
                                  const additionalChoices = otherWords.filter((w, i, arr) => arr.indexOf(w) === i).slice(0, Math.max(0, 5 - dragItems.length));
                                  const incorrectChoices = additionalChoices.map(word => ({ text: word, isCorrect: false }));
                                  setQuestionDraft(prev => ({
                                    ...prev,
                                    sentence: sentenceWithBlanks,
                                    dragItems: dragItems,
                                    incorrectChoices: incorrectChoices
                                  }));
                                } catch (err) {
                                  console.error('Failed to generate sentence:', err);
                                  setNotification({
                                    show: true,
                                    message: 'Failed to generate sentence: ' + (err.message || 'Unknown error'),
                                    type: 'error'
                                  });
                                } finally {
                                  setAiLoading(prev => ({ ...prev, sentence: false }));
                                }
                              }}
                              loading={aiLoading.sentence}
                            />
                          </div>
                        </div>

                        {/* Drag Items (Answers) */}
                        <div className="space-y-2">
                          <label className="block font-medium">Correct Answers (in order)</label>
                          <div className="text-sm text-gray-500 mb-2">
                            Add answers in the correct order matching each blank in your sentence.
                          </div>
                    {(questionDraft.dragItems || []).map((item, index) => (
                      <div key={index} className="flex gap-2">
                              <div className="w-8 flex items-center justify-center font-medium text-gray-500">
                                #{index + 1}
                              </div>
                        <input
                          className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                                placeholder={`Answer for blank ${index + 1}`}
                          value={item.text}
                          onChange={e => {
                                  const newItems = [...(questionDraft.dragItems || [])];
                                  newItems[index] = { ...newItems[index], text: e.target.value, isCorrect: true };
                            setQuestionDraft({ ...questionDraft, dragItems: newItems });
                          }}
                        />
                        <button
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                          onClick={() => {
                            const newItems = questionDraft.dragItems.filter((_, i) => i !== index);
                            setQuestionDraft({ ...questionDraft, dragItems: newItems });
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                          {(() => {
                            const blankCount = (questionDraft.sentence || '').match(/_/g)?.length || 0;
                            const currentAnswers = (questionDraft.dragItems || []).length;
                            const hasEnoughAnswers = currentAnswers >= blankCount;

                            return (
                              <>
                                {hasEnoughAnswers && blankCount > 0 && (
                                  <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                                    <i className="fa-solid fa-circle-info mr-2"></i>
                                    You have added all needed answers ({currentAnswers}/{blankCount} blanks)
                                  </div>
                                )}
                    <button
                                  className={`w-full px-4 py-2 border-2 border-dashed rounded-xl transition-all ${
                                    hasEnoughAnswers
                                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'border-gray-300 text-gray-500 hover:border-[#4C53B4] hover:text-[#4C53B4]'
                                  }`}
                      onClick={() => {
                                    if (!hasEnoughAnswers) {
                        setQuestionDraft({
                          ...questionDraft,
                                        dragItems: [...(questionDraft.dragItems || []), { text: '', isCorrect: true }]
                        });
                                    }
                      }}
                                  disabled={hasEnoughAnswers}
                    >
                                  <i className="fa-solid fa-plus mr-2"></i> Add Correct Answer
                    </button>
                              </>
                            );
                          })()}
                  </div>

                        {/* Incorrect Choices */}
                  <div className="space-y-2">
                          <label className="block font-medium">Incorrect Choices</label>
                          <div className="text-sm text-gray-500 mb-2">
                            Add incorrect options to make the game more challenging.
                          </div>
                          {(questionDraft.incorrectChoices || []).map((item, index) => (
                            <div key={index} className="flex gap-2">
                          <input
                            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                                placeholder="Enter an incorrect choice"
                                value={item.text}
                            onChange={e => {
                                  const newItems = [...(questionDraft.incorrectChoices || [])];
                                  newItems[index] = { text: e.target.value, isCorrect: false };
                                  setQuestionDraft({ ...questionDraft, incorrectChoices: newItems });
                            }}
                          />
                          <button
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => {
                                  const newItems = questionDraft.incorrectChoices.filter((_, i) => i !== index);
                                  setQuestionDraft({ ...questionDraft, incorrectChoices: newItems });
                            }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                      </div>
                    ))}
                    <button
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#4C53B4] hover:text-[#4C53B4]"
                      onClick={() => {
                        setQuestionDraft({
                          ...questionDraft,
                                incorrectChoices: [...(questionDraft.incorrectChoices || []), { text: '', isCorrect: false }]
                        });
                      }}
                    >
                            <i className="fa-solid fa-plus mr-2"></i> Add Incorrect Choice
                    </button>
                  </div>

                        {(questionDraft.sentence || questionDraft.text) && (questionDraft.dragItems?.length > 0 || questionDraft.incorrectChoices?.length > 0) && (
                          <div className="text-sm text-gray-500 mt-2">
                            <i className="fa-solid fa-shuffle mr-1"></i>
                            All choices will be randomly shuffled when shown to students.
                          </div>
                        )}
                </div>
              )}
              {questionDraft.type === 'G' && (
                <MemoryGameQuestionForm
                  question={questionDraft}
                  onChange={(updatedQuestion) => {
                    setQuestionDraft(updatedQuestion);
                  }}
                  setNotification={setNotification}
                        setMediaModal={setMediaModal}
                />
              )}
              {/* Add Picture Word Question Form */}
              {questionDraft.type === 'P' && (
                <PictureWordQuestionForm
                  question={questionDraft}
                  onChange={(updatedQuestion) => {
                    setQuestionDraft(updatedQuestion);
                  }}
                />
              )}
              {/* Choices Section - Only show for Multiple Choice */}
              {questionDraft.type === 'M' && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Choices</label>
                  <div className="flex gap-2 mb-2">
                    {questionDraft.choices.map((c, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1">
                        <input
                          className="w-full border-2 border-gray-100 rounded-xl px-2 py-1 focus:border-[#4C53B4]"
                          placeholder={`Choice ${i+1}`}
                          value={c.text}
                          onChange={e => handleChoiceChange(i, 'text', e.target.value)}
                        />
                        <FileInput value={c.media} onChange={file => handleChoiceMedia(i, file)} onPreview={(src, type) => setMediaModal({ open: true, src, type })} />
                      </div>
                    ))}
                  </div>
                        {/* Correct Answer Dropdown */}
                        <div className="mt-4">
                  <label className="block mb-1 font-medium">Correct Answer</label>
                  <select
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                    value={questionDraft.answer}
                            onChange={e => setQuestionDraft(prev => ({ ...prev, answer: parseInt(e.target.value) }))}
                  >
                            <option value="">Select correct answer</option>
                            {questionDraft.choices.map((c, i) => (
                      <option key={i} value={i}>
                                Choice {i + 1}: {c.text || (c.media ? 
                                  (c.media instanceof File ? c.media.name : 
                                   c.media.url ? c.media.url.split('/').pop() : 
                                   '(Media)') : '(Empty)')}
                      </option>
                    ))}
                  </select>
                        </div>
                </div>
              )}
              {/* Add/Edit Question Buttons */}
              <div className="flex justify-end gap-2">
                {questionEditIdx !== null && (
                  <button className="px-4 py-1 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition" onClick={startAddQuestion}>
                    Cancel
                  </button>
                )}
                <button
                  className="px-4 py-1 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
                  onClick={() => {
                    const newQ = {
                      ...questionDraft,
                            word: selectedQuestionWord,
                            definition: selectedQuestionWordData.definition,
                            image: selectedQuestionWordData.image,
                            signVideo: selectedQuestionWordData.signVideo,
                      choices: questionDraft.choices.map(c => ({ ...c })),
                      letterChoices: questionDraft.type === 'F' ? [...(questionDraft.letterChoices || [])] : undefined,
                      dragItems: questionDraft.type === 'D' ? [...(questionDraft.dragItems || [])] : undefined,
                      incorrectChoices: questionDraft.type === 'D' ? [...(questionDraft.incorrectChoices || [])] : undefined,
                    };
                    if (questionEditIdx !== null) {
                      const updatedQuestions = [...drill.questions];
                      updatedQuestions[questionEditIdx] = newQ;
                      setDrill(prev => ({ ...prev, questions: updatedQuestions }));
                            setNotification({ show: true, message: `Question ${questionEditIdx+1} updated successfully`, type: 'success' });
                    } else {
                      setDrill(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
                            setNotification({ show: true, message: `New question added successfully`, type: 'success' });
                    }
                    setQuestionDraft({ ...emptyQuestion, choices: emptyQuestion.choices.map(() => ({ text: '', media: null })) });
                    setQuestionEditIdx(null);
                          setSelectedQuestionWord('');
                          setSelectedQuestionWordData({});
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={
                          !selectedQuestionWord ||
                    !questionDraft.text || 
                    (questionDraft.type === 'M' && questionDraft.choices.some(c => !c.text && !c.media)) ||
                          (questionDraft.type === 'F' && (!questionDraft.pattern || !questionDraft.answer)) ||
                          (questionDraft.type === 'D' && (
                            !questionDraft.text ||
                            !questionDraft.sentence ||
                            (questionDraft.dragItems || []).length === 0 || 
                            !(questionDraft.sentence || '').includes('_') // Check if sentence has blanks
                          )) ||
                    (questionDraft.type === 'G' && (
                      !questionDraft.memoryCards || 
                      questionDraft.memoryCards.length < 2 || 
                      questionDraft.memoryCards.length % 2 !== 0 ||
                            questionDraft.memoryCards.some(card => !card.content && !card.media)
                          )) || 
                    (questionDraft.type === 'P' && (
                      !questionDraft.pictureWord || 
                      questionDraft.pictureWord.length < 4 
                          ))
                        }
                      >
                        {questionEditIdx !== null ? 'Save' : 'Add Question'} 
                </button>
              </div>
                  </>
                )}
              </div>
            </div>
            {/* Continue to Review button */}
            <div className="flex justify-end">
              <button
                className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition font-bold"
                onClick={() => setStep(3)}
                disabled={drill.questions.length < 1}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Review & Submit</h2>
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-800 text-center font-semibold animate-fadeIn">
                {successMsg}
              </div>
            )}
            <div className="mb-6">
              <div className="mb-2 font-medium">Title: <span className="font-normal">{drill.title}</span></div>
              <div className="mb-2 font-medium">Description: <span className="font-normal">{drill.description}</span></div>
              <div className="mb-2 font-medium">Open: <span className="font-normal">{drill.openDate}</span></div>
              <div className="mb-2 font-medium">Due: <span className="font-normal">{drill.dueDate}</span></div>
              <div className="mb-2 font-medium">Questions: <span className="font-normal">{drill.questions.length}</span></div>
            </div>
            <div className="mb-6">
              {drill.questions.map((q, idx) => (
                <div key={idx} className="mb-4 p-4 rounded-xl border-2 border-gray-100 bg-[#F7F9FC] relative">
                  <div className="font-medium mb-2">Word: {q.word}</div>
                  <div className="text-gray-600 mb-2">Definition: {q.definition}</div>
                  {/* Preview for question types */}
                  <div className="mb-2">
                    <span className="font-semibold">Type:</span> {q.type === 'M' ? 'Smart Select' : q.type === 'F' ? 'Blank Busters' : q.type === 'D' ? 'Sentence Builder' : q.type === 'G' ? 'Memory Game' : q.type === 'P' ? 'Four Pics One Word' : ''}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Question:</span> {q.type === 'F' ? (
                      <span>{(q.text || '').split('_')[0]}<span className="inline-block w-16 border-b-2 border-gray-400 mx-2 align-middle" />{(q.text || '').split('_')[1]}</span>
                    ) : q.text}
                    </div>
                  {q.type === 'M' && (
                    <div className="mt-2">
                      <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#4C53B4]/10">
                        <div className="flex flex-wrap gap-2">
                      {(q.choices || []).map((c, i) => (
                            <div key={i} className={`relative w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}>
                              {q.answer === i && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#4C53B4] border-2 border-white flex items-center justify-center">
                                  <i className="fa-solid fa-check text-white text-sm"></i>
                                </div>
                              )}
                          {c.media ? (
                            (() => {
                              let src = null;
                              let type = '';
                              if (c.media instanceof File) {
                                src = URL.createObjectURL(c.media);
                                type = c.media.type;
                              } else if (c.media && c.media.url) {
                                src = c.media.url;
                                type = c.media.type || '';
                              }
                              if (type.startsWith('image/')) {
                                return <img src={src} alt="preview" className="rounded w-full h-full object-contain border cursor-pointer" onClick={() => setMediaModal({ open: true, src, type })} />;
                              } else if (type.startsWith('video/')) {
                                return <video src={src} className="rounded w-full h-full object-contain border cursor-pointer" controls onClick={e => { e.stopPropagation(); setMediaModal({ open: true, src, type }); }} />;
                              }
                              return null;
                            })()
                          ) : c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <i className="fa-regular fa-image text-lg text-gray-200"></i>
                          )}
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>
                  )}
                  {q.type === 'F' && (
                    <div className="space-y-2">
                      <div className="font-mono text-xl tracking-wider text-[#4C53B4] bg-[#EEF1F5] p-4 rounded-xl text-center">
                        {q.pattern}
                      </div>
                      {q.hint && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Hint:</span> {q.hint}
                        </div>
                      )}
                      <div className="text-sm text-[#4C53B4] bg-[#EEF1F5]/50 p-2 rounded">
                        <span className="font-medium">Answer:</span> {q.answer}
                        </div>
                    </div>
                  )}
                  {q.type === 'D' && (
                    <div className="mt-2">
                      <div className="mb-4 p-4 bg-[#F7F9FC] rounded-lg border border-[#4C53B4]/10">
                        {/* Sentence with Blanks */}
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          {(q.sentence || '').split('_').map((part, index, array) => (
                            <span key={index}>
                              {part}
                              {index < array.length - 1 && (
                                <span className="inline-block min-w-[100px] h-8 mx-2 bg-[#EEF1F5] border-2 border-dashed border-[#4C53B4]/30 rounded-lg align-middle"></span>
                              )}
                            </span>
                          ))}
                          </div>
                        {/* Available Words */}
                        <div className="mt-4">
                          <div className="text-sm text-gray-600 mb-2">Choices:</div>
                          <div className="flex flex-wrap gap-2">
                            {[...(q.dragItems || []), ...(q.incorrectChoices || [])].map((item, i) => (
                              <div
                                key={i}
                                className={`px-4 py-2 rounded-lg text-sm font-medium 
                                  ${item.isCorrect 
                                    ? 'bg-[#4C53B4]/10 text-[#4C53B4] border-2 border-[#4C53B4]/20' 
                                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                  }`}
                              >
                                {item.text}
                              </div>
                            ))}
                          </div>
                      </div>
                      </div>
                    </div>
                  )}
                  {q.type === 'G' && (
                    <div className="mt-2">
                      <div className="font-semibold mb-1">Memory Cards:</div>
                      <div className="flex flex-wrap gap-2">
                        {(q.memoryCards || []).map((card, i) => {
                          // Find the paired card's content or index
                          let pairContent = null;
                          if (card.pairId) {
                            const pairCard = (q.memoryCards || []).find(c => c.id === card.pairId);
                            pairContent = pairCard ? (pairCard.content || (pairCard.media && pairCard.media.name) || `Card ${q.memoryCards.indexOf(pairCard)+1}`) : card.pairId;
                          }
                          return (
                            <div key={i} className="w-32 h-24 border rounded flex flex-col items-center justify-center bg-white p-1">
                              {card.media ? (
                                <img src={typeof card.media === 'string' ? card.media : URL.createObjectURL(card.media)} alt="card" className="max-h-16 max-w-full mb-1" />
                              ) : null}
                              <span className="text-xs text-center">{card.content}</span>
                              <span className="text-xs text-gray-400">Pair: {pairContent || <span className="text-gray-300">None</span>}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                   {q.type === 'P' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {(q.pictureWord || []).map((pic, index) => (
                          <div key={pic.id} className="border rounded-lg p-4 bg-white">
                            <span className="text-sm text-gray-600 mb-2 block">Picture {index + 1}</span>
                            {pic.media ? (
                              (() => {
                                let src = null;
                                let type = '';
                                if (pic.media instanceof File) {
                                  src = URL.createObjectURL(pic.media);
                                  type = pic.media.type;
                                } else if (pic.media && pic.media.url) {
                                  src = pic.media.url;
                                  type = pic.media.type || '';
                                }
                                if (type.startsWith('image/')) {
                                  return (
                                    <img
                                      src={src}
                                      alt="preview"
                                      className="w-full h-48 object-cover rounded border cursor-pointer"
                                      onClick={() => setMediaModal({ open: true, src, type })}
                                    />
                                  );
                                }
                                return null;
                              })()
                            ) : (
                              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                <i className="fa-regular fa-image text-4xl text-gray-300"></i>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-[#EEF1F5] rounded-lg border border-[#4C53B4]">
                        <span className="text-sm text-gray-600">Correct Answer:</span>
                        <p className="font-medium text-[#4C53B4]">{q.answer || 'Not set'}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                              <button
                      className="text-[#4C53B4] hover:bg-[#EEF1F5] hover:scale-110 transition p-1 rounded"
                                onClick={() => {
                        setQuestionDraft(q);
                        setQuestionEditIdx(idx);
                        setSelectedQuestionWord(q.word); // <-- add this line
                        
                        // Show notification
                        setNotification({
                          show: true,
                          message: `Editing question ${idx+1}`,
                          type: 'info'
                        });
                        
                        // Scroll to the question form
                        setTimeout(() => {
                          questionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          // Auto-hide notification after a few seconds
                          setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                          document.getElementById('question-text-input')?.focus();
                        }, 100);
                      }}
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen"></i>
                              </button>
                        <button
                      className="text-red-500 hover:bg-red-100 hover:scale-110 transition p-1 rounded"
                          onClick={() => {
                            setDrill(prev => ({
                              ...prev,
                          questions: prev.questions.filter((_, i) => i !== idx)
                        }));
                        
                        if (questionEditIdx === idx) {
                          setQuestionDraft(emptyQuestion);
                          setQuestionEditIdx(null);
                        }
                        
                        // Show notification
                        setNotification({
                          show: true,
                          message: `Question ${idx+1} deleted`,
                          type: 'warning'
                        });
                        
                        // Auto-hide notification after a few seconds
                        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                      }}
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition" onClick={() => setStep(2)}>Back</button>
              <div className="flex gap-2">
                <button
                  className="px-6 py-2 rounded-xl bg-yellow-400 text-white hover:bg-yellow-500 hover:scale-105 transition font-bold"
                  onClick={() => {
                    setSubmittingAction('draft');
                    handleSubmit('draft');
                  }}
                  disabled={submittingAction === 'draft'}
                >
                  {submittingAction === 'draft' ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : 'Save as Draft'}
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition font-bold"
                  onClick={() => {
                    setSubmittingAction('published');
                    handleSubmit('published');
                  }}
                  disabled={submittingAction === 'published'}
                >
                  {submittingAction === 'published' ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Publishing...
                    </>
                  ) : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDrill;