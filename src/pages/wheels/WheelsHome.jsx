// src/pages/wheels/WheelsHome.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function WheelsHome() {
  const [wheelItems, setWheelItems] = useState([]);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredItem, setFeaturedItem] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      const snap = await getDocs(collection(db, 'images'));
      const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const wheels = allItems.filter(item =>
        item.groups?.includes('Wheels')
      );

      const homepageImage =
        wheels.find(item => item.name === 'Wheels-collage') || wheels[0];

      setFeaturedItem(homepageImage);
      setWheelItems(wheels);
    }
    fetchItems();
  }, []);

  useEffect(() => {
    let interval = null;
    if (slideshowActive && wheelItems.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % wheelItems.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, wheelItems]);

  if (!featuredItem) return <p>Loading featured wheel image…</p>;

  const imageToShow = slideshowActive
    ? wheelItems[currentIndex]
    : featuredItem;

  const toggleSlideshow = () => {
    if (slideshowActive) {
      setSlideshowActive(false);
      setCurrentIndex(0);
    } else if (wheelItems.length > 1) {
      setSlideshowActive(true);
    }
  };

  return (
    <div className="slideshow-container">
      <img
        src={imageToShow.thumbnailUrl || imageToShow.imageUrl}
        alt={imageToShow.name}
        className={
          slideshowActive ? 'slideshow-image' : 'featured-home-image'
        }
        onClick={toggleSlideshow}
      />
      <p className="slideshow-caption">
        {slideshowActive
          ? 'Slideshow running… (click image to stop)'
          : 'Click the image to start slideshow.'}
      </p>
    </div>
  );
}
