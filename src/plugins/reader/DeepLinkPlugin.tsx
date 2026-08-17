import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

/**
 * Handles direct/deep links without loading the full catalog first.
 *
 * Supported URLs:
 *   /read/:novelId/:chapterId?p=12
 *   /novel/:novelId
 *
 * It reuses AppContext's lazy loaders, so a reader deep link fetches
 * only the selected novel/chapter (plus that chapter's comments).
 */
export const DeepLinkPlugin: React.FC = () => {
  const { openReader, openNovelDetail } = useApp();
  const openReaderRef = useRef(openReader);
  const openNovelDetailRef = useRef(openNovelDetail);

  useEffect(() => {
    openReaderRef.current = openReader;
    openNovelDetailRef.current = openNovelDetail;
  }, [openReader, openNovelDetail]);

  useEffect(() => {
    const resolvePath = () => {
      const parts = window.location.pathname
        .split('/')
        .filter(Boolean)
        .map(decodeURIComponent);

      if (parts[0] === 'read' && parts[1]) {
        const paragraphParam = new URLSearchParams(window.location.search).get('p');
        const paragraph =
          paragraphParam === null || paragraphParam === ''
            ? undefined
            : Number(paragraphParam);

        openReaderRef.current(
          parts[1],
          parts[2],
          Number.isFinite(paragraph) ? paragraph : undefined,
        );
        return;
      }

      if (parts[0] === 'novel' && parts[1]) {
        openNovelDetailRef.current(parts[1]);
      }
    };

    resolvePath();
    window.addEventListener('popstate', resolvePath);
    return () => window.removeEventListener('popstate', resolvePath);
  }, []);

  return null;
};

export default DeepLinkPlugin;
