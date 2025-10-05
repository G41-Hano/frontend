const MediaModal = ({ mediaModal, setMediaModal }) => {
  if (!mediaModal.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(246, 241, 241, 0.25)', backdropFilter: 'blur(8px)' }}
      onClick={() => setMediaModal({ open: false, src: '', type: '' })}
    >
      <button
        className="fixed top-6 right-8 z-50 flex items-center justify-center w-12 h-12 bg-white text-3xl text-red-500 rounded-full shadow-lg border-2 border-white hover:bg-red-100 hover:text-red-700 transition"
        style={{ cursor: 'pointer' }}
        onClick={e => { 
          e.stopPropagation(); 
          setMediaModal({ open: false, src: '', type: '' }); 
        }}
        aria-label="Close preview"
      >
        &times;
      </button>
      {mediaModal.type.startsWith('image/') ? (
        <img
          src={mediaModal.src}
          alt="media"
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
          onClick={e => e.stopPropagation()}
        />
      ) : mediaModal.type.startsWith('video/') ? (
        <video
          src={mediaModal.src}
          controls
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl bg-black/70"
          onClick={e => e.stopPropagation()}
        />
      ) : null}
    </div>
  );
};

export default MediaModal;