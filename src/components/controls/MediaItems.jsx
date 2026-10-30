import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Renders the content list of an event bar (multimídia / sociograma).
 * Each item has a `tipo`:
 *   { "tipo": "texto",  "titulo": "...", "conteudo": "markdown" }
 *   { "tipo": "imagem", "src": "midia/e1/foto.jpg", "legenda": "..." }
 *   { "tipo": "video",  "src": "midia/e1/video.mp4" or YouTube/Vimeo URL, "legenda": "..." }
 *   { "tipo": "audio",  "src": "midia/e1/audio.mp3", "legenda": "..." }
 *   { "tipo": "link",   "url": "https://...", "texto": "..." }
 */

export function hasItems(items) {
  return Array.isArray(items) && items.length > 0;
}

function embedUrl(src) {
  const youtube = src.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
  const vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function Caption({ text }) {
  return text ? <figcaption>{text}</figcaption> : null;
}

function MediaItem({ item }) {
  switch (item.tipo) {
    case "texto":
      return (
        <div className="media-item media-text">
          {item.titulo && <h3>{item.titulo}</h3>}
          {item.conteudo && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(item.conteudo)),
              }}
            />
          )}
        </div>
      );
    case "imagem":
      return (
        <figure className="media-item media-image">
          <img src={item.src} alt={item.legenda || ""} />
          <Caption text={item.legenda} />
        </figure>
      );
    case "video": {
      const embed = embedUrl(item.src || "");
      return (
        <figure className="media-item media-video">
          {embed ? (
            <iframe
              src={embed}
              title={item.legenda || item.src}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={item.src} controls preload="metadata" />
          )}
          <Caption text={item.legenda} />
        </figure>
      );
    }
    case "audio":
      return (
        <figure className="media-item media-audio">
          <audio src={item.src} controls preload="metadata" />
          <Caption text={item.legenda} />
        </figure>
      );
    case "link":
      return (
        <div className="media-item media-link">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.texto || item.url}
          </a>
        </div>
      );
    default:
      console.warn(`Tipo de conteúdo desconhecido: "${item.tipo}"`, item);
      return null;
  }
}

// `heading` (the event code) is shown when several events are selected
const MediaItems = ({ items, heading }) => {
  if (!hasItems(items)) return null;
  return (
    <div className="media-items">
      {heading && <h4 className="media-items-heading">{heading}</h4>}
      {items.map((item, idx) => (
        <MediaItem key={idx} item={item} />
      ))}
    </div>
  );
};

export default MediaItems;
