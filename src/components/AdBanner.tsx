import { useEffect } from 'react';
import pixelCottage from '@/assets/pixel-cottage.png';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <>
      {/* Pixel art cottage decoration - pinned to the bottom, behind the ad */}
      <img
        src={pixelCottage}
        alt="Pixel art cottage landscape"
        className="fixed inset-x-0 bottom-0 w-full pointer-events-none z-40"
        style={{
          imageRendering: 'pixelated',
          height: '160px',
          objectFit: 'cover',
          // The cottage pixels sit near the top of the PNG; show the top portion in this bottom strip
          objectPosition: 'top',
        }}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '728px', height: '90px' }}
            data-ad-client="ca-pub-4839522560085615"
            data-ad-slot="pub-4839522560085615"
          />
        </div>
      </div>
    </>
  );
};

export default AdBanner;
