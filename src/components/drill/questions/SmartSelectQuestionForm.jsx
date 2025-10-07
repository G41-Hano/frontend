import { FileInput } from '../index';

const SmartSelectQuestionForm = ({
  questionDraft,
  setQuestionDraft,
  handleChoiceChange,
  handleChoiceMedia,
  setMediaModal
}) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-sm md:text-base">Choices</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
        {questionDraft.choices.map((c, i) => (
          <div key={i} className="flex flex-col gap-2">
            <input
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 focus:border-[#4C53B4] text-sm md:text-base min-w-0"
              placeholder={`Choice ${i+1}`}
              value={c.text}
              onChange={e => handleChoiceChange(i, 'text', e.target.value)}
            />
            <FileInput 
              value={c.media} 
              onChange={file => handleChoiceMedia(i, file)} 
              onPreview={(src, type) => setMediaModal({ open: true, src, type })} 
            />
          </div>
        ))}
      </div>
      {/* Correct Answer Dropdown */}
      <div className="mt-4">
        <label className="block mb-1 font-medium text-sm md:text-base">Correct Answer</label>
        <select
          className="w-full border-2 border-gray-100 rounded-xl px-3 md:px-4 py-2 focus:border-[#4C53B4] text-sm md:text-base"
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
  );
};

export default SmartSelectQuestionForm;