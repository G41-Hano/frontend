import { useState } from 'react';
import MediaSelector from './MediaSelector';

const FileInput = ({ 
  value, 
  onChange, 
  onPreview, 
  drill, 
  builtinWords, 
  showMediaSelector = false 
}) => {
  const isFile = value instanceof File;
  const src = isFile ? URL.createObjectURL(value) : (value && value.url ? value.url : '');
  const [inputKey, setInputKey] = useState(0);
  
  // Debug logging
  console.log('FileInput value:', value);
  console.log('FileInput src:', src);
  console.log('FileInput isFile:', isFile);
  
  const handleRemove = () => {
    onChange(null);
    setInputKey(k => k + 1);
  };
  
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="cursor-pointer px-3 py-1 bg-[#EEF1F5] rounded-lg border border-gray-200 text-sm text-[#4C53B4] hover:bg-[#e6e9ff]">
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
        
        {showMediaSelector && (
          <MediaSelector
            drill={drill}
            builtinWords={builtinWords}
            onMediaSelect={onChange}
            buttonClassName="cursor-pointer px-3 py-1 bg-[#4C53B4] text-white rounded-lg border border-[#4C53B4] text-sm hover:bg-[#3a4095]"
          />
        )}
      </div>
      {(() => {
        console.log('Image preview check:', { 
          src: !!src, 
          value: !!value, 
          valueType: value?.type, 
          isImage: value?.type?.startsWith('image/'),
          fullCondition: src && value && value.type && value.type.startsWith('image/')
        });
        return src && value && value.type && value.type.startsWith('image/');
      })() && (
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
      {(() => {
        console.log('Video preview check:', { 
          src: !!src, 
          value: !!value, 
          valueType: value?.type, 
          isVideo: value?.type?.startsWith('video/'),
          fullCondition: src && value && value.type && value.type.startsWith('video/')
        });
        return src && value && value.type && value.type.startsWith('video/');
      })() && (
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