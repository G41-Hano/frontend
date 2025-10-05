import { useState, useEffect } from 'react';
import api from '../../../api';
import CreateCustomWordList from '../../CreateCustomWordList';
import AiGenerateButton from '../shared/AiGenerateButton';
import { getMediaUrl } from '../../../utils/drill';

const WordListStep = ({
  drill,
  setDrill,
  customListDesc,
  setCustomListDesc,
  onBack,
  onContinue,
  aiLoading,
  setAiLoading,
  setNotification,
  setMediaModal,
  generateDefinitionForWord,
  handleAddCustomWord,
  handleUpdateCustomWord,
  handleRemoveCustomWord,
  validateWordList,
  builtinWords,
  setBuiltinWords
}) => {
  const [builtinWordLists, setBuiltinWordLists] = useState([]);
  const [loadingWordLists, setLoadingWordLists] = useState(false);

  // Fetch built-in word lists when needed
  useEffect(() => {
    if (drill.wordlistType === 'builtin') {
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
  }, [drill.wordlistType, setNotification]);

  const handleWordListChange = (type) => {
    setDrill(prev => ({
      ...prev,
      wordlistType: type,
      wordlistName: '',
      customWordList: type === 'custom' ? [] : prev.customWordList,
    }));
  };

  const handleBuiltinListChange = async (listId) => {
    setDrill(prev => ({ ...prev, wordlistName: listId }));
    
    if (listId) {
      try {
        const response = await api.get(`/api/builtin-wordlist/${listId}/`);
        const wordlistData = response.data;
        const words = wordlistData.words || [];
        
        // Update builtinWords state for preview
        setBuiltinWords(words);
        
        setDrill(prev => ({
          ...prev,
          builtinWordlist: {
            id: wordlistData.id,
            name: wordlistData.name,
            words: words.map(w => ({
              word: w.word,
              definition: w.definition,
              image: w.image_url ? {
                url: w.image_url,
              } : null,
              video: w.video_url ? {
                url: w.video_url,
              } : null,
            }))
          },
          builtinWords: words
        }));
        
        if (words.length === 0) {
          setNotification({
            show: true,
            message: 'Selected word list has no words.',
            type: 'warning'
          });
        }
      } catch (err) {
        console.error('Failed to fetch word list:', err);
        setNotification({
          show: true,
          message: 'Failed to load word list details',
          type: 'error'
        });
        setBuiltinWords([]);
      }
    } else {
      setBuiltinWords([]);
    }
  };

  // Generate description for custom word list
  const generateListDescription = async () => {
    if (!drill.wordlistName) {
      setNotification({
        show: true,
        message: 'Please add a word list name first.',
        type: 'error'
      });
      return;
    }

    setAiLoading(prev => ({ ...prev, listDesc: true }));
    try {
      // Check if there are any words added
      const existingWords = drill.customWordList.map(w => w.word).filter(w => w);
      
      let prompt;
      if (existingWords.length > 0) {
        // If words exist, use them to generate description
        prompt = `Create a brief, educational description for a word list called "${drill.wordlistName}" that contains these words: ${existingWords.join(', ')}. The description should explain what these words have in common or what topic/theme they relate to. Keep it concise and suitable for students.`;
      } else {
        // If no words yet, generate description based on the word list name/topic
        prompt = `Create a brief, educational description for a word list called "${drill.wordlistName}". Based on the name, suggest what kind of words this list might contain and what educational purpose it serves. Keep it concise and suitable for students.`;
      }
      
      // Generate intelligent description based on word list name and existing words
      let generatedDescription;
      
      if (existingWords.length > 0) {
        generatedDescription = `A collection of ${existingWords.length} vocabulary words focused on ${drill.wordlistName.toLowerCase()}. This word list includes: ${existingWords.join(', ')}.`;
      } else {
        // Generate simple, general description based on word list name
        generatedDescription = `A curated collection of vocabulary words focused on ${drill.wordlistName.toLowerCase()}. This word list will help students expand their knowledge and learn new terms related to this topic.`;
      }
      
      setCustomListDesc(generatedDescription);
      setNotification({
        show: true,
        message: 'Description generated successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to generate description:', err);
      // Fallback description if API fails
      const existingWords = drill.customWordList.map(w => w.word).filter(w => w);
      const fallbackDescription = existingWords.length > 0 
        ? `A collection of ${existingWords.length} words related to ${drill.wordlistName.toLowerCase()}, including: ${existingWords.slice(0, 5).join(', ')}${existingWords.length > 5 ? ' and more' : ''}.`
        : `A curated collection of vocabulary words focused on ${drill.wordlistName.toLowerCase()}. This word list will help students expand their knowledge in this subject area.`;
      
      setCustomListDesc(fallbackDescription);
      setNotification({
        show: true,
        message: 'Generated a basic description. You can edit it as needed.',
        type: 'success'
      });
    } finally {
      setAiLoading(prev => ({ ...prev, listDesc: false }));
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Select Word List</h2>
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
          
          {/* Word List Preview */}
          {drill.wordlistName && builtinWords && builtinWords.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-[#4C53B4] mb-3">Word List Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {builtinWords.map((word, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {/* Media Preview */}
                      <div className="flex-shrink-0">
                        {word.image_url ? (
                          <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img
                              src={getMediaUrl(word.image_url)}
                              alt={word.word}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setMediaModal({ 
                                open: true, 
                                src: getMediaUrl(word.image_url), 
                                type: 'image' 
                              })}
                              onError={(e) => {
                                // Silently handle missing images - show fallback icon
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                if (parent && !parent.querySelector('.fallback-icon')) {
                                  const fallbackIcon = document.createElement('i');
                                  fallbackIcon.className = 'fa-solid fa-image text-gray-300 fallback-icon';
                                  parent.appendChild(fallbackIcon);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                            <i className="fa-solid fa-image text-gray-300"></i>
                          </div>
                        )}
                      </div>
                      
                      {/* Word Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#4C53B4] text-sm mb-1 truncate">
                          {word.word}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {word.definition}
                        </p>
                        {word.video_url && (
                          <button
                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            onClick={() => setMediaModal({ 
                              open: true, 
                              src: getMediaUrl(word.video_url), 
                              type: 'video/mp4' 
                            })}
                          >
                            <i className="fa-solid fa-play"></i>
                            Watch Video
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500 text-center">
                {builtinWords.length} word{builtinWords.length !== 1 ? 's' : ''} available
              </div>
            </div>
          )}
        </div>
      )}

      {drill.wordlistType === 'custom' && (
        <>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Custom Word List Name <span className="text-red-500">*</span></label>
            <input
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
              value={drill.wordlistName}
              onChange={e => setDrill(prev => ({ ...prev, wordlistName: e.target.value }))}
              placeholder="e.g. Fruits"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Description <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <textarea
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                value={customListDesc}
                onChange={e => setCustomListDesc(e.target.value)}
                placeholder="Describe this word list"
              />
              <AiGenerateButton
                onClick={generateListDescription}
                loading={aiLoading.listDesc}
              />
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Add Vocabulary Words</label>
            </div>
            {drill.customWordList.map((word, index) => (
              <CreateCustomWordList 
                key={word.id || index} 
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
          <div className="text-sm" style={{ color: validateWordList() ? '#22c55e' : '#ef4444', minWidth: 260 }}>
            {validateWordList()
              ? 'Ready!'
              : 'Add at least 4 words and fill all required fields to proceed.'}
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <button
            className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition"
            onClick={onBack}
          >
            Back
          </button>
          <button
            className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
            onClick={async () => {
              if (drill.wordlistType === 'custom' && !validateWordList()) {
                setNotification({
                  show: true,
                  message: 'Add at least 4 words and fill all required fields to proceed.',
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
                  onContinue();
                  return;
                }
                
                try {
                  // Set loading state
                  setLoadingWordLists(true);
                  
                  // Fetch words one final time to ensure we have them
                  const response = await api.get(`/api/builtin-wordlist/${drill.wordlistName}/`);
                  const words = response.data.words || [];
                  
                  if (words.length === 0) {
                    setNotification({
                      show: true,
                      message: 'Selected word list has no words.',
                      type: 'error',
                    });
                    setLoadingWordLists(false);
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
                  setLoadingWordLists(false);
                  
                  // Proceed to next step
                  onContinue();
                } catch (error) {
                  console.error('Error fetching words:', error);
                  setNotification({
                    show: true,
                    message: 'Failed to load words. Please try again.',
                    type: 'error',
                  });
                  setLoadingWordLists(false);
                  return;
                }
              } else {
                onContinue();
              }
            }}
            disabled={
              drill.wordlistType === 'custom' 
                ? !validateWordList() 
                : !drill.wordlistName || loadingWordLists
            }
          >
            {loadingWordLists ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Loading words...
              </>
            ) : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordListStep;