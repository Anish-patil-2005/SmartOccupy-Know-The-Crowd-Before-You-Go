"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, MapPin, Loader2, 
  Filter, Navigation,
  LayoutList, Map as MapIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import MapView dynamically
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 rounded-xl border-2 border-dashed border-slate-200">
      <MapIcon className="h-10 w-10 mb-2 opacity-20" />
      <p>Loading Interactive Map...</p>
    </div>
  )
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

export default function CustomerDashboard() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/stores');
        const data = await res.json();
        if (data.stores) setStores(data.stores);
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const uniqueLocations = Array.from(new Set(stores.map(s => s.address)));

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.category.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === "all" || store.address === locationFilter;
    return matchesSearch && matchesLocation;
  });

  // --- SMART NAVIGATION: Use Address Text ---
  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    // Opens Google Maps Search with the specific address
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in">
      {/* Header & Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-900 tracking-tight">Mall Directory</h1>
          <p className="text-slate-500 mt-1">Live crowd updates to help you shop safely.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search stores..."
              className="pl-9 border-green-200 bg-white focus-visible:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-green-300">
              <div className="flex items-center text-slate-600">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Location" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" /></div>}

      {!loading && (
        <Tabs defaultValue="list" className="w-full">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">{filteredStores.length} Stores Found</h2>
            
            {/* Tabs Styling matching Admin Panel */}
            <TabsList className="grid w-[200px] grid-cols-2 bg-white border border-slate-200">
              <TabsTrigger value="list" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                <LayoutList className="w-4 h-4 mr-2"/> List
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                <MapIcon className="w-4 h-4 mr-2"/> Map
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: LIST VIEW */}
          <TabsContent value="list" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStores.map((store) => {
                const occupancy = Math.round((store.currentCount / store.maxCapacity) * 100);
                
                // Visual Status Logic
                let statusColor = "bg-green-500";
                let statusText = "Low Traffic";
                let cardBorder = "border-l-green-500";

                if (occupancy > 50) { 
                  statusColor = "bg-yellow-500"; 
                  statusText = "Moderate"; 
                  cardBorder = "border-l-yellow-500"; 
                }
                if (occupancy > 80) { 
                  statusColor = "bg-red-500"; 
                  statusText = "High Traffic"; 
                  cardBorder = "border-l-red-500"; 
                }

                return (
                  <Card key={store._id} className={`hover:shadow-xl transition-all duration-300 border-l-4 ${cardBorder} group`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                            {store.name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-600 font-normal">
                            {store.category}
                          </Badge>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${statusColor} shadow-sm`}>
                          {statusText}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Occupancy</span>
                          <span className="font-bold text-slate-700">{occupancy}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${statusColor} transition-all duration-1000 ease-out`} 
                            style={{ width: `${Math.min(occupancy, 100)}%` }} 
                          />
                        </div>
                        <p className="text-xs text-right text-slate-400 mt-1">
                          ~ {store.maxCapacity - store.currentCount} spots left
                        </p>
                      </div>

                      <div className="flex items-start text-sm text-slate-500">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-400 shrink-0" />
                        {store.address}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 group"
                        onClick={() => handleNavigate(store.address)}
                      >
                        <Navigation className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                        Navigate
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: MAP VIEW */}
          <TabsContent value="map" className="mt-0">
             <MapView stores={filteredStores} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}