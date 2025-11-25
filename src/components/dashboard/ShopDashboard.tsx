/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import AnalyticsChart from "@/components/AnalyticsChart";
import { 
  Loader2, CheckCircle, Pencil, Users, 
  TrendingUp, TrendingDown, AlertTriangle, 
  MapPin, Tag, Cpu, X, Navigation
} from "lucide-react";

export default function ShopDashboard() {
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [myStore, setMyStore] = useState<any>(null);
  const [stats, setStats] = useState<any>(null); 
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    category: "",
    maxCapacity: "",
    iotDeviceId: "",
    lat: 0,
    lng: 0
  });

  useEffect(() => {
    fetchStoreData();
  }, []);

  async function fetchStoreData() {
    try {
      const res = await fetch('/api/stores/mine'); 
      const data = await res.json();
      if (data.store) {
        setMyStore(data.store);
        setStats(data.stats);
        setFormData({
          name: data.store.name,
          address: data.store.address,
          category: data.store.category,
          maxCapacity: data.store.maxCapacity.toString(),
          iotDeviceId: data.store.iotDeviceId,
          lat: data.store.lat || 0,
          lng: data.store.lng || 0
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // --- FIXED GPS LOGIC (High Accuracy) ---
  const handleGetLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    // Options for high accuracy
    const options = {
      enableHighAccuracy: true, // Forces GPS/High precision
      timeout: 10000,           // Wait up to 10s for best signal
      maximumAge: 0             // Do not use cached positions
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 1. Capture Coordinates immediately
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));

        try {
          // 2. Reverse Geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            alert("Location found, but address text couldn't be determined. Please type details.");
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          alert("Failed to fetch address name. Please enter manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        // Better error handling
        let msg = "Unable to retrieve location.";
        if (error.code === 1) msg = "Permission denied. Please allow location access.";
        else if (error.code === 2) msg = "Position unavailable. GPS signal weak.";
        else if (error.code === 3) msg = "Timeout. Please try again in an open area.";
        
        alert(msg);
        setLocationLoading(false);
      },
      options // Pass the options here
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = isEditing ? '/api/stores/update' : '/api/stores/create';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchStoreData(); 
        setIsEditing(false);
      } else {
        alert("Failed to save details.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-green-600" /></div>;

  // --- VIEW 1: FORM ---
  if (!myStore || isEditing) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-50/50 p-4">
        <Card className="w-[600px] shadow-xl border-t-4 border-green-500">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-2xl text-green-800">{isEditing ? "Edit Store Details" : "Register Your Store"}</CardTitle>
                    <CardDescription>{isEditing ? "Update your store information below." : "Enter your store details to start tracking footfall."}</CardDescription>
                </div>
                {isEditing && (<Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}><X className="h-5 w-5 text-slate-400" /></Button>)}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Store Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Category</Label><Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required /></div>
              </div>
              
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex gap-2">
                    <Input 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder="Enter address manually"
                        required 
                        className="flex-1"
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGetLocation}
                        disabled={locationLoading}
                        className="border-green-200 hover:bg-green-50 text-green-700 whitespace-nowrap"
                        title="Use Current Location"
                    >
                        {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">Auto-Detect</span>
                    </Button>
                </div>
                {formData.lat !== 0 && (
                    <p className="text-[10px] text-slate-400">
                        GPS Captured: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                    </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Max Capacity</Label><Input value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: e.target.value})} required type="number" /></div>
                  <div className="space-y-2"><Label>Device ID</Label><Input value={formData.iotDeviceId} onChange={e => setFormData({...formData, iotDeviceId: e.target.value})} required disabled={isEditing} className="bg-slate-100 text-slate-500" /></div>
              </div>
              <div className={`pt-4 ${isEditing ? 'grid grid-cols-2 gap-4' : ''}`}>
                {isEditing && (<Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>)}
                <Button type="submit" className={`bg-green-600 hover:bg-green-700 text-white ${!isEditing ? 'w-full' : ''}`}>{loading ? <Loader2 className="animate-spin" /> : "Save Changes"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  const occupancyPct = Math.round((myStore.currentCount / myStore.maxCapacity) * 100);
  
  let statusColor = "text-green-600";
  let statusBg = "bg-green-100";
  let StatusIcon = CheckCircle;
  if (occupancyPct > 50) { statusColor = "text-yellow-600"; statusBg = "bg-yellow-100"; StatusIcon = TrendingUp; }
  if (occupancyPct > 80) { statusColor = "text-red-600"; statusBg = "bg-red-100"; StatusIcon = AlertTriangle; }

  const growth = stats?.growth || 0;
  const isPositiveGrowth = growth >= 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
         <div>
           <h1 className="text-4xl font-bold text-green-900 tracking-tight">{myStore.name}</h1>
           <div className="flex items-center gap-2 text-slate-500 mt-1">
             <MapPin className="h-4 w-4" /> <span>{myStore.address}</span>
             <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">{myStore.category}</Badge>
           </div>
         </div>
         <Button onClick={() => setIsEditing(true)} variant="outline" className="border-green-200 hover:bg-green-50 text-green-700">
           <Pencil className="h-4 w-4 mr-2" /> Edit Details
         </Button>
       </div>

       <div className="grid gap-6 md:grid-cols-3">
         
         {/* 1. Current Occupancy */}
         <Card className={`border-l-4 shadow-sm ${occupancyPct > 80 ? 'border-l-red-500' : 'border-l-green-500'}`}>
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 uppercase">Current Occupancy</CardTitle></CardHeader>
           <CardContent>
             <div className="flex items-center justify-between">
               <div className="text-4xl font-bold text-slate-900">{myStore.currentCount} <span className="text-lg text-slate-400 font-normal">/ {myStore.maxCapacity}</span></div>
               <div className={`p-2 rounded-full ${statusBg}`}><StatusIcon className={`h-6 w-6 ${statusColor}`} /></div>
             </div>
             <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-500 ${occupancyPct > 80 ? 'bg-red-500' : occupancyPct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(occupancyPct, 100)}%` }} />
             </div>
           </CardContent>
         </Card>

         {/* 2. Total Visits (DYNAMIC) */}
         <Card className="border-l-4 border-l-blue-500 shadow-sm">
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 uppercase">Total Visits (Today)</CardTitle></CardHeader>
           <CardContent>
             <div className="flex items-center justify-between">
               <div className="text-4xl font-bold text-slate-900">{myStore.todayVisits}</div>
               <div className="p-2 rounded-full bg-blue-50"><Users className="h-6 w-6 text-blue-600" /></div>
             </div>
             <div className={`flex items-center mt-2 text-xs font-bold ${isPositiveGrowth ? 'text-green-600' : 'text-red-500'}`}>
               {isPositiveGrowth ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
               <span>{growth > 0 ? '+' : ''}{growth}% from yesterday</span>
             </div>
           </CardContent>
         </Card>

         {/* 3. System Status (DYNAMIC) */}
         <Card className={`border-l-4 shadow-sm ${stats?.status === "Critical" ? 'border-l-red-500 bg-red-50' : 'border-l-green-500'}`}>
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 uppercase">System Status</CardTitle></CardHeader>
           <CardContent>
             <div className="flex items-center justify-between">
               <div className="text-2xl font-bold text-slate-900">{stats?.status || "Unknown"}</div>
               {stats?.status === "Critical" || stats?.status === "Warning" ? (
                 <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
               ) : (
                 <CheckCircle className="h-8 w-8 text-green-500" />
               )}
             </div>
             <p className="text-xs text-slate-500 mt-2">{stats?.message}</p>
           </CardContent>
         </Card>
       </div>

       <div className="grid gap-6 md:grid-cols-3">
         <Card className="md:col-span-1 shadow-md border-green-100">
            <CardHeader className="bg-green-50/50 pb-4"><CardTitle className="text-green-900">Store Details</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500 flex items-center"><Tag className="w-4 h-4 mr-2"/> Category</span><span className="font-medium">{myStore.category}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500 flex items-center"><Cpu className="w-4 h-4 mr-2"/> Device ID</span><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{myStore.iotDeviceId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 flex items-center"><MapPin className="w-4 h-4 mr-2"/> Address</span><span className="font-medium text-right text-sm w-1/2">{myStore.address}</span></div>
            </CardContent>
         </Card>
         <Card className="md:col-span-2 shadow-md border-slate-200">
           <CardHeader>
             <CardTitle>Footfall Analytics</CardTitle>
             <CardDescription>Hourly visitor trends for today.</CardDescription>
           </CardHeader>
           <CardContent className="pl-0"> 
             <div className="pr-4">
                <AnalyticsChart /> 
             </div>
           </CardContent>
        </Card>
       </div>
    </div>
  );
}