"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";

// Fix for default Leaflet marker icons missing in React
const iconUrl = (color: string) => 
  `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-${color}.png`;

const createIcon = (color: string) => new L.Icon({
  iconUrl: iconUrl(color),
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface StoreData {
  _id: string;
  name: string;
  address: string;
  category: string;
  currentCount: number;
  maxCapacity: number;
  lat: number;
  lng: number;
}

export default function MapView({ stores }: { stores: StoreData[] }) {
  // Default center (Pune) - You can make this dynamic later
  const center = { lat: 18.5204, lng: 73.8567 };

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner relative z-0">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stores.map((store) => {
          const occupancy = (store.currentCount / store.maxCapacity) * 100;
          
          // Determine Marker Color based on crowd
          let markerColor = "green";
          let statusText = "Low Crowd";
          
          if (occupancy > 50) { markerColor = "gold"; statusText = "Moderate"; }
          if (occupancy > 80) { markerColor = "red"; statusText = "High Traffic"; }

          return (
            <Marker 
              key={store._id} 
              position={[store.lat, store.lng]} 
              icon={createIcon(markerColor)}
            >
              <Popup className="min-w-[200px]">
                <div className="space-y-2 p-1">
                  <h3 className="font-bold text-lg text-slate-900">{store.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{store.category}</span>
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <Badge className={markerColor === 'green' ? 'bg-green-500' : markerColor === 'gold' ? 'bg-yellow-500' : 'bg-red-500'}>
                      {statusText}
                    </Badge>
                    <span className="font-bold text-slate-700 text-sm">{Math.round(occupancy)}% Full</span>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full mt-3 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`, '_blank')}
                  >
                    <Navigation className="w-3 h-3 mr-1" /> Get Directions
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
