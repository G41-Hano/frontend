import FileInput from '../shared/FileInput';

const MemoryGameCard = ({ 
  card, 
  cards, 
  onRemove, 
  onTextChange, 
  onMediaChange, 
  onPairChange, 
  setNotification, 
  setMediaModal 
}) => {
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
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <input
          type="text"
          value={card.content}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter text content"
          className="flex-1 mr-2 p-2 border rounded"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
      <FileInput
        value={card.media}
        onChange={handleMediaChange}
        onPreview={(src, type) => setMediaModal({ open: true, src, type })}
      />
      <div className="mt-2">
        <label className="block text-xs text-gray-600 mb-1">Pair With</label>
        <select
          className="w-full border rounded p-1"
          value={card.pairId || ''}
          onChange={e => onPairChange(e.target.value)}
        >
          <option value="">Select a card</option>
          {cards.filter(c => c.id !== card.id).map(c => (
            <option key={c.id} value={c.id}>
              {c.content || c.media?.name || c.media?.url || 'Card'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MemoryGameCard;