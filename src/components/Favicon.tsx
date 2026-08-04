import { Helmet } from '@dr.pogodin/react-helmet';
import { useMemo } from 'react';
import { emojiToFaviconUrl, isEmoji } from '../libs/icon';

interface FaviconProps {
  icon: string;
}

/**
 * Renders a favicon link element, supporting both image URLs and emojis.
 * Emojis are converted to SVG data URLs.
 */
export function Favicon({ icon }: FaviconProps) {
  const { url, type } = useMemo(() => {
    if (isEmoji(icon)) {
      return { url: emojiToFaviconUrl(icon), type: 'image/svg+xml' };
    }
    // Determine type from URL extension
    const extension = icon.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      svg: 'image/svg+xml',
      png: 'image/png',
      ico: 'image/x-icon',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return { url: icon, type: mimeTypes[extension ?? ''] ?? 'image/x-icon' };
  }, [icon]);

  return (
    <Helmet>
      <link rel="icon" type={type} href={url} />
    </Helmet>
  );
}
