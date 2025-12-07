import React from 'react';

const IntroBubble = ({ mascot, text, image, video }) => {
  const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isSmallScreen) {
    // Mobile layout: vertical stack with mascot on top, bubble below
    return (
      <div className="w-full flex flex-col items-center justify-center animate-fadeIn px-4 py-4" style={{ minHeight: 'auto' }}>
        {/* Mascot */}
        <div className="flex flex-col items-center justify-center mb-4">
          <img src={mascot} alt="Hippo Mascot" className="w-32 h-32 object-contain" />
        </div>

        {/* Bubble with arrow pointing up */}
        <div className="w-full max-w-sm">
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: '1.5rem',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#222',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 2,
              transition: 'margin-top 0.3s'
            }}
          >
            <span>{text}</span>
            {/* Arrow points up */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '12px solid #fff',
              filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.10))',
              zIndex: 1
            }}></div>
          </div>

          {/* Image or Video */}
          {(image || video) && (
            <div
              className="flex items-center justify-center bg-white rounded-2xl shadow-lg mt-4 mx-auto"
              style={{
                minHeight: '12rem',
                maxHeight: '16rem',
                width: '100%',
                padding: image && video ? '0.75rem 0.75rem 0.25rem 0.75rem' : '0.75rem'
              }}
            >
              {image && (
                <img
                  src={(image.startsWith('http') || image.startsWith('/') || image.startsWith('./') || image.startsWith('../') || image.startsWith('data:') || image.startsWith('blob:') || image.includes('/assets/')) ? image : `http://127.0.0.1:8000${image}`}
                  alt="Word"
                  className="object-contain rounded-xl max-h-56 max-w-full mx-auto"
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
              {video && (
                <video
                  src={video.startsWith('http') ? video : `http://127.0.0.1:8000${video}`}
                  controls
                  className="rounded-xl max-h-56 max-w-full mx-auto"
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout: horizontal with mascot on left, bubble on right
  return (
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
};

export default IntroBubble;
