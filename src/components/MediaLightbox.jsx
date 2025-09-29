// src/components/MediaLightbox.jsx
import { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

export default function MediaLightbox({
  open,
  onClose,
  slides,
  index = 0,
  onIndexChange,
  showCaptions = true,
  enableFullscreen = true,
}) {
  // Build plugins list based on props
  const plugins = useMemo(() => {
    const list = [Zoom, Thumbnails]; // always use Zoom + Thumbnails
    if (showCaptions) list.push(Captions);
    if (enableFullscreen) list.push(Fullscreen);
    return list;
  }, [showCaptions, enableFullscreen]);

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={index}
      on={{ view: ({ index }) => onIndexChange?.(index) }}
      plugins={plugins}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      animation={{ fade: 200, swipe: 300 }}
      carousel={{ finite: false, preload: 2 }}
      thumbnails={{ width: 96, height: 64, border: 2, borderRadius: 4 }}
      zoom={{
        maxZoomPixelRatio: 2.5,
        scrollToZoom: true,
        doubleClickZoom: 1.5,
      }}
    />
  );
}
