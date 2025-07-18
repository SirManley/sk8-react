// src/pages/trucks/TrucksHome.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TrucksHome() {
  const [truckItems, setTruckItems] = useState([]);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredItem, setFeaturedItem] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      const snap = await getDocs(collection(db, 'images'));
      const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const trucks = allItems.filter(item =>
        item.groups?.includes('Trucks')
      );

      const homepageImage =
        trucks.find(item => item.name === 'GK-wall1') || trucks[0];

      setFeaturedItem(homepageImage);
      setTruckItems(trucks);
    }
    fetchItems();
  }, []);

  useEffect(() => {
    let interval = null;
    if (slideshowActive && truckItems.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % truckItems.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, truckItems]);

  if (!featuredItem)
    return <p className="text-center">Loading featured truck collage…</p>;

  const imageToShow = slideshowActive
    ? truckItems[currentIndex]
    : featuredItem;

  const toggleSlideshow = () => {
    if (slideshowActive) {
      setSlideshowActive(false);
      setCurrentIndex(0);
    } else if (truckItems.length > 1) {
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
