import { getMediaUrl } from '../../../utils/drill';

const WordSelector = ({ 
  selectedWord, 
  onWordChange, 
  words, 
  selectedWordData,
  setMediaModal 
}) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">Select Word <span className="text-red-500">*</span></label>
      
      {/* Word Selection Dropdown */}
      <select
        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4] mb-4"
        value={selectedWord}
        onChange={e => onWordChange(e.target.value)}
      >
        <option value="">Select a word</option>
        {words.map((w, i) => (
          <option key={i} value={w.word}>{w.word}</option>
        ))}
      </select>
      
      {/* Word Preview with Media */}
      {selectedWord && selectedWordData && (
        <div className="mt-4 p-4 bg-[#F7F9FC] rounded-xl border border-[#4C53B4]/20">
          <div className="flex items-start gap-4">
            {/* Word Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#4C53B4] mb-2">
                {selectedWordData.word}
              </h3>
              <p className="text-gray-700 mb-3">
                <span className="font-medium">Definition:</span> {selectedWordData.definition}
              </p>
            </div>
            
            {/* Media Preview */}
            <div className="flex gap-3">
              {/* Image Preview */}
              {selectedWordData.image_url && (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                    <img
                      src={getMediaUrl(selectedWordData.image_url)}
                      alt={selectedWordData.word}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setMediaModal({ 
                        open: true, 
                        src: getMediaUrl(selectedWordData.image_url), 
                        type: 'image' 
                      })}
                      onError={(e) => {
                        console.error('Failed to load image:', getMediaUrl(selectedWordData.image_url));
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Image</span>
                </div>
              )}
              
              {/* Video Preview */}
              {selectedWordData.video_url && (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden bg-white relative">
                    <video
                      src={getMediaUrl(selectedWordData.video_url)}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setMediaModal({ 
                        open: true, 
                        src: getMediaUrl(selectedWordData.video_url), 
                        type: 'video/mp4' 
                      })}
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => e.target.pause()}
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                      <i className="fa-solid fa-play text-white text-xl"></i>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Video</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSelector;