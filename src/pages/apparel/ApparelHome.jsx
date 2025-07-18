import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ApparelHome() {
  const [apparelItems, setApparelItems] = useState([]);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredItem, setFeaturedItem] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      const snap = await getDocs(collection(db, 'images'));
      const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const apparel = allItems.filter(
        item => item.groups?.includes('Apparel')
      );

      const homepageImage = apparel.find(item => item.name === 'Shirt Rack') || apparel[0];

      setFeaturedItem(homepageImage);
      setApparelItems(apparel);
    }
    fetchItems();
  }, []);

  useEffect(() => {
    let interval = null;
    if (slideshowActive && apparelItems.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % apparelItems.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, apparelItems]);

  if (!featuredItem) {
    return <p className="text-center">Loading featured apparel collage…</p>;
  }

  const imageToShow = slideshowActive
    ? apparelItems[currentIndex]
    : featuredItem;

  const toggleSlideshow = () => {
    if (slideshowActive) {
      setSlideshowActive(false);
      setCurrentIndex(0); // Reset to featured image
    } else if (apparelItems.length > 1) {
      setSlideshowActive(true);
    }
  };

  return (
    <div className="slideshow-container">
      <button onClick={toggleSlideshow}>
        <img
          src={imageToShow.thumbnailUrl || imageToShow.imageUrl}
          alt={imageToShow.name}
          className={slideshowActive ? 'slideshow-image' : 'featured-home-image'}
        />
      </button>
      <p className="slideshow-caption">
        {slideshowActive
          ? 'Slideshow running… (click image to stop)'
          : 'Click the image to start slideshow.'}
      </p>
    </div>
  );
}

