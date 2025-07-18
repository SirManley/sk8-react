// src/pages/memorabilia/MemorabiliaHome.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function MemorabiliaHome() {
  const [memorabiliaItems, setMemorabiliaItems] = useState([]);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredItem, setFeaturedItem] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      const snap = await getDocs(collection(db, 'images'));
      const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const memorabilia = allItems.filter(item =>
        item.groups?.includes('Memorabilia')
      );

      const homepageImage =
        memorabilia.find(item => item.name === 'Memm') || memorabilia[0];

      setFeaturedItem(homepageImage);
      setMemorabiliaItems(memorabilia);
    }
    fetchItems();
  }, []);

  useEffect(() => {
    let interval = null;
    if (slideshowActive && memorabiliaItems.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % memorabiliaItems.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, memorabiliaItems]);

  if (!featuredItem) return <p>Loading featured memorabilia image…</p>;

  const imageToShow = slideshowActive
    ? memorabiliaItems[currentIndex]
    : featuredItem;

  const toggleSlideshow = () => {
    if (slideshowActive) {
      setSlideshowActive(false);
      setCurrentIndex(0);
    } else if (memorabiliaItems.length > 1) {
      setSlideshowActive(true);
    }
  };

  const getCleanYoutubeUrl = (rawUrl) => {
    if (!rawUrl) return null;
    const match = rawUrl.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : null;
  };

  const cleanYoutubeUrl = getCleanYoutubeUrl(imageToShow.youtubeUrl);

  return (
    <div className="slideshow-container text-center">
      <img
        src={imageToShow.thumbnailUrl || imageToShow.imageUrl}
        alt={imageToShow.name}
        className={
          slideshowActive ? 'slideshow-image' : 'featured-home-image'
        }
        onClick={toggleSlideshow}
        style={{ cursor: 'pointer' }}
      />

      {cleanYoutubeUrl && (
        <div className="mt-2">
          <a
            href={cleanYoutubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700"
          >
            ▶ Watch Video
          </a>
        </div>
      )}

      <p className="slideshow-caption">
        {slideshowActive
          ? 'Slideshow running… (click image to stop)'
          : 'Click the image to start slideshow.'}
      </p>
    </div>
  );
}

