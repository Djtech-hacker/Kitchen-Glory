import { useState } from 'react';
import { Play, Youtube, Link as LinkIcon } from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl, isDirectVideoUrl } from '@/lib/videoUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VideoEmbedProps {
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  title: string;
  thumbnail?: string;
}

export function VideoEmbed({ videoUrl, youtubeUrl, title, thumbnail }: VideoEmbedProps) {
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  // Priority: Direct video > YouTube URL > Custom input
  const hasDirectVideo = videoUrl && isDirectVideoUrl(videoUrl);
  const youtubeId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;

  const handleCustomEmbed = () => {
    const id = extractYouTubeId(customYoutubeUrl);
    if (id) {
      setEmbedUrl(getYouTubeEmbedUrl(id));
      setShowCustomInput(false);
    }
  };

  // Render direct video player
  if (hasDirectVideo) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <video
          controls
          poster={thumbnail}
          className="w-full h-full"
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Render YouTube embed
  if (youtubeId) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={getYouTubeEmbedUrl(youtubeId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Render custom embed
  if (embedUrl) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
        <button
          onClick={() => setEmbedUrl(null)}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full text-sm transition-colors"
        >
          Clear
        </button>
      </div>
    );
  }

  // Fallback: Show placeholder with custom input option
  return (
    <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover opacity-50"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-16 h-16 text-muted-foreground" />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/30">
        {!showCustomInput ? (
          <div className="text-center space-y-4">
            <p className="text-white font-medium">No video available</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCustomInput(true)}
                className="gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Embed YouTube Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.open(
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' recipe')}`,
                    '_blank'
                  );
                }}
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Youtube className="w-4 h-4" />
                Search on YouTube
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-3 bg-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Paste a YouTube link to embed the video
            </p>
            <div className="flex gap-2">
              <Input
                value={customYoutubeUrl}
                onChange={(e) => setCustomYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1"
              />
              <Button onClick={handleCustomEmbed}>
                Embed
              </Button>
            </div>
            <button
              onClick={() => setShowCustomInput(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}