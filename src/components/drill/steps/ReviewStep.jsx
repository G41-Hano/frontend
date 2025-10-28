import QuestionPreview from '../shared/QuestionPreview';

const ReviewStep = ({
  drill,
  successMsg,
  handleSubmit,
  submittingAction,
  setMediaModal,
  onBack,
  isEditing = false,
  customListDesc = ''
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Review & Update' : 'Review & Submit'}</h2>
      
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-800 text-center font-semibold animate-fadeIn">
          {successMsg}
        </div>
      )}
      
      <div className="mb-6">
        <div className="mb-2 font-medium">Drill Title: <span className="font-normal">{drill.title}</span></div>
        <div className="mb-2 font-medium">Description: <span className="font-normal">{drill.description}</span></div>
        <div className="mb-2 font-medium">Open: <span className="font-normal">{drill.openDate ? new Date(drill.openDate).toLocaleString() : 'N/A'}</span></div>
        <div className="mb-2 font-medium">Due: <span className="font-normal">{drill.dueDate ? new Date(drill.dueDate).toLocaleString() : 'N/A'}</span></div>
        
        {/* Drill Type */}
        <div className="mb-2 font-medium">
          Drill Type: <span className="font-normal">
            {drill.wordlistType === 'custom' ? (
              <span className="inline-flex items-center gap-1">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Custom</span>
              </span>
            ) : drill.wordlistType === 'builtin' ? (
              <span className="inline-flex items-center gap-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Built-in</span>
              </span>
            ) : 'N/A'}
          </span>
        </div>
        
        {/* Wordlist Name */}
        {drill.wordlistName && (
          <div className="mb-2 font-medium">
            Wordlist Name: <span className="font-normal">
              {drill.wordlistName}
            </span>
          </div>
        )}
        
        {/* Wordlist Description */}
        {(customListDesc || (drill.wordlistType === 'custom' && drill.customWordList)) && (
          <div className="mb-2 font-medium">
            Wordlist Description: <span className="font-normal italic text-gray-600">
              {customListDesc || 'No description provided'}
            </span>
          </div>
        )}
        
        <div className="mb-2 font-medium">Questions: <span className="font-normal">{drill.questions.length}</span></div>
      </div>
      
      <div className="mb-6">
        {drill.questions.map((q, idx) => (
          <QuestionPreview
            key={idx}
            question={q}
            index={idx}
            onEdit={() => {}} // Disabled in review mode
            onDelete={() => {}} // Disabled in review mode
            setMediaModal={setMediaModal}
            hideActions={true} // Hide edit/delete buttons in review mode
          />
        ))}
      </div>
      
      <div className="flex justify-between">
        <button
          className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition"
          onClick={onBack}
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            className="px-6 py-2 rounded-xl bg-yellow-400 text-white hover:bg-yellow-500 hover:scale-105 transition font-bold"
            onClick={() => handleSubmit('draft')}
            disabled={submittingAction}
          >
            {submittingAction === 'draft' ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                {isEditing ? 'Updating Draft...' : 'Saving Draft...'}
              </>
            ) : (isEditing ? 'Update as Draft' : 'Save as Draft')}
          </button>
          <button
            className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition font-bold"
            onClick={() => handleSubmit('published')}
            disabled={submittingAction}
          >
            {submittingAction === 'published' ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                {isEditing ? 'Updating...' : 'Publishing...'}
              </>
            ) : (isEditing ? 'Update Drill' : 'Publish Drill')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;