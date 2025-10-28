import { useState } from 'react';
import { FileInput } from '../index';
import MediaSelector from '../shared/MediaSelector';

const SmartSelectQuestionForm = ({
  questionDraft,
  setQuestionDraft,
  handleChoiceChange,
  handleChoiceMedia,
  setMediaModal,
  availableWords
}) => {
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(null);

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
      // Add video if available
      if (word.signVideo || word.video_url) {
        const videoSource = word.video_url || (word.signVideo && word.signVideo.url) || word.signVideo;
        // Handle File objects by creating object URLs
        const videoUrl = videoSource instanceof File ? URL.createObjectURL(videoSource) : videoSource;
        if (videoUrl) {
          availableMedia.push({
            word: word.word,
            url: videoUrl,
            type: 'video',
            isFile: videoSource instanceof File,
            source: videoSource // Keep reference to original File or URL
          });
        }
      }
    });
  }

  const handleSelectFromWordlist = (choiceIndex) => {
    setCurrentChoiceIndex(choiceIndex);
    setShowMediaSelector(true);
  };

  const handleMediaSelect = (selectedMedia) => {
    if (currentChoiceIndex !== null) {
      // If the source is a File object, pass it directly so it can be uploaded
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
      handleChoiceMedia(currentChoiceIndex, mediaObject);
    }
    setShowMediaSelector(false);
    setCurrentChoiceIndex(null);
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-sm md:text-base">Choices</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
        {questionDraft.choices.map((c, i) => (
          <div key={i} className="flex flex-col gap-2">
            <input
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 focus:border-[#4C53B4] text-sm md:text-base min-w-0"
              placeholder={`Choice ${i+1}`}
              value={c.text}
              onChange={e => handleChoiceChange(i, 'text', e.target.value)}
            />
            <FileInput 
              value={c.media} 
              onChange={file => handleChoiceMedia(i, file)} 
              onPreview={(src, type) => setMediaModal({ open: true, src, type })} 
              onSelectFromWordlist={() => handleSelectFromWordlist(i)}
              hasWordlistMedia={availableMedia.length > 0}
            />
          </div>
        ))}
      </div>

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <MediaSelector
          availableMedia={availableMedia}
          onSelect={handleMediaSelect}
          onClose={() => {
            setShowMediaSelector(false);
            setCurrentChoiceIndex(null);
          }}
        />
      )}

      {/* Correct Answer Dropdown */}
      <div className="mt-4">
        <label className="block mb-1 font-medium text-sm md:text-base">Correct Answer</label>
        <select
          className="w-full border-2 border-gray-100 rounded-xl px-3 md:px-4 py-2 focus:border-[#4C53B4] text-sm md:text-base"
          value={questionDraft.answer}
          onChange={e => setQuestionDraft(prev => ({ ...prev, answer: parseInt(e.target.value) }))}
        >
          <option value="">Select correct answer</option>
          {questionDraft.choices.map((c, i) => (
            <option key={i} value={i}>
              Choice {i + 1}: {c.text || (c.media ? 
                (c.media instanceof File ? c.media.name : 
                 c.media.url ? c.media.url.split('/').pop() : 
                 '(Media)') : '(Empty)')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SmartSelectQuestionForm;