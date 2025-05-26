import { useState, useEffect, useRef } from 'react';
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
  choices: [
    { text: '', media: null },
    { text: '', media: null },
    { text: '', media: null },
    { text: '', media: null },
  ],
  answer: 0,
  blankPosition: null, // For Fill in the Blank questions
  dragItems: [], // For Drag and Drop questions
  dropZones: [], // For Drag and Drop questions
  memoryCards: [], // For Memory Game questions
  pictureWord: [], // For Picture Word questions

  story_title: '',
  story_context: '',
  sign_language_instructions: '',
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

const PictureWordQuestionForm = ({ question, onChange, setNotification }) => {
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
              <span className="text-sm text-gray-600">Picture {index + 1}</span>
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
              onPreview={(src, type) => setMediaModal({ open: true, src, type })}
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

  // New function for AI question generation
  const generateQuestion = async () => {
    setAiLoading(prev => ({ ...prev, question: true }));
    try {
      // TODO: Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      const fakeQuestion = {
        ...emptyQuestion,
        text: `What is the main purpose of a ${drill.word}?`,
        choices: [
          { text: drill.definition, media: null },
          { text: 'Wrong answer 1', media: null },
          { text: 'Wrong answer 2', media: null },
          { text: 'Wrong answer 3', media: null },
        ],
        answer: 0,
      };
      setQuestionDraft(fakeQuestion);
      setNotification({
        show: true,
        message: 'Question generated successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to generate question:', err);
      setNotification({
        show: true,
        message: 'Failed to generate question: ' + (err.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setAiLoading(prev => ({ ...prev, question: false }));
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
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
  const handleBuiltinListChange = (listId) => {
    setDrill(prev => ({
      ...prev,
      wordlistName: listId,
      word: '',
      definition: '',
    }));

    // Fetch words for the selected built-in word list
    if (listId) {
      api.get(`/api/builtin-wordlist/${listId}/`)
        .then(res => {
          const words = res.data.words || [];
          setDrill(prev => ({
            ...prev,
            builtinWords: words,
          }));
          console.log('Updated builtinWords:', words); // Debugging line
        })
        .catch(err => {
          console.error('Error fetching words:', err); // Debugging line
          setNotification({ show: true, message: 'Failed to load words', type: 'error' });
        });
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
    // Start loading state
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
      if (q.type === 'F') {
        for (const c of q.choices) {
          if (!c.text) {
            alert('Each possible answer in Fill in the Blank must have text.');
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
          alert('Picture Word questions must have a question text.');
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
      const formData = new FormData();
      const questions = drill.questions.map((q, qIdx) => {
        // Sanitize question object for backend
        const base = {
          text: q.text,
          type: q.type,
          story_title: q.story_title,
          story_context: q.story_context,
          sign_language_instructions: q.sign_language_instructions,
        };
        if (q.type === 'M' || q.type === 'F') {
          base.answer = q.answer;  // Add the answer field
          base.choices = (q.choices || []).map((c, cIdx) => {
              let choice = { ...c, is_correct: q.answer === cIdx };
              if (c.media instanceof File) {
                const key = `media_${qIdx}_${cIdx}`;
                formData.append(key, c.media);
                choice.media = key;
              } else if (c.media && c.media.url) {
                choice.media = c.media.url;
              }
            // Remove undefined/null
            Object.keys(choice).forEach(k => (choice[k] == null) && delete choice[k]);
              return choice;
          });
        }
        if (q.type === 'D') {
          base.dragItems = Array.isArray(q.dragItems) ? q.dragItems : [];
          base.dropZones = Array.isArray(q.dropZones) ? q.dropZones : [];
        }
        if (q.type === 'G') {
          base.memoryCards = Array.isArray(q.memoryCards) ? q.memoryCards.map(card => {
            let mediaValue = null;
            // If it's a new file upload
              if (card.media instanceof File) {
              const key = `media_${qIdx}_card_${card.id}`;
                formData.append(key, card.media);
              mediaValue = key; // Send the key reference in the JSON
              } else if (card.media && card.media.url) {
              // If it's existing media with a URL
              mediaValue = card.media.url; // Send the URL in the JSON
            } else if (card.media) {
                 // Fallback for any other unexpected existing media format
                 console.warn('Unexpected memoryCard media format (non-File, non-URL object):', card.media);
                 // Try to keep it as is, or stringify, depending on backend expectation
                 // Assuming backend might handle other JSON structures for media
                 mediaValue = card.media;
            }

            return {
              id: card.id,
              content: card.content,
              pairId: card.pairId,
              media: mediaValue, // Assign the determined media value
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
              type: 'image'  // Add type field to match backend expectations
            };
          }) : [];
          base.answer = q.answer;  // Make sure answer is included
        }

        // Remove undefined/null from base
        Object.keys(base).forEach(k => (base[k] == null) && delete base[k]);
        return base;
      });
      console.log('Submitting questions:', questions);

      formData.append('title', drill.title);
      formData.append('description', drill.description);
      formData.append('deadline', drill.dueDate);
      formData.append('classroom', classroom.id);
      formData.append('questions_input', JSON.stringify(questions));
      formData.append('status', status);

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

  // AI generate for custom list description
  const generateListDescription = async () => {
    setAiLoadingListDesc(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCustomListDesc(`This is a vocabulary list about ${drill.wordlistName || 'your topic'}.`);
      setNotification({
        show: true,
        message: 'Description generated!',
        type: 'success'
      });
    } catch {
      setNotification({
        show: true,
        message: 'Failed to generate description.',
        type: 'error'
      });
    } finally {
      setAiLoadingListDesc(false);
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const validateCustomWordList = () => {
    if (!drill.wordlistName || !customListDesc) return false;
    if (drill.customWordList.length < 3) return false;
    for (const w of drill.customWordList) {
      if (!w.word || !w.definition) return false;
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

  // Add Questions step: select word first
  const getAvailableWords = () => {
    if (drill.wordlistType === 'builtin') return builtinWords;
    if (drill.wordlistType === 'custom') return drill.customWordList;
    return [];
  };

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
        answer: 0,
        // Optionally, you can prefill question text or content here
      }));
    }
  }, [selectedQuestionWord, questionEditIdx]);

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
                      key={index} index={index} word={word} 
                      handleUpdateCustomWord={handleUpdateCustomWord}
                      handleRemoveCustomWord={handleRemoveCustomWord}
                      setMediaModal={setMediaModal}
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
                      onClick={() => {
                    if (drill.wordlistType === 'custom' && !validateCustomWordList()) {
                      setNotification({
                        show: true,
                        message: 'Add at least 3 words and fill all required fields to proceed.',
                        type: 'error',
                      });
                      return;
                    }
                    if (drill.wordlistType === 'builtin' && (!drill.wordlistName || builtinWords.length === 0)) {
                        setNotification({
                          show: true,
                        message: 'Select a word list with at least 1 word.',
                        type: 'error',
                      });
                      return;
                    }
                    setStep(2);
                  }}
                  disabled={drill.wordlistType === 'custom' ? !validateCustomWordList() : (!drill.wordlistName || builtinWords.length === 0)}
                >Continue</button>
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
                  {q.image && <img src={typeof q.image === 'string' ? q.image : URL.createObjectURL(q.image)} alt="preview" className="max-h-32 rounded mb-2" />}
                  {q.signVideo && <video src={typeof q.signVideo === 'string' ? q.signVideo : URL.createObjectURL(q.signVideo)} controls className="max-h-32 rounded mb-2" />}
                  {/* Preview for question types */}
                        <div className="mb-2">
                    <span className="font-semibold">Type:</span> {q.type === 'M' ? 'Multiple Choice' : q.type === 'F' ? 'Fill in the Blank' : q.type === 'D' ? 'Drag and Drop' : q.type === 'G' ? 'Memory Game' : q.type === 'F' ? 'Picture Word' : ''}
                        </div>
                  <div className="mb-2">
                    <span className="font-semibold">Question:</span> {q.type === 'F' ? (
                      <span>{(q.text || '').split('_')[0]}<span className="inline-block w-16 border-b-2 border-gray-400 mx-2 align-middle" />{(q.text || '').split('_')[1]}</span>
                    ) : q.text}
                    </div>
                  {q.type === 'M' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div key={i} className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}>
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
                  )}
                  {q.type === 'F' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div key={i} className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}>
                          {c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">No content</span>
                          )}
                        </div>
                      ))}
                      <div className="w-full text-xs text-gray-500 mt-2">Correct: Choice {q.answer + 1}</div>
                    </div>
                  )}
                  {q.type === 'D' && (
                    <div className="mt-2">
                      <div className="mb-2 font-semibold">Drag and Drop Mapping:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium mb-1">Drag Items</div>
                          <ul className="space-y-1">
                            {(q.dragItems || []).map((item, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded">{item.text}</li>
                            ))}
                          </ul>
                          </div>
                        <div>
                          <div className="font-medium mb-1">Drop Zones</div>
                          <ul className="space-y-1">
                            {(q.dropZones || []).map((zone, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded flex items-center gap-2">
                                <span>{zone.text}</span>
                                {zone.correctItemIndex !== null && (q.dragItems || []).length > 0 && (q.dragItems || [])[zone.correctItemIndex] && (
                                  <span className="ml-2 text-xs text-gray-500">→ {(q.dragItems || [])[zone.correctItemIndex].text}</span>
                                )}
                              </li>
                            ))}
                          </ul>
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
                      <label className="block mb-1 font-medium">Question Type <span className="text-red-500">*</span></label>
                <select
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                  value={questionDraft.type}
                  onChange={e => {
                    const newType = e.target.value;
                    setQuestionDraft({
                      ...questionDraft,
                      type: newType,
                      text: '',
                      choices: emptyQuestion.choices.map(() => ({ text: '', media: null })),
                      answer: 0,
                      dragItems: newType === 'D' ? [] : [],
                      dropZones: newType === 'D' ? [] : [],
                      memoryCards: newType === 'G' ? [] : [],
                      pictureWord: newType === 'P' ? [] : [],
                    });
                  }}
                >
                  <option value="M">Smart Select</option>
                  <option value="F">Blank Busters</option>
                  <option value="D">Drag and Drop</option>
                  <option value="G">Memory Game</option>
                  <option value="P">Four Pics One Word</option>
                </select>
              </div>
                    {/* Question Text with AI Generation */}
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Question Text <span className="text-red-500">*</span></label>
              {questionDraft.type === 'F' ? (
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                      placeholder="Enter text before the blank"
                      value={questionDraft.text.split('_')[0] || ''}
                      onChange={e => {
                        const parts = questionDraft.text.split('_');
                        setQuestionDraft({
                          ...questionDraft,
                          text: e.target.value + '_' + (parts[1] || '')
                        });
                      }}
                    />
                    <span className="text-gray-500">_</span>
                    <input
                      className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                      placeholder="Enter text after the blank"
                      value={questionDraft.text.split('_')[1] || ''}
                      onChange={e => {
                        const parts = questionDraft.text.split('_');
                        setQuestionDraft({
                          ...questionDraft,
                          text: (parts[0] || '') + '_' + e.target.value
                        });
                      }}
                    />
                  </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                            placeholder="Question text"
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
                    {/* Choices for Fill in the Blank */}
                    {questionDraft.type === 'F' && (
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Possible Answers</label>
                    <div className="flex gap-2 mb-2">
                      {questionDraft.choices.map((c, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1">
                          <input
                            className="w-full border-2 border-gray-100 rounded-xl px-2 py-1 focus:border-[#4C53B4]"
                            placeholder={`Answer ${i+1}`}
                            value={c.text}
                            onChange={e => handleChoiceChange(i, 'text', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                </div>
              )}
              {/* Content Section */}
              <div className="mb-6 p-4 bg-[#F7F9FC] rounded-xl border border-gray-200">
                <h3 className="font-medium mb-3">Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Title</label>
                    <input
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                      placeholder="Enter a title for your story"
                      value={questionDraft.story_title || ''}
                      onChange={e => setQuestionDraft({ ...questionDraft, story_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Context</label>
                    <textarea
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                      placeholder="Set the scene for your story"
                      rows={3}
                      value={questionDraft.story_context || ''}
                      onChange={e => setQuestionDraft({ ...questionDraft, story_context: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sign Language Instructions</label>
                    <textarea
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                      placeholder="Add sign language instructions for the story"
                      rows={2}
                      value={questionDraft.sign_language_instructions || ''}
                      onChange={e => setQuestionDraft({ ...questionDraft, sign_language_instructions: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              {/* Type-specific form for Drag and Drop and Memory Game */}
              {questionDraft.type === 'D' && (
                <div className="space-y-4">
                  {/* Drag Items Section */}
                  <div className="space-y-2">
                    <label className="block font-medium">Drag Items (What students will drag)</label>
                    <div className="text-sm text-gray-500 mb-2">Example: Countries, dates, names, etc.</div>
                    {(questionDraft.dragItems || []).map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                          placeholder={`Drag Item ${index + 1}`}
                          value={item.text}
                          onChange={e => {
                            const newItems = [...questionDraft.dragItems];
                            newItems[index] = { ...newItems[index], text: e.target.value };
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
                    <button
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#4C53B4] hover:text-[#4C53B4]"
                      onClick={() => {
                        setQuestionDraft({
                          ...questionDraft,
                          dragItems: [...questionDraft.dragItems, { text: '', isCorrect: false }]
                        });
                      }}
                    >
                      <i className="fa-solid fa-plus mr-2"></i> Add Drag Item
                    </button>
                  </div>
                  {/* Drop Zones Section */}
                  <div className="space-y-2">
                    <label className="block font-medium">Drop Zones (Where students will drop items)</label>
                    <div className="text-sm text-gray-500 mb-2">Example: Capitals, definitions, answers, etc.</div>
                    {(questionDraft.dropZones || []).map((zone, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                            placeholder={`Drop Zone ${index + 1}`}
                            value={zone.text}
                            onChange={e => {
                              const newZones = [...questionDraft.dropZones];
                              newZones[index] = { ...newZones[index], text: e.target.value };
                              setQuestionDraft({ ...questionDraft, dropZones: newZones });
                            }}
                          />
                          <button
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => {
                              const newZones = questionDraft.dropZones.filter((_, i) => i !== index);
                              setQuestionDraft({ ...questionDraft, dropZones: newZones });
                            }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Correct Answer:</label>
                          <select
                            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                            value={zone.correctItemIndex ?? ''}
                            onChange={e => {
                              const newZones = [...questionDraft.dropZones];
                              newZones[index] = { 
                                ...newZones[index], 
                                correctItemIndex: e.target.value === '' ? null : parseInt(e.target.value)
                              };
                              setQuestionDraft({ ...questionDraft, dropZones: newZones });
                            }}
                          >
                            <option value="">Select correct answer</option>
                            {(questionDraft.dragItems || []).map((item, i) => (
                              <option key={i} value={i}>
                                {item.text || `Drag Item ${i + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    <button
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#4C53B4] hover:text-[#4C53B4]"
                      onClick={() => {
                        setQuestionDraft({
                          ...questionDraft,
                          dropZones: [...questionDraft.dropZones, { text: '', correctItemIndex: null }]
                        });
                      }}
                    >
                      <i className="fa-solid fa-plus mr-2"></i> Add Drop Zone
                    </button>
                  </div>
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
                  setNotification={setNotification}
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
                </div>
              )}
              {/* Correct Answer Selection - Only show for Multiple Choice and Fill in the Blank */}
              {(questionDraft.type === 'M' || questionDraft.type === 'F') && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Correct Answer</label>
                  <select
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                    value={questionDraft.answer}
                    onChange={e => setQuestionDraft({ ...questionDraft, answer: parseInt(e.target.value) })}
                  >
                    {questionDraft.choices.map((_, i) => (
                      <option key={i} value={i}>
                        {questionDraft.type === 'F' ? `Answer ${i+1}` : `Choice ${i+1}`}
                      </option>
                    ))}
                  </select>
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
                      choices: questionDraft.choices.map(c => ({ ...c }))
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
                    (questionDraft.type === 'F' && questionDraft.choices.some(c => !c.text)) ||
                    (questionDraft.type === 'D' && ((questionDraft.dragItems || []).length === 0 || (questionDraft.dropZones || []).length === 0)) ||
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
                  {q.image && <img src={typeof q.image === 'string' ? q.image : URL.createObjectURL(q.image)} alt="preview" className="max-h-32 rounded mb-2" />}
                  {q.signVideo && <video src={typeof q.signVideo === 'string' ? q.signVideo : URL.createObjectURL(q.signVideo)} controls className="max-h-32 rounded mb-2" />}
                  {/* Preview for question types */}
                        <div className="mb-2">
                    <span className="font-semibold">Type:</span> {q.type === 'M' ? 'Multiple Choice' : q.type === 'F' ? 'Fill in the Blank' : q.type === 'D' ? 'Drag and Drop' : q.type === 'G' ? 'Memory Game' : ''}
                        </div>
                        <div className="mb-2">
                    <span className="font-semibold">Question:</span> {q.type === 'F' ? (
                      <span>{(q.text || '').split('_')[0]}<span className="inline-block w-16 border-b-2 border-gray-400 mx-2 align-middle" />{(q.text || '').split('_')[1]}</span>
                    ) : q.text}
                        </div>
                  {q.type === 'M' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div key={i} className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}>
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
                  )}
                  {q.type === 'F' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div key={i} className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}>
                          {c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">No content</span>
                          )}
                        </div>
                      ))}
                      <div className="w-full text-xs text-gray-500 mt-2">Correct: Choice {q.answer + 1}</div>
                    </div>
                  )}
                  {q.type === 'D' && (
                    <div className="mt-2">
                      <div className="mb-2 font-semibold">Drag and Drop Mapping:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium mb-1">Drag Items</div>
                          <ul className="space-y-1">
                            {(q.dragItems || []).map((item, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded">{item.text}</li>
                            ))}
                          </ul>
                          </div>
                        <div>
                          <div className="font-medium mb-1">Drop Zones</div>
                          <ul className="space-y-1">
                            {(q.dropZones || []).map((zone, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded flex items-center gap-2">
                                <span>{zone.text}</span>
                                {zone.correctItemIndex !== null && (q.dragItems || []).length > 0 && (q.dragItems || [])[zone.correctItemIndex] && (
                                  <span className="ml-2 text-xs text-gray-500">→ {(q.dragItems || [])[zone.correctItemIndex].text}</span>
                                )}
                              </li>
                            ))}
                          </ul>
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
