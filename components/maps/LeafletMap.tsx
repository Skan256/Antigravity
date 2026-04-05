"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  period: string;
}

interface LeafletMapProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

declare let L: any;

export default function LeafletMap({ pins, center = [36.852, 10.323], zoom = 14, height = "500px" }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletLoaded = useRef(false);
  const mapInstance = useRef<any>(null);

  const initMap = () => {
    if (!mapRef.current || typeof L === 'undefined' || leafletLoaded.current) return;

    leafletLoaded.current = true;
    
    mapInstance.current = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    // Filter out pins without coordinates
    const validPins = pins.filter(p => p.lat && p.lng);

    validPins.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng]).addTo(mapInstance.current);
      
      const popupContent = `
        <div style="font-family: var(--font-primary); padding: 5px;">
          <h3 style="color: var(--color-accent-primary); margin: 0 0 5px 0;">${pin.title}</h3>
          <p style="color: var(--color-text-secondary); margin: 0 0 10px 0; font-size: 0.8rem;">${pin.period}</p>
          <a href="/artifacts/${pin.id}" style="
            background: var(--color-accent-primary); 
            color: white; 
            padding: 4px 10px; 
            border-radius: 4px; 
            text-decoration: none;
            font-size: 0.8rem;
            display: inline-block;
          ">View Details</a>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    if (validPins.length > 1) {
      const group = L.featureGroup(validPins.map(p => L.marker([p.lat, p.lng])));
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  useEffect(() => {
    if (typeof L !== 'undefined') {
      initMap();
    }
    
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        leafletLoaded.current = false;
      }
    };
  }, [pins]);

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <Script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        onLoad={initMap}
      />
      <div 
        ref={mapRef} 
        className="glass-panel"
        style={{ 
          height, 
          width: '100%', 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden',
          zIndex: 1,
          border: 'var(--border-glass)'
        }} 
      />
      
      <style jsx global>{`
        .leaflet-container {
          background: #1a1512 !important; /* Earth-tone dark background */
        }
        .leaflet-popup-content-wrapper {
          background: var(--color-bg-secondary) !important;
          color: var(--color-text-primary) !important;
          border: 1px solid rgba(224, 108, 67, 0.2);
          border-radius: var(--radius-sm);
        }
        .leaflet-popup-tip {
          background: var(--color-bg-secondary) !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background: var(--color-bg-secondary) !important;
          color: var(--color-accent-primary) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </>
  );
}
