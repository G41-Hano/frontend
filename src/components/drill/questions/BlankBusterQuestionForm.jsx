import { AiGenerateButton } from '../index';

const BlankBusterQuestionForm = ({
  questionDraft,
  setQuestionDraft,
  selectedQuestionWord,
  generateQuestion,
  aiLoading
}) => {
  return (
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
                  // Generate letter choices
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
  );
};

export default BlankBusterQuestionForm;