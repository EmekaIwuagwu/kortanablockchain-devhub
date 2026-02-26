import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
    connectTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000,  // 45 seconds
    serverSelectionTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
    // If MONGODB_URI is not set, throw a clear error immediately
    console.error('❌ MONGODB_URI is not set in environment variables!');
    console.error('Please create a .env.local file with MONGODB_URI=mongodb://localhost:27017/kortana_presale');
    
    clientPromise = Promise.reject(
        new Error('MONGODB_URI environment variable is not set. Please configure .env.local file.')
    );
} else {
    if (process.env.NODE_ENV === 'development') {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            console.log('🔌 Connecting to MongoDB (Dev)...');
            client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect()
                .then((client) => {
                    console.log('✅ MongoDB connected successfully');
                    return client;
                })
                .catch((error) => {
                    console.error('❌ MongoDB connection failed:', error.message);
                    throw error;
                });
        }
        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        console.log('🔌 Connecting to MongoDB (Prod)...');
        client = new MongoClient(uri, options);
        clientPromise = client.connect()
            .then((client) => {
                console.log('✅ MongoDB connected successfully');
                return client;
            })
            .catch((error) => {
                console.error('❌ MongoDB connection failed:', error.message);
                throw error;
            });
    }
}

export default clientPromise;
