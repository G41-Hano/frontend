import FileInput from '../shared/FileInput';

const PictureWordQuestionForm = ({ question, onChange, setMediaModal, selectedQuestionWord }) => {
  const addPicture = () => {
    const newPictures = Array.from({ length: 4 }, (_, i) => ({
      id: `pic_${Date.now() + i}`,
      media: null
    }));
    onChange({
      ...question,
      pictureWord: newPictures,
      answer: selectedQuestionWord
    });
  };

  const removePicture = (picId) => {
    const pictures = (question.pictureWord || []).filter(pic => pic.id !== picId);
    onChange({
      ...question,
      pictureWord: pictures
    });
  };

  const updatePicture = (picId, file) => {
    const updatedPictures = (question.pictureWord || []).map(pic => {
      if (pic.id === picId) {
        return { ...pic, media: file };
      }
      return pic;
    });
    onChange({
      ...question,
      pictureWord: updatedPictures
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Four Pics One Word</h3>
        <button
          type="button"
          onClick={addPicture}
          className="px-3 py-1 bg-[#4C53B4] text-white rounded hover:bg-[#3a3f8f]"
        >
          Add Picture
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(question.pictureWord || []).map((pic, index) => (
          <div key={pic.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-600 mb-2 block">Picture {index + 1}</span>
              <button
                type="button"
                onClick={() => removePicture(pic.id)}
                className="text-red-500 hover:text-red-700"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
            <FileInput
              value={pic.media}
              onChange={(file) => updatePicture(pic.id, file)}
              onPreview={(src, type) => setMediaModal && setMediaModal({ open: true, src, type })}
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block mb-1 font-medium">Correct Answer</label>
        <input
          type="text"
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
          placeholder="Enter the correct word that connects all pictures"
          value={question.answer || ''}
          onChange={(e) => onChange({ ...question, answer: e.target.value })}
        />
      </div>
      {(question.pictureWord || []).length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <i className="fa-solid fa-info-circle mr-2"></i>
            Add exactly 4 pictures that have a common word or theme. Make sure each picture is clear and relevant to the answer.
          </p>
        </div>
      )}
    </div>
  );
};

export default PictureWordQuestionForm;