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
  emptyQuestion, 
  validateOverviewFields,
  validateCustomWordList,
  validateWordList
} from '../../utils/drill';
import { DrillSkeleton } from '../../components/loading';
import Skeleton from '../../components/Skeleton';

const EditDrill = ({ classroom: passedClassroom, students: passedStudents }) => {
  const [step, setStep] = useState(0);
  const [drill, setDrill] = useState(null);
  const [originalDrill, setOriginalDrill] = useState(null);
  const [questionEditIdx, setQuestionEditIdx] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion);
  const [selectedQuestionWord, setSelectedQuestionWord] = useState('');
  const [selectedQuestionWordData, setSelectedQuestionWordData] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const drillId = searchParams.get('drillId');
  const [successMsg, setSuccessMsg] = useState('');
  const [classroom, setClassroom] = useState(passedClassroom || null);
  const [students, setStudents] = useState(passedStudents || []);
  const [mediaModal, setMediaModal] = useState({ open: false, src: '', type: '' });
  const [submittingAction, setSubmittingAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const definitionFetcher = useDefinitionFetcher();
  const { aiLoading, setAiLoading, generateDefinitionForWord: generateDefForWord, generateQuestion: aiGenerateQuestion } = useAIQuestionGenerator();
  
  // Wrapper function to pass the required parameters
  const generateDefinitionForWord = (index, word) => {
    return generateDefForWord(index, word, definitionFetcher, handleUpdateCustomWord, setNotification);
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

  // Local validation functions (like in the original working code)
  const validateOverviewFieldsLocal = () => {
    if (!drill?.title || !drill?.openDate || !drill?.dueDate) return false;
    const open = new Date(drill.openDate);
    const due = new Date(drill.dueDate);
    // At least 10 minutes difference
    return due.getTime() - open.getTime() >= 10 * 60 * 1000;
  };

  const validateWordListLocal = () => {
    if (!drill?.wordlistType) return false;
    if (drill.wordlistType === 'builtin' && !drill.wordlistName) return false;
    if (drill.wordlistType === 'custom') {
      if (!drill.wordlistName || !customListDesc) return false;
      if ((drill.customWordList || []).length < 3) return false;
      for (const w of drill.customWordList || []) {
        if (!w.word || !w.definition || !w.image || !w.signVideo) return false;
      }
    }
    return true;
  };

  // Built-in word lists state
  const [builtinWordLists, setBuiltinWordLists] = useState([]);
  const [builtinWords, setBuiltinWords] = useState([]);
  const [loadingWordLists, setLoadingWordLists] = useState(false);
  const [customListDesc, setCustomListDesc] = useState('');

  // Helper function to get absolute URL
  const getAbsoluteUrl = (url) => {
    if (!url) return null;
    if (typeof url !== 'string') return null;
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  // Load drill data
  useEffect(() => {
    if (!drillId) {
      navigate('/teacher');
      return;
    }

    const fetchDrill = async () => {
      try {
        // 1. Fetch the drill
        const response = await api.get(`/api/drills/${drillId}/`);
        const drillData = {
          ...response.data,
          openDate: response.data.open_date ? (() => {
            const date = new Date(response.data.open_date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          })() : '',
          dueDate: response.data.deadline ? (() => {
            const date = new Date(response.data.deadline);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          })() : '',
          questions: (response.data.questions || []).map(q => {
            let answerIdx = 0;
            if (q.type === 'M' || q.type === 'F') {
              answerIdx = (q.choices || []).findIndex(c => c.is_correct);
              if (answerIdx < 0) answerIdx = 0;
            }

            // Process choices for Smart Select and Blank Busters
            const choices = (q.choices || []).map(c => {
              let media = null;
              if (c.image) {
                const url = getAbsoluteUrl(c.image);
                if (url) media = { url, type: 'image/*' };
              } else if (c.video) {
                const url = getAbsoluteUrl(c.video);
                if (url) media = { url, type: 'video/*' };
              }
              return { ...c, media };
            });

            // Process Four Pics One Word pictures (comprehensive handling)
            let pictureWord = q.pictureWord || [];
            if (Array.isArray(pictureWord)) {
              pictureWord = pictureWord.map(pic => {
                let media = null;
                if (pic.media) {
                  // Check if media is an object with url and type
                  if (typeof pic.media === 'object' && pic.media !== null && pic.media.url) {
                    const url = getAbsoluteUrl(pic.media.url);
                    if (url) {
                      media = {
                        url,
                        type: pic.media.type || 'image/*' // Assume image if type is missing for picture word
                      };
                    }
                  } else if (typeof pic.media === 'string') {
                    // Fallback for older data or simple URLs without type
                    const url = getAbsoluteUrl(pic.media);
                    if (url) {
                      media = { url, type: 'image/*' }; // Assume image for string URLs in picture word
                    }
                  }
                }
                return {
                  ...pic,
                  media
                };
              });
            }

            // Process Memory Game cards (comprehensive handling)
            let memoryCards = q.memoryCards || [];
            if (Array.isArray(memoryCards)) {
              memoryCards = memoryCards.map(card => {
                let media = null;
                if (card.media) {
                  if (typeof card.media === 'object' && card.media !== null && card.media.url) {
                    const url = getAbsoluteUrl(card.media.url);
                    if (url) {
                      media = {
                        url,
                        type: card.media.type || 'image/*'
                      };
                    }
                  } else if (typeof card.media === 'string') {
                    const url = getAbsoluteUrl(card.media);
                    if (url) {
                      media = { 
                        url, 
                        type: card.media.includes('.mp4') || card.media.includes('.mov') ? 'video/*' : 'image/*' 
                      };
                    }
                  }
                }
                return {
                  ...card,
                  media
                };
              });
            }

            // Process sign language video for the question word (comprehensive handling)
            let signVideo = null;
            if (q.signVideo) {
              if (typeof q.signVideo === 'object' && q.signVideo.url) {
                signVideo = { url: getAbsoluteUrl(q.signVideo.url), type: 'video/*' };
              } else if (typeof q.signVideo === 'string') {
                signVideo = { url: getAbsoluteUrl(q.signVideo), type: 'video/*' };
              }
            }

            // Process word image (comprehensive handling)
            let image = null;
            if (q.image) {
              if (typeof q.image === 'object' && q.image.url) {
                image = { url: getAbsoluteUrl(q.image.url), type: 'image/*' };
              } else if (typeof q.image === 'string') {
                image = { url: getAbsoluteUrl(q.image), type: 'image/*' };
              }
            }

            // Process question media for Multiple Choice questions
            let questionMedia = null;
            if (q.question_media) {
              if (typeof q.question_media === 'object' && q.question_media.url) {
                const url = getAbsoluteUrl(q.question_media.url);
                if (url) {
                  questionMedia = { 
                    url, 
                    type: q.question_media.type || (url.includes('.mp4') || url.includes('.mov') ? 'video/mp4' : 'image/jpeg')
                  };
                }
              } else if (typeof q.question_media === 'string') {
                const url = getAbsoluteUrl(q.question_media);
                if (url) {
                  questionMedia = { 
                    url, 
                    type: url.includes('.mp4') || url.includes('.mov') ? 'video/mp4' : 'image/jpeg'
                  };
                }
              }
            }

            return {
              ...q,
              answer: q.type === 'P' ? q.answer : q.type === 'F' ? q.answer : answerIdx,
              choices,
              pictureWord,
              memoryCards,
              dragItems: q.dragItems || [],
              incorrectChoices: q.incorrectChoices || [],
              sentence: q.sentence || '',
              pattern: q.pattern || '',
              hint: q.hint || '',
              letterChoices: q.letterChoices || [],
              signVideo,
              image,
              questionMedia
            };
          }),
        };

        // 2. Determine wordlist type and fetch data
        if (drillData.custom_wordlist) {
          // Custom wordlist
          const wordlistRes = await api.get(`/api/wordlist/${drillData.custom_wordlist}/`);
          drillData.wordlistType = 'custom';
          drillData.wordlistName = wordlistRes.data.name;
          drillData.customWordList = (wordlistRes.data.words || []).map(w => ({
            id: w.id,
            word: w.word,
            definition: w.definition,
            image: w.image_url ? { 
              url: getAbsoluteUrl(w.image_url), 
              type: 'image/*' 
            } : null,
            signVideo: w.video_url ? { 
              url: getAbsoluteUrl(w.video_url), 
              type: 'video/*' 
            } : null
          }));
          setCustomListDesc(wordlistRes.data.description || '');
        } else if (drillData.wordlist_name) {
          // Built-in wordlist
          drillData.wordlistType = 'builtin';
          drillData.wordlistName = drillData.wordlist_name;
          
          try {
            const builtinRes = await api.get(`/api/builtin-wordlist/${drillData.wordlist_name}/`);
            setBuiltinWords((builtinRes.data.words || []).map(w => ({
              word: w.word,
              definition: w.definition,
              image: w.image_url ? { 
                url: getAbsoluteUrl(w.image_url), 
                type: 'image/*' 
              } : null,
              signVideo: w.video_url ? { 
                url: getAbsoluteUrl(w.video_url), 
                type: 'video/*' 
              } : null
            })));
          } catch (error) {
            console.error('Error fetching built-in wordlist:', error);
            setBuiltinWords([]);
          }
        } else {
          // No wordlist information - set defaults
          drillData.wordlistType = 'builtin';
          drillData.wordlistName = '';
          drillData.customWordList = [];
        }

        // 3. Set the drill state
        setDrill(drillData);
        setOriginalDrill(drillData);

        // 4. Fetch classroom and students only if not passed as props
        if (!passedClassroom || !passedStudents) {
          const classroomResponse = await api.get(`/api/classrooms/${response.data.classroom}/`);
          if (!passedClassroom) setClassroom(classroomResponse.data);
          
          const studentsResponse = await api.get(`/api/classrooms/${response.data.classroom}/students/`);
          if (!passedStudents) {
            setStudents(Array.isArray(studentsResponse.data) ? studentsResponse.data : 
                       Array.isArray(studentsResponse.data?.students) ? studentsResponse.data.students : []);
          }
        }
      } catch (error) {
        console.error('Error fetching drill:', error);
        setNotification({
          show: true,
          message: 'Failed to load drill data',
          type: 'error'
        });
        setTimeout(() => navigate('/teacher'), 2000);
      }
    };

    fetchDrill();
  }, [drillId, navigate, passedClassroom, passedStudents]);

  // Sync selectedQuestionWordData when selectedQuestionWord changes (from original)
  useEffect(() => {
    if (!drill) return;
    if (selectedQuestionWord) {
      const wordData = getAvailableWords().find(w => w.word === selectedQuestionWord);
      setSelectedQuestionWordData(wordData || null);
    } else {
      setSelectedQuestionWordData(null);
    }
  }, [selectedQuestionWord, drill, builtinWords]);

  // Fetch built-in word lists when needed
  useEffect(() => {
    if (step === 1 && drill?.wordlistType === 'builtin') {
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
  }, [step, drill?.wordlistType]);

  // Get available words for questions (matching original structure)
  const getAvailableWords = () => {
    if (!drill) return [];
    if (drill.wordlistType === 'custom') {
      return drill.customWordList || [];
    } else if (drill.wordlistType === 'builtin') {
      return builtinWords || [];
    }
    return [];
  };

  // Wordlist handlers (from original working code)
  const handleWordListChange = (type) => {
    setDrill(prev => ({
      ...prev,
      wordlistType: type,
      wordlistName: '',
      customWordList: type === 'custom' ? [] : prev.customWordList,
    }));
    if (type === 'builtin') {
      setDrill(prev => ({
        ...prev,
        builtinWordlist: {
          ...prev.builtinWordlist,
          words: []
        }
      }));
    }
  };

  const handleBuiltinListChange = async (listId) => {
    setDrill(prev => ({ ...prev, wordlistName: listId }));
    if (listId) {
      try {
        const response = await api.get(`/api/builtin-wordlist/${listId}/`);
        setBuiltinWords(response.data.words || []);
      } catch (error) {
        console.error('Failed to load words:', error);
        setNotification({ show: true, message: 'Failed to load words', type: 'error' });
      }
    } else {
      setBuiltinWords([]);
    }
  };

  // Handle custom word operations
  const handleAddCustomWord = () => {
    if (!drill) return;
    setDrill(prev => ({
      ...prev,
      customWordList: [...(prev.customWordList || []), { word: '', definition: '', image: null, signVideo: null }]
    }));
  };

  const handleUpdateCustomWord = (index, field, value) => {
    if (!drill) return;
    setDrill(prev => ({
      ...prev,
      customWordList: (prev.customWordList || []).map((word, i) => 
        i === index ? { ...word, [field]: value } : word
      )
    }));
  };

  const handleRemoveCustomWord = (index) => {
    if (!drill) return;
    setDrill(prev => ({
      ...prev,
      customWordList: (prev.customWordList || []).filter((_, i) => i !== index)
    }));
  };

  // Question handlers (from original working code)
  const startAddQuestion = () => {
    setQuestionDraft({
      text: '',
      type: 'M',
      choices: [
        { text: '', media: null },
        { text: '', media: null },
        { text: '', media: null },
        { text: '', media: null },
      ],
      answer: 0,
      blankPosition: null,
      dragItems: [],
      memoryCards: [],
      pictureWord: [],
      sentence: '',
      letterChoices: [],
    });
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

  // AI question generation function - use the shared AI generator
  const generateQuestion = async () => {
    if (!selectedQuestionWord) {
      setNotification({
        show: true,
        message: 'Please select a word first',
        type: 'error'
      });
      return;
    }

    // Call the AI generator from the hook
    await aiGenerateQuestion(
      questionDraft,
      selectedQuestionWord,
      selectedQuestionWordData,
      getAvailableWords,
      setQuestionDraft,
      setNotification
    );
  };


  // Handle form submission
  const handleSubmit = async (status = drill?.status || 'published') => {
    if (!drill) return;
    
    setSubmittingAction(status);
    try {
      const formData = new FormData();
      
      // Upsert custom word list first if applicable
      if (drill.wordlistType === 'custom') {
        // Process words and upload new files
        const processedWords = [];
        for (const word of drill.customWordList || []) {
          const wordData = {
            id: word.id,
            word: word.word,
            definition: word.definition
          };
          
          // Handle image upload
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
          } else if (word.image && word.image.url) {
            wordData.image_url = word.image.url;
          }
          
          // Handle sign video upload
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
          } else if (word.signVideo && word.signVideo.url) {
            wordData.video_url = word.signVideo.url;
          }
          
          processedWords.push(wordData);
        }

        const wordlistPayload = {
          name: drill.wordlistName || '',
          description: customListDesc || '',
          words: processedWords,
        };

        if (drill.custom_wordlist) {
          await api.put(`/api/wordlist/${drill.custom_wordlist}/`, wordlistPayload);
          formData.append('custom_wordlist', drill.custom_wordlist);
        } else {
          const createRes = await api.post('/api/wordlist/', wordlistPayload);
          const newListId = createRes?.data?.id;
          if (newListId) {
            formData.append('custom_wordlist', newListId);
          }
        }
      }

      // Process questions (comprehensive handling for all question types)
      const questions = (drill.questions || []).map((q, qIdx) => {
        const base = {
          id: q.id,
          text: q.text,
          type: q.type,
          word: q.word,
          definition: q.definition,
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

        // Smart Select (M) and Blank Busters (F) - both use choices
        if (q.type === 'M' || q.type === 'F') {
          base.answer = q.answer;
          base.choices = (q.choices || []).map((c, cIdx) => {
            let choice = { 
              text: c.text,
              is_correct: q.answer === cIdx 
            };
            if (c.media instanceof File) {
              const key = `media_${qIdx}_${cIdx}`;
              formData.append(key, c.media);
              choice.media = key;
            } else if (c.media && c.media.url) {
              choice.media = c.media.url;
            }
            return choice;
          });
        }

        // Blank Busters (F) - additional fields
        if (q.type === 'F') {
          base.pattern = q.pattern;
          base.hint = q.hint;
          base.letterChoices = q.letterChoices;
        }

        // Sentence Builder (D)
        if (q.type === 'D') {
          base.sentence = q.sentence || '';
          base.dragItems = Array.isArray(q.dragItems) ? q.dragItems : [];
          base.incorrectChoices = Array.isArray(q.incorrectChoices) ? q.incorrectChoices : [];
        }

        // Memory Game (G)
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

        // Four Pics One Word (P)
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

        // Clean up null/undefined values
        Object.keys(base).forEach(k => (base[k] == null) && delete base[k]);
        return base;
      });

      formData.append('title', drill.title);
      formData.append('description', drill.description);
      formData.append('open_date', drill.openDate ? new Date(drill.openDate).toISOString() : '');
      formData.append('deadline', drill.dueDate ? new Date(drill.dueDate).toISOString() : '');
      formData.append('classroom', drill.classroom);
      formData.append('questions_input', JSON.stringify(questions));
      formData.append('status', status);
      
      // Handle wordlist information
      if (drill.wordlistType === 'custom') {
        formData.append('custom_wordlist', drill.custom_wordlist || '');
        formData.append('wordlist_name', '');
      } else if (drill.wordlistType === 'builtin') {
        formData.append('custom_wordlist', '');
        formData.append('wordlist_name', drill.wordlistName || '');
      }

      await api.patch(`/api/drills/${drillId}/`, formData);
      setDrill(prev => ({ ...prev, status }));
      setSuccessMsg('Drill updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setSubmittingAction(null);
        navigate(-1);
      }, 2000);
    } catch (err) {
      setSubmittingAction(null);
      console.error("Error updating drill:", err);
      setNotification({
        show: true,
        message: 'Failed to update drill: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message || 'Unknown error'),
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
    }
  };


  return (
    <div className="min-h-screen bg-[#EEF1F5]">
        {/* Header */}
        <ClassroomHeader
          classroom={classroom}
          students={students}
          onEdit={() => {}}
          onDelete={() => {}}
          onBack={() => navigate(-1)}
        />
          
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-[95%] mx-auto">
          {!drill ? (
            <div className="animate-pulse">
              <Skeleton className="h-8 w-1/3 mb-8" />
              <div className="space-y-6">
                <DrillSkeleton />
                <DrillSkeleton />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Drill: {drill.title}</h1>
          
          <Stepper 
            step={step}
            setStep={setStep}
          />

          {/* Step 0: Overview */}
          {step === 0 && (
            <OverviewStep
              drill={drill}
              setDrill={setDrill}
              handleOverviewChange={handleOverviewChange}
              onBack={() => navigate(-1)}
              onContinue={() => setStep(1)}
              notification={notification}
              setNotification={setNotification}
              validateOverviewFields={validateOverviewFieldsLocal}
              isEditing={true}
            />
          )}

          {/* Step 1: Word List */}
          {step === 1 && (
            <WordListStep
              drill={drill}
              setDrill={setDrill}
              builtinWordLists={builtinWordLists}
              loadingWordLists={loadingWordLists}
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
              handleWordListChange={handleWordListChange}
              handleBuiltinListChange={handleBuiltinListChange}
              validateWordList={validateWordListLocal}
              builtinWords={builtinWords}
              setBuiltinWords={setBuiltinWords}
            />
          )}

          {/* Step 2: Questions */}
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
              setMediaModal={setMediaModal}
              handleChoiceChange={handleChoiceChange}
              handleChoiceMedia={handleChoiceMedia}
              emptyQuestion={emptyQuestion}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
              isEditing={true}
            />
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <ReviewStep
              onBack={() => setStep(2)}
              drill={drill}
              successMsg={successMsg}
              handleSubmit={handleSubmit}
              submittingAction={submittingAction}
              setMediaModal={setMediaModal}
              isEditing={true}
              customListDesc={customListDesc}
            />
          )}
            </>
          )}
        </div>

        {/* Media Modal */}
        <MediaModal 
          mediaModal={mediaModal}
          setMediaModal={setMediaModal} 
        />
    </div>
  );
};

export default EditDrill;
