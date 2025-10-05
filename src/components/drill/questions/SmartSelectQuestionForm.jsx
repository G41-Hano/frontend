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
        <label className="block mb-1 font-medium">Correct Answer</label>
        <select
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
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