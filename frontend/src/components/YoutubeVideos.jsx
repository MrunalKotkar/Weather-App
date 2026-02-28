import { useState } from 'react';

export default function YoutubeVideos({ videos }) {
  const [activeVideo, setActiveVideo] = useState(null);

  const displayVideos = (videos || []).slice(0, 6);
  if (!displayVideos.length) return null;

  return (
    <div className="youtube-section">
      <h2 className="section-title">🎬 Location Videos</h2>

      {activeVideo && (
        <div className="yt-embed-wrapper">
          <iframe
            className="yt-embed"
            src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button className="btn btn-secondary yt-close" onClick={() => setActiveVideo(null)}>
            ✕ Close
          </button>
        </div>
      )}

      <div className="yt-grid">
        {displayVideos.map((v) => (
          <div key={v.videoId} className="yt-card" onClick={() => setActiveVideo(v.videoId)}>
            <div className="yt-thumb-wrapper">
              <img
                src={v.thumbnail}
                alt={v.title}
                className="yt-thumb"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/320x180?text=No+Preview'; }}
              />
              <span className="yt-play-btn">▶</span>
            </div>
            <div className="yt-info">
              <p className="yt-title" title={v.title}>{v.title}</p>
              <p className="yt-channel">{v.channelTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
