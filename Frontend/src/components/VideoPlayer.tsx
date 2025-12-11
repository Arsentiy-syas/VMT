// src/components/VideoPlayer.tsx
import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, thumbnailUrl, title }) => {
  return (
    <div style={styles.container}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <div style={styles.videoWrapper}>
        <video
          controls
          style={styles.video}
          poster={thumbnailUrl}
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Ваш браузер не поддерживает видео тег.
        </video>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '30px',
  } as React.CSSProperties,
  title: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '10px',
    color: '#333',
  } as React.CSSProperties,
  videoWrapper: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  } as React.CSSProperties,
};

export default VideoPlayer;