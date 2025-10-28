// Question preview component for displaying question cards

const QuestionPreview = ({ question, index, onEdit, onDelete, setMediaModal, hideActions = false }) => {
  const getQuestionTypeName = (type) => {
    switch (type) {
      case 'M': return 'Smart Select';
      case 'F': return 'Blank Busters';
      case 'D': return 'Sentence Builder';
      case 'G': return 'Memory Game';
      case 'P': return 'Four Pics One Word';
      default: return 'Unknown';
    }
  };

  const renderPreviewContent = () => {
    switch (question.type) {
      case 'M':
        return (
          <div className="mt-2">
            <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#4C53B4]/10">
              <div className="flex flex-wrap gap-2">
                {(question.choices || []).map((c, i) => (
                  <div key={i} className={`relative w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${question.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}>
                    {question.answer === i && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#4C53B4] border-2 border-white flex items-center justify-center">
                        <i className="fa-solid fa-check text-white text-sm"></i>
                      </div>
                    )}
                    {c.media ? (
                      (() => {
                        let src = null;
                        let type = '';
                        if (c.media instanceof File) {
                          src = URL.createObjectURL(c.media);
                          type = c.media.type;
                        } else if (c.media && c.media.url) {
                          src = c.media.url;
                          type = c.media.type || '';
                        }
                        if (type.startsWith('image/')) {
                          return <img src={src} alt="preview" className="rounded w-full h-full object-contain border cursor-pointer" onClick={() => setMediaModal({ open: true, src, type })} />;
                        } else if (type.startsWith('video/')) {
                          return <video src={src} className="rounded w-full h-full object-contain border cursor-pointer" controls onClick={e => { e.stopPropagation(); setMediaModal({ open: true, src, type }); }} />;
                        }
                        return null;
                      })()
                    ) : c.text ? (
                      <span className="text-center break-words w-full text-xs">{c.text}</span>
                    ) : (
                      <i className="fa-regular fa-image text-lg text-gray-200"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'F':
        return (
          <div className="space-y-2">
            <div className="font-mono text-xl tracking-wider text-[#4C53B4] bg-[#EEF1F5] p-4 rounded-xl text-center">
              {question.pattern}
            </div>
            {question.hint && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">Hint:</span> {question.hint}
              </div>
            )}
            <div className="text-sm text-[#4C53B4] bg-[#EEF1F5]/50 p-2 rounded">
              <span className="font-medium">Answer:</span> {question.answer}
            </div>
          </div>
        );

      case 'D':
        return (
          <div className="mt-2">
            <div className="mb-4 p-4 bg-[#F7F9FC] rounded-lg border border-[#4C53B4]/10">
              {/* Sentence with Blanks */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                {(question.sentence || '').split('_').map((part, index, array) => (
                  <span key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="inline-block min-w-[100px] h-8 mx-2 bg-[#EEF1F5] border-2 border-dashed border-[#4C53B4]/30 rounded-lg align-middle"></span>
                    )}
                  </span>
                ))}
              </div>
              {/* Available Words */}
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Choices:</div>
                <div className="flex flex-wrap gap-2">
                  {[...(question.dragItems || []), ...(question.incorrectChoices || [])].map((item, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 rounded-lg text-sm font-medium 
                        ${item.isCorrect 
                          ? 'bg-[#4C53B4]/10 text-[#4C53B4] border-2 border-[#4C53B4]/20' 
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                        }`}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'G':
        return (
          <div className="mt-2">
            <div className="font-semibold mb-1">Memory Cards:</div>
            <div className="flex flex-wrap gap-2">
              {(question.memoryCards || []).map((card, i) => {
                // Find the paired card's content or index
                let pairContent = null;
                if (card.pairId) {
                  const pairCard = (question.memoryCards || []).find(c => c.id === card.pairId);
                  pairContent = pairCard ? (pairCard.content || (pairCard.media && pairCard.media.name) || `Card ${question.memoryCards.indexOf(pairCard)+1}`) : card.pairId;
                }
                return (
                  <div key={i} className="w-32 h-24 border rounded flex flex-col items-center justify-center bg-white p-1">
                    {card.media ? (
                      (() => {
                        let src = null;
                        let type = '';
                        if (card.media instanceof File) {
                          src = URL.createObjectURL(card.media);
                          type = card.media.type;
                        } else if (card.media && card.media.url) {
                          src = card.media.url;
                          type = card.media.type || '';
                        } else if (typeof card.media === 'string') {
                          src = card.media;
                          type = 'image/*';
                        }
                        
                        if (type.startsWith('video/')) {
                          return <video src={src} className="max-h-16 max-w-full mb-1" controls />;
                        } else {
                          return <img src={src} alt="card" className="max-h-16 max-w-full mb-1" />;
                        }
                      })()
                    ) : null}
                    <span className="text-xs text-center">{card.content}</span>
                    <span className="text-xs text-gray-400">Pair: {pairContent || <span className="text-gray-300">None</span>}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'P':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(question.pictureWord || []).map((pic, index) => (
                <div key={pic.id} className="border rounded-lg p-4 bg-white">
                  <span className="text-sm text-gray-600 mb-2 block">Picture {index + 1}</span>
                  {pic.media ? (
                    (() => {
                      let src = null;
                      let type = '';
                      if (pic.media instanceof File) {
                        src = URL.createObjectURL(pic.media);
                        type = pic.media.type;
                      } else if (pic.media && pic.media.url) {
                        src = pic.media.url;
                        type = pic.media.type || '';
                      }
                      if (type.startsWith('image/')) {
                        return (
                          <img
                            src={src}
                            alt="preview"
                            className="w-full h-48 object-cover rounded border cursor-pointer"
                            onClick={() => setMediaModal({ open: true, src, type })}
                          />
                        );
                      }
                      return null;
                    })()
                  ) : (
                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <i className="fa-regular fa-image text-4xl text-gray-300"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-[#EEF1F5] rounded-lg border border-[#4C53B4]">
              <span className="text-sm text-gray-600">Correct Answer:</span>
              <p className="font-medium text-[#4C53B4]">{question.answer || 'Not set'}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-4 p-4 rounded-xl border-2 border-gray-100 bg-[#F7F9FC] relative">
      <div className="font-medium mb-2">Word: {question.word}</div>
      <div className="text-gray-600 mb-2">Definition: {question.definition}</div>
      
      {/* Preview for question types */}
      <div className="mb-2">
        <span className="font-semibold">Type:</span> {getQuestionTypeName(question.type)}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Question:</span> {question.type === 'F' ? (
          <span>{(question.text || '').split('_')[0]}<span className="inline-block w-16 border-b-2 border-gray-400 mx-2 align-middle" />{(question.text || '').split('_')[1]}</span>
        ) : question.text}
      </div>

      {/* Question Media for Smart Select */}
      {question.type === 'M' && question.questionMedia && (
        <div className="mb-3">
          <div className="mt-2 w-48">
            {(() => {
              let src = null;
              let type = '';
              if (question.questionMedia instanceof File) {
                src = URL.createObjectURL(question.questionMedia);
                type = question.questionMedia.type;
              } else if (question.questionMedia && question.questionMedia.url) {
                src = question.questionMedia.url;
                type = question.questionMedia.type || '';
              }
              
              if (type.startsWith('image/') || type.includes('image')) {
                return (
                  <img
                    src={src}
                    alt="Question media"
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer"
                    onClick={() => setMediaModal({ open: true, src, type })}
                  />
                );
              } else if (type.startsWith('video/') || type.includes('video')) {
                return (
                  <video
                    src={src}
                    className="w-full h-32 object-cover rounded-lg border"
                    controls
                    onClick={e => { e.stopPropagation(); setMediaModal({ open: true, src, type }); }}
                  />
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}

      {renderPreviewContent()}

      {!hideActions && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            className="text-[#4C53B4] hover:bg-[#EEF1F5] hover:scale-110 transition p-1 rounded"
            onClick={() => onEdit(question, index)}
            title="Edit"
          >
            <i className="fa-solid fa-pen"></i>
          </button>
          <button
            className="text-red-500 hover:bg-red-100 hover:scale-110 transition p-1 rounded"
            onClick={() => onDelete(index)}
            title="Delete"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionPreview;