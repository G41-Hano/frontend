import React, { useEffect } from 'react';
import { AiGenerateButton } from '../index';

const SentenceBuilderQuestionForm = ({
  questionDraft,
  setQuestionDraft,
  selectedQuestionWordData,
  setNotification,
  aiLoading,
  setAiLoading
}) => {
  // Auto-sync answer fields with blanks whenever sentence changes
  useEffect(() => {
    const sentence = questionDraft.sentence || '';
    const blankCount = (sentence.match(/_/g) || []).length;
    const currentAnswers = (questionDraft.dragItems || []).length;
    
    if (blankCount !== currentAnswers) {
      let dragItems = questionDraft.dragItems || [];
      
      if (blankCount > currentAnswers) {
        // Add empty answers for new blanks
        const newAnswers = Array(blankCount - currentAnswers).fill().map(() => ({ text: '', isCorrect: true }));
        dragItems = [...dragItems, ...newAnswers];
      } else if (blankCount < currentAnswers) {
        // Remove extra answers
        dragItems = dragItems.slice(0, blankCount);
      }
      
      setQuestionDraft(prev => ({ ...prev, dragItems }));
    }
  }, [questionDraft.sentence, setQuestionDraft]);

  return (
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
                const initialSentence = `${definition}`;
                const allWords = initialSentence.split(/\s+/);
                
                // Always generate a fresh random number of blanks when AI Generate is clicked
                // Weighted random: 10% chance of 1, 30% chance of 2, 40% chance of 3, 20% chance of 4
                let targetBlankCount;
                const random = Math.random();
                if (random < 0.1) targetBlankCount = 1;
                else if (random < 0.4) targetBlankCount = 2;
                else if (random < 0.8) targetBlankCount = 3;
                else targetBlankCount = 4;
                
                // Select words to blank out - be more flexible with word selection
                let eligibleWords = allWords.filter(word => word.length > 2); // Lower threshold to 2+ characters
                const wordsToBlank = new Set();
                
                // Create a pool of words we can potentially blank, excluding very common words
                const excludeWords = ['the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'for', 'can', 'its', 'it'];
                eligibleWords = eligibleWords.filter(word => {
                  const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
                  return !excludeWords.includes(cleanWord);
                });
                
                // Shuffle eligible words for random selection
                const shuffledWords = [...eligibleWords].sort(() => Math.random() - 0.5);
                
                // Add words to blank until we reach target count
                for (let i = 0; i < Math.min(targetBlankCount, shuffledWords.length); i++) {
                  const word = shuffledWords[i];
                  const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
                  wordsToBlank.add(cleanWord);
                }
                
                // Create sentence with blanks and collect words in order
                const blankedWordsInOrder = [];
                const sentenceWithBlanks = allWords.map((word, index) => {
                  const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
                  if (wordsToBlank.has(cleanWord)) {
                    blankedWordsInOrder.push(cleanWord);
                    return '_';
                  }
                  return word;
                }).join(' ');
                
                // Create dragItems in the correct order matching the blanks
                const finalBlankCount = (sentenceWithBlanks.match(/_/g) || []).length;
                const dragItems = blankedWordsInOrder.slice(0, finalBlankCount).map(word => ({ text: word, isCorrect: true }));
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
                const blankCount = (questionDraft.sentence || '').match(/_/g)?.length || 0;
                const newItems = questionDraft.dragItems.filter((_, i) => i !== index);
                // Only allow deletion if we have more answers than blanks
                if (newItems.length >= blankCount) {
                  setQuestionDraft({ ...questionDraft, dragItems: newItems });
                } else {
                  // If deleting would result in fewer answers than blanks, show warning
                  setNotification({
                    show: true,
                    message: `You need at least ${blankCount} answers to match the number of blanks in your sentence.`,
                    type: 'error'
                  });
                }
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
          const hasTooManyAnswers = currentAnswers > blankCount;

          return (
            <>
              {hasTooManyAnswers && blankCount > 0 && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                  Too many answers! You have {currentAnswers} answers but only {blankCount} blanks. Please remove {currentAnswers - blankCount} answer{currentAnswers - blankCount > 1 ? 's' : ''}.
                </div>
              )}
              {hasEnoughAnswers && !hasTooManyAnswers && blankCount > 0 && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <i className="fa-solid fa-check-circle mr-2"></i>
                  Perfect! You have added all needed answers ({currentAnswers}/{blankCount} blanks)
                </div>
              )}
              {!hasEnoughAnswers && blankCount > 0 && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  Answer fields will auto-sync with your blanks. You need {blankCount - currentAnswers} more answer{blankCount - currentAnswers > 1 ? 's' : ''} ({currentAnswers}/{blankCount} blanks)
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
  );
};

export default SentenceBuilderQuestionForm;