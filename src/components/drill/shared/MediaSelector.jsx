import { useState } from 'react';

const MediaSelector = ({ availableMedia, onSelect, onClose }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'image', 'video'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedia = availableMedia.filter(item => {
    // Filter by type
    const typeMatch = filter === 'all' || item.type === filter;
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      item.word.toLowerCase().includes(searchQuery.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(246, 241, 241, 0.25)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Select Media from Wordlist</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by word..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#4C53B4] focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-[#4C53B4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              type="button"
            >
              All
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'image'
                  ? 'bg-[#4C53B4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              type="button"
            >
              <i className="fa-solid fa-image mr-1"></i> Images
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'video'
                  ? 'bg-[#4C53B4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              type="button"
            >
              <i className="fa-solid fa-video mr-1"></i> Videos
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMedia.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : `No ${filter === 'all' ? '' : filter} media available in wordlist`
              }
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((item, index) => (
                <div
                  key={index}
                  onClick={() => onSelect(item)}
                  className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#4C53B4] transition group"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.word}
                        className="w-full h-full object-cover group-hover:scale-110 transition"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <i className="fa-solid fa-play text-white text-3xl"></i>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {item.word}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {item.type === 'image' ? 'Image' : 'Video'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaSelector;
