import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import ClassroomHeader from './ClassroomHeader';
import {useDefinitionFetcher} from '../../components/gen-ai/GenerateDefinition';
import { useAIQuestionGenerator } from '../../components/drill/AIQuestionGenerator';
import { 
  Stepper, 
  MediaModal,
  WordListStep,
  OverviewStep,
  QuestionsStep,
  ReviewStep
} from '../../components/drill';
import { 
  initialDrill, 
  emptyQuestion, 
  validateOverviewFields
} from '../../utils/drill';

const CreateDrill = ({ onDrillCreated, classroom, students }) => {
  const [step, setStep] = useState(0);
  const [drill, setDrill] = useState(initialDrill);
  const [questionEditIdx, setQuestionEditIdx] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion);
  const [selectedQuestionWord, setSelectedQuestionWord] = useState('');
  const [selectedQuestionWordData, setSelectedQuestionWordData] = useState({});
  const [builtinWords, setBuiltinWords] = useState([]);
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [successMsg, setSuccessMsg] = useState('');
  const [mediaModal, setMediaModal] = useState({ open: false, src: '', type: '' });
  const [submittingAction, setSubmittingAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const definitionFetcher = useDefinitionFetcher();
  const { aiLoading, setAiLoading, generateDefinitionForWord: generateDefForWord, generateQuestion: generateQ } = useAIQuestionGenerator();
  
  // Wrapper functions to pass the required parameters
  const generateDefinitionForWord = (index, word) => {
    return generateDefForWord(index, word, definitionFetcher, handleUpdateCustomWord, setNotification);
  };
  
  const generateQuestion = () => {
    return generateQ(questionDraft, selectedQuestionWord, selectedQuestionWordData, getAvailableWords, setQuestionDraft, setNotification);
  };

  // Built-in word lists state
  const [builtinWordLists, setBuiltinWordLists] = useState([]);
  const [customListDesc, setCustomListDesc] = useState('');
  const [loadingWordLists, setLoadingWordLists] = useState(false);

  // Fetch built-in word lists when needed
  useEffect(() => {
    if (step === 1 && drill.wordlistType === 'builtin') {
      setLoadingWordLists(true);
      api.get('/api/builtin-wordlist/')
        .then(res => {
          setBuiltinWordLists(res.data);
        })
        .catch(() => {
          setNotification({ show: true, message: 'Failed to load word lists', type: 'error' });
        })
        .finally(() => {
          setLoadingWordLists(false);
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



  // Add custom word function
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

  // Update custom word function
  const handleUpdateCustomWord = (index, field, value) => {
    setDrill(prev => ({
      ...prev,
      customWordList: prev.customWordList.map((w, i) =>
        i === index ? { ...w, [field]: value } : w
      ),
    }));
  };

  // Remove custom word function
  const handleRemoveCustomWord = (index) => {
    setDrill(prev => ({
      ...prev,
      customWordList: prev.customWordList.filter((_, i) => i !== index),
      word: prev.word === prev.customWordList[index].word ? '' : prev.word,
      definition: prev.word === prev.customWordList[index].word ? '' : prev.definition,
    }));
  };

  // Overview change handler
  const handleOverviewChange = e => {
    const { name, value } = e.target;
    setDrill(prev => {
      const newDrill = { ...prev, [name]: value };
      
      // If open date changes and due date is set, validate it
      if (name === 'openDate' && prev.dueDate) {
        const openDate = new Date(value);
        const dueDate = new Date(prev.dueDate);
        const minDueDate = new Date(openDate.getTime() + 10 * 60 * 1000); // 10 minutes later
        
        // If current due date is less than 10 minutes after new open date, clear it
        if (dueDate < minDueDate) {
          newDrill.dueDate = '';
        }
      }
      
      return newDrill;
    });
  };

  const handleChoiceChange = (i, field, value) => {
    const newChoices = questionDraft.choices.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    setQuestionDraft({ ...questionDraft, choices: newChoices });
  };

  const handleChoiceMedia = (i, file) => {
    const newChoices = questionDraft.choices.map((c, idx) => idx === i ? { ...c, media: file } : c);
    setQuestionDraft({ ...questionDraft, choices: newChoices });
  };

  // Submit handler
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
          word: q.word,
          definition: q.definition,
          // Ensure word_id is included for proper association
          word_id: q.word_id || null,
        };
        
        // Handle questionMedia for Multiple Choice questions
        if (q.type === 'M' && q.questionMedia) {
          if (q.questionMedia instanceof File) {
            const key = `question_media_${qIdx}`;
            formData.append(key, q.questionMedia);
            base.question_media = key;
          } else if (q.questionMedia.url) {
            base.question_media = q.questionMedia.url;
          }
        }
        
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
              number: card.number,
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
      // Convert local datetime to proper ISO string for backend
      formData.append('open_date', drill.openDate ? new Date(drill.openDate).toISOString() : '');
      formData.append('deadline', drill.dueDate ? new Date(drill.dueDate).toISOString() : '');
      formData.append('classroom', classroom.id);
      formData.append('questions_input', JSON.stringify(questions));
      formData.append('status', status);
      
      // Handle wordlist information
      if (drill.wordlistType === 'custom' && customWordlistId) {
        formData.append('custom_wordlist', customWordlistId);
        formData.append('wordlist_name', '');
      } else if (drill.wordlistType === 'builtin') {
        formData.append('custom_wordlist', '');
        formData.append('wordlist_name', drill.wordlistName || '');
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

  // Get available words function
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

  // Validation function for word list step  
  const validateWordList = () => {
    if (!drill.wordlistType) return false;
    if (drill.wordlistType === 'builtin' && !drill.wordlistName) return false;
    if (drill.wordlistType === 'custom') {
      if (!drill.wordlistName || !customListDesc) return false;
      if (drill.customWordList.length < 1) return false;
      for (const w of drill.customWordList) {
        if (!w.word || !w.definition || !w.image || !w.signVideo) return false;
      }
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-[#EEF1F5]">
      <MediaModal mediaModal={mediaModal} setMediaModal={setMediaModal} />
      
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
        
        {/* Overview Step */}
        {step === 0 && (
          <OverviewStep
            drill={drill}
            handleOverviewChange={handleOverviewChange}
            onContinue={() => setStep(1)}
            validateOverviewFields={validateOverviewFields}
          />
        )}

        {/* Word List Step */}
        {step === 1 && (
          <WordListStep
            drill={drill}
            setDrill={setDrill}
            customListDesc={customListDesc}
            setCustomListDesc={setCustomListDesc}
            onBack={() => setStep(0)}
            onContinue={() => setStep(2)}
            aiLoading={aiLoading}
            setAiLoading={setAiLoading}
            setNotification={setNotification}
            setMediaModal={setMediaModal}
            generateDefinitionForWord={generateDefinitionForWord}
            handleAddCustomWord={handleAddCustomWord}
            handleUpdateCustomWord={handleUpdateCustomWord}
            handleRemoveCustomWord={handleRemoveCustomWord}
            validateWordList={validateWordList}
            builtinWords={builtinWords}
            setBuiltinWords={setBuiltinWords}
          />
        )}

        {/* Questions Step */}
        {step === 2 && (
          <QuestionsStep
            drill={drill}
            setDrill={setDrill}
            questionEditIdx={questionEditIdx}
            setQuestionEditIdx={setQuestionEditIdx}
            questionDraft={questionDraft}
            setQuestionDraft={setQuestionDraft}
            selectedQuestionWord={selectedQuestionWord}
            setSelectedQuestionWord={setSelectedQuestionWord}
            selectedQuestionWordData={selectedQuestionWordData}
            getAvailableWords={getAvailableWords}
            generateQuestion={generateQuestion}
            aiLoading={aiLoading}
            setAiLoading={setAiLoading}
            notification={notification}
            setNotification={setNotification}
            handleChoiceChange={handleChoiceChange}
            handleChoiceMedia={handleChoiceMedia}
            emptyQuestion={emptyQuestion}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
            submittingAction={submittingAction}
            setMediaModal={setMediaModal}
          />
        )}

        {/* Review Step */}
        {step === 3 && (
          <ReviewStep
            onBack={() => setStep(2)}
            drill={drill}
            successMsg={successMsg}
            handleSubmit={handleSubmit}
            submittingAction={submittingAction}
            setMediaModal={setMediaModal}
            customListDesc={customListDesc}
          />
        )}

      </div>
    </div>
  );
};
export default CreateDrill;
