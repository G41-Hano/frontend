import AiGenerateButton from './drill/shared/AiGenerateButton';
import FileInput from './drill/shared/FileInput';
import Definitions, { useDefinitionFetcher } from "./gen-ai/GenerateDefinition";


export default function CreateCustomWordList({index,word,handleUpdateCustomWord,handleRemoveCustomWord,setMediaModal}) {
  const {isLoading, error, definitions, getDefinition} = useDefinitionFetcher()

  return (<div className="mb-4 p-3 md:p-4 rounded-xl border-2 border-gray-100 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-sm text-gray-600 mb-1">Word <span className="text-red-500">*</span></label>
          <input
            className="w-full border-2 border-gray-100 rounded-xl px-3 md:px-4 py-2 focus:border-[#4C53B4] text-sm md:text-base min-w-0"
            value={word.word}
            onChange={e => handleUpdateCustomWord(index, 'word', e.target.value)}
            placeholder="Enter word"
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-sm text-gray-600 mb-1">Definition <span className="text-red-500">*</span></label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 border-2 border-gray-100 rounded-xl px-3 md:px-4 py-2 focus:border-[#4C53B4] text-sm md:text-base min-w-0"
              value={word.definition}
              onChange={e => handleUpdateCustomWord(index, 'definition', e.target.value)}
              placeholder="Enter definition"
            />
            <div className="flex-shrink-0">
              <AiGenerateButton
                onClick={() => {
                  handleUpdateCustomWord(index, 'word', word.word);
                  getDefinition(word.word);
                }}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 self-start lg:self-center">
          <button
            className="text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            onClick={() => handleRemoveCustomWord(index)}
            title="Remove word"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      {/* AI-generated Definitions */}
      <Definitions 
        isLoading={isLoading} definitions={definitions} error={error}
        index={index} handleUpdateCustomWord={handleUpdateCustomWord}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Image</label>
          <FileInput
            value={word.image}
            onChange={file => handleUpdateCustomWord(index, 'image', file)}
            onPreview={(src, type) => setMediaModal({ open: true, src, type })}
            accept="image/jpeg,image/png"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Sign Language Video</label>
          <FileInput
            value={word.signVideo}
            onChange={file => handleUpdateCustomWord(index, 'signVideo', file)}
            onPreview={(src, type) => setMediaModal({ open: true, src, type })}
            accept="video/*"
          />
        </div>
      </div>
    </div>
  )
}
