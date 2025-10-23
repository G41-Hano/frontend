import { useState, useEffect } from 'react';
import { getMediaUrl } from '../../../utils/drill';

const MediaSelector = ({ 
  drill, 
  builtinWords, 
  onMediaSelect, 
  buttonClassName = "cursor-pointer px-3 py-1 bg-[#4C53B4] text-white rounded-lg border border-[#4C53B4] text-sm hover:bg-[#3a4095]"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableMedia, setAvailableMedia] = useState([]);

  useEffect(() => {
    const media = [];
    
    if (drill.wordlistType === 'custom' && drill.customWordList) {
      // For custom wordlists, get media from uploaded words
      drill.customWordList.forEach((word, index) => {
        if (word.image) {
          const isFile = word.image instanceof File;
          const mediaUrl = isFile ? URL.createObjectURL(word.image) : word.image.url;
          const mediaType = isFile ? word.image.type : (word.image.type || 'image/*');
          
          media.push({
            id: `custom-image-${index}`,
            word: word.word,
            type: 'image',
            url: mediaUrl,
            file: isFile ? word.image : null,
            mediaObject: isFile ? word.image : { url: word.image.url, type: mediaType }
          });
        }
        if (word.signVideo) {
          const isFile = word.signVideo instanceof File;
          const mediaUrl = isFile ? URL.createObjectURL(word.signVideo) : word.signVideo.url;
          const mediaType = isFile ? word.signVideo.type : (word.signVideo.type || 'video/*');
          
          media.push({
            id: `custom-video-${index}`,
            word: word.word,
            type: 'video',
            url: mediaUrl,
            file: isFile ? word.signVideo : null,
            mediaObject: isFile ? word.signVideo : { url: word.signVideo.url, type: mediaType }
          });
        }
      });
    } else if (drill.wordlistType === 'builtin' && builtinWords) {
      // For builtin wordlists, get media from builtin words
      builtinWords.forEach((word, index) => {
        if (word.image_url) {
          media.push({
            id: `builtin-image-${index}`,
            word: word.word,
            type: 'image',
            url: getMediaUrl(word.image_url),
            file: null,
            mediaObject: { url: getMediaUrl(word.image_url), type: 'image/*' }
          });
        }
        if (word.video_url) {
          media.push({
            id: `builtin-video-${index}`,
            word: word.word,
            type: 'video',
            url: getMediaUrl(word.video_url),
            file: null,
            mediaObject: { url: getMediaUrl(word.video_url), type: 'video/mp4' }
          });
        }
      });
    }
    
    setAvailableMedia(media);
  }, [drill, builtinWords]);

  const handleMediaClick = (mediaItem) => {
    onMediaSelect(mediaItem.mediaObject);
    setIsOpen(false);
  };

  if (availableMedia.length === 0) {
    return null; // Don't show the button if no media available
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fa-solid fa-images mr-1"></i>
        From Wordlist
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} ml-1`}></i>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-80 max-h-64 overflow-y-auto">
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">
                Select media from wordlist ({availableMedia.length} items)
              </div>
              
              <div className="space-y-2">
                {availableMedia.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleMediaClick(item)}
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-12 h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.word}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const fallbackIcon = document.createElement('i');
                              fallbackIcon.className = 'fa-solid fa-image text-gray-300 fallback-icon';
                              parent.appendChild(fallbackIcon);
                            }
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <i className="fa-solid fa-play text-blue-500 text-lg"></i>
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {item.word}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {item.type === 'image' ? '📸 Image' : '🎥 Video'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MediaSelector;