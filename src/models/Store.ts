import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStore extends Document {
  adminUserId: string;
  name: string;
  address: string;
  category: string;
  maxCapacity: number;
  currentCount: number;
  
  // --- ANALYTICS FIELDS ---
  todayVisits: number;      
  yesterdayVisits: number;  
  lastResetDate: Date;      // <--- ADDED THIS (Fixes the API error)
  // ------------------------

  iotDeviceId: string;
  
  // --- MAP FIELDS ---
  lat: number;
  lng: number;
}

const StoreSchema: Schema = new Schema({
  adminUserId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, required: true },
  maxCapacity: { type: Number, required: true },
  currentCount: { type: Number, default: 0 },
  
  // --- ANALYTICS DEFINITIONS ---
  todayVisits: { type: Number, default: 0 }, 
  yesterdayVisits: { type: Number, default: 0 },
  lastResetDate: { type: Date, default: Date.now }, // <--- ADDED THIS
  // ----------------------------

  iotDeviceId: { type: String, required: true, unique: true },

  // --- MAP DEFINITIONS ---
  lat: { type: Number, default: 18.5204 }, 
  lng: { type: Number, default: 73.8567 },
}, { timestamps: true });

const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);

export default Store;