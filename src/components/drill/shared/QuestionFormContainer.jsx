// Question form container with type selection and form management
import { 
  AiGenerateButton,
  SmartSelectQuestionForm,
  BlankBusterQuestionForm,
  SentenceBuilderQuestionForm,
  MemoryGameQuestionForm,
  PictureWordQuestionForm
} from '../index';
import WordSelector from './WordSelector';
import QuestionTypeSelector from './QuestionTypeSelector';
import { emptyQuestion } from '../../../utils/drill';

const QuestionFormContainer = ({
  questionDraft,
  setQuestionDraft,
  selectedQuestionWord,
  setSelectedQuestionWord,
  selectedQuestionWordData,
  getAvailableWords,
  generateQuestion,
  aiLoading,
  setAiLoading,
  setNotification,
  setMediaModal,
  handleChoiceChange,
  handleChoiceMedia,
  onSave,
  onCancel,
  questionEditIdx,
  drill,
  builtinWords
}) => {
  return (
    <div className="mb-6 p-3 md:p-6 rounded-xl border-2 border-gray-100 bg-[#F7F9FC] overflow-x-auto">
      <div className="mb-4 min-w-0">
        <div className="font-bold text-base md:text-lg mb-2">
          {questionEditIdx !== null ? 'Edit' : 'Add'} Question
        </div>
        
        {/* Select Word */}
        <WordSelector
          selectedWord={selectedQuestionWord}
          onWordChange={setSelectedQuestionWord}
          words={getAvailableWords()}
          selectedWordData={selectedQuestionWordData}
          setMediaModal={setMediaModal}
        />
        
        {/* Disable rest of form if no word selected */}
        {selectedQuestionWord && (
          <>
            {/* Question Type Selection */}
            <QuestionTypeSelector
              selectedType={questionDraft.type}
              onTypeChange={(newType) => {
                setQuestionDraft({
                  ...questionDraft,
                  type: newType,
                  text: '',
                  choices: newType === 'M' ? emptyQuestion.choices.map(() => ({ text: '', media: null })) : [],
                  answer: '',
                  pattern: newType === 'F' ? '' : undefined,
                  hint: newType === 'F' ? '' : undefined,
                  dragItems: newType === 'D' ? [] : undefined,
                  memoryCards: newType === 'G' ? [] : undefined,
                  pictureWord: newType === 'P' ? [] : undefined,
                });
              }}
            />

            {/* Question Text with AI Generation */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                {questionDraft.type === 'M' ? 'Question Text' : 'Drill Instruction'} <span className="text-red-500">*</span>
              </label>
              {questionDraft.type !== 'F' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="flex-1 border-2 border-gray-100 rounded-xl px-3 md:px-4 py-2 focus:border-[#4C53B4] text-sm md:text-base min-w-0"
                    placeholder={questionDraft.type === 'M' ? "Enter question text" : "Enter drill instruction"}
                    value={questionDraft.text}
                    onChange={e => setQuestionDraft({ ...questionDraft, text: e.target.value })}
                    id="question-text-input"
                  />
                  <div className="flex-shrink-0">
                    <AiGenerateButton
                      onClick={generateQuestion}
                      loading={aiLoading.question}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Type-specific forms */}
            {questionDraft.type === 'F' && (
              <BlankBusterQuestionForm
                questionDraft={questionDraft}
                setQuestionDraft={setQuestionDraft}
                selectedQuestionWord={selectedQuestionWord}
                generateQuestion={generateQuestion}
                aiLoading={aiLoading}
              />
            )}

            {questionDraft.type === 'D' && (
              <SentenceBuilderQuestionForm
                questionDraft={questionDraft}
                setQuestionDraft={setQuestionDraft}
                selectedQuestionWordData={selectedQuestionWordData}
                setNotification={setNotification}
                aiLoading={aiLoading}
                setAiLoading={setAiLoading}
              />
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

            {questionDraft.type === 'P' && (
              <PictureWordQuestionForm
                question={questionDraft}
                onChange={(updatedQuestion) => {
                  setQuestionDraft(updatedQuestion);
                }}
              />
            )}

            {questionDraft.type === 'M' && (
              <SmartSelectQuestionForm
                questionDraft={questionDraft}
                setQuestionDraft={setQuestionDraft}
                handleChoiceChange={handleChoiceChange}
                handleChoiceMedia={handleChoiceMedia}
                setMediaModal={setMediaModal}
                drill={drill}
                builtinWords={builtinWords}
              />
            )}

            {/* Add/Edit Question Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              {questionEditIdx !== null && (
                <button 
                  className="px-3 md:px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition text-sm md:text-base" 
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
              <button
                className="px-3 md:px-4 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition text-sm md:text-base font-medium"
                onClick={onSave}
                disabled={
                  !selectedQuestionWord ||
                  !questionDraft.text || 
                  (questionDraft.type === 'M' && questionDraft.choices.some(c => !c.text && !c.media)) ||
                  (questionDraft.type === 'F' && (!questionDraft.pattern || !questionDraft.answer)) ||
                  (questionDraft.type === 'D' && (
                    !questionDraft.text ||
                    !questionDraft.sentence ||
                    (questionDraft.dragItems || []).length === 0 || 
                    !(questionDraft.sentence || '').includes('_')
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
  );
};

export default QuestionFormContainer;