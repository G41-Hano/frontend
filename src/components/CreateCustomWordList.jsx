import { AiGenerateButton, FileInput } from "../pages/Teacher/CreateDrill";
import Definitions, { useDefinitionFetcher } from "./gen-ai/GenerateDefinition";


export default function CreateCustomWordList({index,word,handleUpdateCustomWord,handleRemoveCustomWord,setMediaModal}) {
  const {isLoading, error, definitions, getDefinition} = useDefinitionFetcher()

  return (<div className="mb-4 p-4 rounded-xl border-2 border-gray-100 flex flex-col gap-2">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Word <span className="text-red-500">*</span></label>
          <input
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
            value={word.word}
            onChange={e => handleUpdateCustomWord(index, 'word', e.target.value)}
            placeholder="Enter word"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Definition <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input
              className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
              value={word.definition}
              onChange={e => handleUpdateCustomWord(index, 'definition', e.target.value)}
              placeholder="Enter definition"
            />
            <AiGenerateButton
              onClick={() => {
                handleUpdateCustomWord(index, 'word', word.word);
                getDefinition(word.word);
              }}
              loading={isLoading}
            />
          </div>
        </div>
        <button
          className="text-red-500 hover:text-red-700 px-2"
          onClick={() => handleRemoveCustomWord(index)}
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
      {/* AI-generated Definitions */}
      <Definitions 
        isLoading={isLoading} definitions={definitions} error={error}
        index={index} handleUpdateCustomWord={handleUpdateCustomWord}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Image</label>
          <FileInput
            value={word.image}
            onChange={file => handleUpdateCustomWord(index, 'image', file)}
            onPreview={(src, type) => setMediaModal({ open: true, src, type })}
          />
      
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Sign Language Video</label>
          <FileInput
            value={word.signVideo}
            onChange={file => handleUpdateCustomWord(index, 'signVideo', file)}
            onPreview={(src, type) => setMediaModal({ open: true, src, type })}
          />
        </div>
      </div>
    </div>
  )
}
