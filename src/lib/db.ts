import mongoose from 'mongoose';

// 1. Get the Connection String from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// 2. Define the Interface for the global cache
// This prevents TypeScript errors when accessing global.mongoose
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// 3. Initialize the cache
// Logic: If 'global.mongoose' exists (hot reload), use it. If not, create it.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // A. If we already have a connection, use it.
  if (cached.conn) {
    return cached.conn;
  }

  // B. If we don't have a promise (connection starting), create one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  // C. Await the promise to get the actual connection
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
