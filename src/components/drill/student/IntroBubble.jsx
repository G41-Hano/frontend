import React from 'react';

const IntroBubble = ({ mascot, text, image, video }) => (
  <div className="w-full max-w-5xl mx-auto flex items-center justify-center animate-fadeIn" style={{ minHeight: 500, position: 'relative' }}>
    <div className="flex flex-col items-center justify-center mr-5">
      <img src={mascot} alt="Hippo Mascot" className="w-[34rem] h-[32rem] mb-5 mt-10" />
    </div>
    <div className="flex-1 flex flex-col items-start justify-center relative">
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '2rem',
          padding: '2rem 2.5rem',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#222',
          marginBottom: '2rem',
          maxWidth: '700px',
          minWidth: '320px',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          zIndex: 2,
          marginTop: !(image || video) ? '-20rem' : undefined,
          transition: 'margin-top 0.3s'
        }}
      >
        <span>{text}</span>
        {/* Arrow points left */}
        <div style={{
          position: 'absolute',
          left: '-16px',
          top: '70%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '18px solid transparent',
          borderBottom: '18px solid transparent',
          borderRight: '18px solid #fff',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))',
          zIndex: 1
        }}></div>
      </div>
      {(image || video) && (
        <div
          className="flex items-center justify-center bg-white rounded-2xl shadow-lg mt-2 mb-2"
          style={{
            minHeight: '18rem',
            minWidth: '18rem',
            maxWidth: '28rem',
            maxHeight: '22rem',
            width: '100%',
            alignSelf: 'center',
            padding: image && video ? '1rem 1rem 0.25rem 1rem' : '1rem'
          }}
        >
          {image && (
            <img
              src={(image.startsWith('http') || image.startsWith('/') || image.startsWith('./') || image.startsWith('../') || image.startsWith('data:') || image.startsWith('blob:') || image.includes('/assets/')) ? image : `http://127.0.0.1:8000${image}`}
              alt="Word"
              className="object-contain rounded-xl max-h-72 max-w-full mx-auto"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
          {video && (
            <video
              src={video.startsWith('http') ? video : `http://127.0.0.1:8000${video}`}
              controls
              className="rounded-xl max-h-72 max-w-full mx-auto"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </div>
      )}
    </div>
  </div>
);

export default IntroBubble;
