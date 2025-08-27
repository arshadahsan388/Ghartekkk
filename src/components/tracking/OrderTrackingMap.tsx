'use client';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { Bike } from 'lucide-react';

const homePosition = { lat: 31.5204, lng: 74.3587 }; // Lahore
const restaurantPosition = { lat: 31.5315, lng: 74.3485 };

const routeCoordinates = [
  { lat: 31.5315, lng: 74.3485 },
  { lat: 31.5300, lng: 74.3500 },
  { lat: 31.5280, lng: 74.3520 },
  { lat: 31.5260, lng: 74.3540 },
  { lat: 31.5240, lng: 74.3560 },
  { lat: 31.5220, lng: 74.3580 },
  { lat: 31.5204, lng: 74.3587 },
];

type PolylineProps = google.maps.PolylineOptions;

const Polyline = (props: PolylineProps) => {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    if (polyline) {
      polyline.setMap(null);
    }
    const newPolyline = new google.maps.Polyline(props);
    newPolyline.setMap(map);
    setPolyline(newPolyline);

    return () => {
      newPolyline.setMap(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, props]);

  return null;
}


type OrderTrackingMapProps = {
  apiKey: string;
};

export default function OrderTrackingMap({ apiKey }: OrderTrackingMapProps) {
  const [riderPosition, setRiderPosition] = useState(routeCoordinates[0]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prevStep => {
        if (prevStep < routeCoordinates.length - 1) {
          const nextStep = prevStep + 1;
          setRiderPosition(routeCoordinates[nextStep]);
          return nextStep;
        }
        clearInterval(interval);
        return prevStep;
      });
    }, 5000); // Move every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={'pak-delivers-map'}
        defaultCenter={homePosition}
        defaultZoom={14}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="w-full h-full"
      >
        <Polyline path={routeCoordinates} strokeColor="#F4C430" strokeOpacity={0.8} strokeWeight={5} />
        
        <AdvancedMarker position={restaurantPosition} title={'Restaurant'}>
          <div className="w-8 h-8 rounded-full bg-secondary border-2 border-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><path d="M9 10H7.5a1.5 1.5 0 0 0 0 3H9"/><path d="M15 10h1.5a1.5 1.5 0 0 1 0 3H15"/></svg>
          </div>
        </AdvancedMarker>
        
        <AdvancedMarker position={homePosition} title={'Your Location'}>
          <div className="w-8 h-8 rounded-full bg-secondary border-2 border-accent flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </AdvancedMarker>

        <AdvancedMarker position={riderPosition} title={'Rider'}>
          <div className="w-10 h-10 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center transition-all duration-1000 ease-linear">
            <Bike className="w-6 h-6 text-primary-foreground" />
          </div>
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}
