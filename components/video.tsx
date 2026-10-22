import { Play } from "lucide-react";
import { ClipPlayer, Photo } from "@/components/photo";
import { clipFor, sceneStock } from "@/lib/stock";
import { parseVideo } from "@/lib/video";
import { cn } from "@/lib/utils";

export function VideoPlayer({ url, poster, title, scene, className }: { url: string; poster?: string; title: string; scene: string; className?: string }) {
  const video = parseVideo(url);
  if (video.kind === "iframe") {
    return (
      <div className={cn("relative overflow-hidden bg-navy-deep", video.vertical ? "mx-auto aspect-[9/16] max-h-[640px] max-w-[360px]" : "aspect-video", className)}>
        <iframe src={video.src} title={title} className="absolute inset-0 h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </div>
    );
  }
  if (video.kind === "file") {
    return (
      <div className={cn("relative aspect-video overflow-hidden bg-navy-deep", className)}>
        <video className="h-full w-full object-cover" controls playsInline preload="metadata" poster={poster || undefined} title={title}>
          <source src={video.src} />
        </video>
      </div>
    );
  }
  if (video.kind === "link") {
    return (
      <a href={video.src} target="_blank" rel="noopener noreferrer" className={cn("group relative block aspect-video overflow-hidden", className)}>
        <Photo src={poster} stock={sceneStock(scene)} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" />
        <span className="absolute inset-0 grid place-items-center bg-navy/40">
          <span className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-bold text-navy shadow-soft transition group-hover:scale-105">
            <Play className="h-5 w-5 fill-current" aria-hidden /> Watch on {video.provider}
          </span>
        </span>
      </a>
    );
  }
  // No video of their own yet: show free stock footage for now.
  return <ClipPlayer clip={clipFor(scene)} title={title} className={className} />;
}
