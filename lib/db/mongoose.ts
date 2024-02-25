import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL!;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

// This function is responsible for connecting to the database
export const connectToDatabase = async () => {
  // If there is already a connection, return it
  if (cached.conn) {
    console.log('🚀 | cached.conn:', cached.conn);
    return cached.conn;
  }

  // If the MONGODB_URL is not provided, throw an error
  if (!MONGODB_URL) {
    console.log('missing MONGODB_URL:');
    throw new Error('Missing MONGODB_URL');
  }

  // If there is no pending promise to connect, create one and connect to the database
  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: 'imaginify',
      bufferCommands: false,
    });

  // Log the connection status
  console.log('Connecting to the database...');

  // Wait for the connection promise to resolve and assign the connection to the cached.conn variable
  cached.conn = await cached.promise;

  // Log the successful connection
  console.log('Connected to the database.');

  // Return the connection
  return cached.conn;
};
