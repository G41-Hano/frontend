import { useRef } from 'react';
import QuestionPreview from '../shared/QuestionPreview';
import QuestionFormContainer from '../shared/QuestionFormContainer';

const QuestionsStep = ({
  drill,
  setDrill,
  questionEditIdx,
  setQuestionEditIdx,
  questionDraft,
  setQuestionDraft,
  selectedQuestionWord,
  setSelectedQuestionWord,
  selectedQuestionWordData,
  getAvailableWords,
  generateQuestion,
  aiLoading,
  setAiLoading,
  notification,
  setNotification,
  setMediaModal,
  handleChoiceChange,
  handleChoiceMedia,
  emptyQuestion,
  onBack,
  onContinue,
  builtinWords
}) => {
  const questionFormRef = useRef(null);

  const startAddQuestion = () => {
    setQuestionDraft(emptyQuestion);
    setQuestionEditIdx(null);
    setSelectedQuestionWord('');
  };

  const handleEditQuestion = (question, index) => {
    setQuestionDraft(question);
    setQuestionEditIdx(index);
    setSelectedQuestionWord(question.word);
    
    // Show notification
    setNotification({
      show: true,
      message: `Editing question ${index+1}`,
      type: 'info'
    });
    
    // Scroll to the question form
    setTimeout(() => {
      questionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Auto-hide notification after a few seconds
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      document.getElementById('question-text-input')?.focus();
    }, 100);
  };

  const handleDeleteQuestion = (index) => {
    setDrill(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    
    if (questionEditIdx === index) {
      setQuestionDraft(emptyQuestion);
      setQuestionEditIdx(null);
      setSelectedQuestionWord('');
    }
    
    // Show notification
    setNotification({
      show: true,
      message: `Question ${index+1} deleted`,
      type: 'warning'
    });
    
    // Auto-hide notification after a few seconds
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleSaveQuestion = () => {
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
      answer:
        questionDraft.type === 'F'
          ? selectedQuestionWord
          : questionDraft.type === 'M'
            ? questionDraft.answer
            : questionDraft.answer,
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
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    startAddQuestion();
  };

  return (
    <div className="min-w-0 overflow-x-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Add Questions</h2>
      
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
          <QuestionPreview
            key={idx}
            question={q}
            index={idx}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
            setMediaModal={setMediaModal}
          />
        ))}
      </div>
      
      {/* Add/Edit Question Form */}
      <div ref={questionFormRef}>
        <QuestionFormContainer
          questionDraft={questionDraft}
          setQuestionDraft={setQuestionDraft}
          selectedQuestionWord={selectedQuestionWord}
          setSelectedQuestionWord={setSelectedQuestionWord}
          selectedQuestionWordData={selectedQuestionWordData}
          getAvailableWords={getAvailableWords}
          generateQuestion={generateQuestion}
          aiLoading={aiLoading}
          setAiLoading={setAiLoading}
          setNotification={setNotification}
          setMediaModal={setMediaModal}
          handleChoiceChange={handleChoiceChange}
          handleChoiceMedia={handleChoiceMedia}
          onSave={handleSaveQuestion}
          onCancel={handleCancelEdit}
          questionEditIdx={questionEditIdx}
          drill={drill}
          builtinWords={builtinWords}
        />
      </div>
      
      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          className="px-4 md:px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition text-sm md:text-base"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="px-4 md:px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition font-bold text-sm md:text-base"
          onClick={onContinue}
          disabled={drill.questions.length < 1}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default QuestionsStep;