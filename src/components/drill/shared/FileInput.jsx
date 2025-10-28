import { useState } from 'react';

const FileInput = ({ value, onChange, onPreview, onSelectFromWordlist, hasWordlistMedia }) => {
  const isFile = value instanceof File;
  const src = isFile ? URL.createObjectURL(value) : (value && value.url ? value.url : '');
  const [inputKey, setInputKey] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleRemove = () => {
    onChange(null);
    setInputKey(k => k + 1);
  };
  
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div className="flex gap-1 w-full">
        <label className="cursor-pointer px-3 py-1 bg-[#EEF1F5] rounded-lg border border-gray-200 text-sm text-[#4C53B4] hover:bg-[#e6e9ff] flex-1 text-center">
          <i className="fa-solid fa-paperclip mr-1"></i> {value ? 'Change File' : 'Add File'}
          <input
            key={inputKey}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              onChange(file);
            }}
          />
        </label>
        
        {hasWordlistMedia && onSelectFromWordlist && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-2 py-1 bg-[#EEF1F5] rounded-lg border border-gray-200 text-sm text-[#4C53B4] hover:bg-[#e6e9ff]"
              title="Select from wordlist"
            >
              <i className="fa-solid fa-chevron-down"></i>
            </button>
            
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px]">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFromWordlist();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <i className="fa-solid fa-images mr-2"></i>
                    From Wordlist
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {src && value && value.type && value.type.startsWith('image/') && (
        <div className="relative mt-1 w-full">
          <img
            src={src}
            alt="preview"
            className="w-full max-h-48 object-cover rounded border cursor-pointer"
            onClick={() => onPreview && onPreview(src, value.type)}
          />
          <button
            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700"
            onClick={handleRemove}
            type="button"
            style={{lineHeight:0}}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      {src && value && value.type && value.type.startsWith('video/') && (
        <div className="relative mt-1 w-full">
          <video
            src={src}
            className="w-full max-h-48 object-cover rounded border cursor-pointer"
            controls
            onClick={() => onPreview && onPreview(src, value.type)}
          />
          <button
            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700"
            onClick={handleRemove}
            type="button"
            style={{lineHeight:0}}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      {value && value.name && (
        <span className="truncate max-w-[120px] text-xs text-gray-500 mt-1">{value.name}</span>
      )}
    </div>
  );
};

export default FileInput;