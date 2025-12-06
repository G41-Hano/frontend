import { useState } from 'react';
import FileInput from '../shared/FileInput';
import MediaSelector from '../shared/MediaSelector';

const MemoryGameCard = ({ 
  card, 
  cards, 
  onRemove, 
  onTextChange, 
  onMediaChange, 
  onPairChange, 
  setNotification, 
  setMediaModal,
  availableWords
}) => {
  
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Prepare available media from wordlist
  const availableMedia = [];
  if (availableWords && availableWords.length > 0) {
    availableWords.forEach(word => {
      // Add image if available
      if (word.image || word.image_url) {
        const imageSource = word.image_url || (word.image && word.image.url) || word.image;
        // Handle File objects by creating object URLs
        const imageUrl = imageSource instanceof File ? URL.createObjectURL(imageSource) : imageSource;
        if (imageUrl) {
          availableMedia.push({
            word: word.word,
            url: imageUrl,
            type: 'image',
            isFile: imageSource instanceof File,
            source: imageSource // Keep reference to original File or URL
          });
        }
      }
    });
  }

  const handleSelectFromWordlist = () => {
    setShowMediaSelector(true);
  };

  const handleMediaSelect = (selectedMedia) => {
    // If it's a URL string, create a media object with the URL
    let mediaObject;
    if (selectedMedia.source instanceof File) {
      // Pass the File object directly
      mediaObject = selectedMedia.source;
    } else {
      // It's already a URL string from the server
      mediaObject = {
        url: selectedMedia.source,
        type: selectedMedia.type === 'image' ? 'image/jpeg' : 'video/mp4',
        fromWordlist: true
      };
    }
    handleMediaChange(mediaObject);
    setShowMediaSelector(false);
  };

  const handleMediaChange = (file) => {
    if (file && !file.type.startsWith('image/')) {
      setNotification({
        show: true,
        message: 'Only image files are allowed for Memory Game cards.',
        type: 'error'
      });
      // Auto-hide notification after a few seconds
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      setNotification({
        show: true,
        message: 'File size must be less than 5MB',
        type: 'error'
      });
      return;
    }
    
    onMediaChange(file);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-md">
      <div className="flex justify-between items-center mb-2 gap-2">
        <p className="text-lg font-bold text-[#4C53B4]">{card.number}</p>
        <input
          type="text"
          value={card.content}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter text content"
          className="flex-1 p-2 mr-2 border rounded bg-gray-100"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 self-start"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
      <FileInput
        value={card.media}
        onChange={handleMediaChange}
        onPreview={(src, type) => setMediaModal({ open: true, src, type })}
        onSelectFromWordlist={handleSelectFromWordlist}
        hasWordlistMedia={availableMedia.length > 0}
      />
      <div className="mt-2">
        <label className="block text-xs text-gray-600 mb-1">Pair With</label>
        <select
          className="w-full border rounded p-1"
          value={card.pairId || ''}
          onChange={e => onPairChange(e.target.value)}
        >
          <option className="text-gray-400">Select a card</option>
          {cards.filter(c => c.id !== card.id).map(c => (
            <option key={c.id} value={c.id} style={{fontWeight: c.content ? 'bold' : 'normal'}}>
              {c.content || 'Card #'+c.number || c.media?.name || c.media?.url || 'Card'}
            </option>
          ))}
        </select>
      </div>

      {
        showMediaSelector && (
        <MediaSelector
          availableMedia={availableMedia}
          onSelect={handleMediaSelect}
          onClose={() => {
            setShowMediaSelector(false);
          }}
        />
      )
      }
    </div>
  );
};

export default MemoryGameCard;