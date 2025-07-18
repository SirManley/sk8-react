import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AccessoriesHome() {
  const [accessoryItems, setAccessoryItems] = useState([]);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredItem, setFeaturedItem] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      const snap = await getDocs(collection(db, 'images'));
      const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const accessories = allItems.filter(
        item => item.groups?.includes('Accessories')
      );

      const homepageImage = accessories.find(item => item.name === 'Rails1') || accessories[0];

      setFeaturedItem(homepageImage);
      setAccessoryItems(accessories);
    }
    fetchItems();
  }, []);

  useEffect(() => {
    let interval = null;
    if (slideshowActive && accessoryItems.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % accessoryItems.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, accessoryItems]);

  if (!featuredItem) {
    return <p className="text-center">Loading featured accessories collage…</p>;
  }

  const imageToShow = slideshowActive
    ? accessoryItems[currentIndex]
    : featuredItem;

  const toggleSlideshow = () => {
    if (slideshowActive) {
      setSlideshowActive(false);
      setCurrentIndex(0);
    } else if (accessoryItems.length > 1) {
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
