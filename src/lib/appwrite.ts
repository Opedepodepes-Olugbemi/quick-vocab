import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Function to get or create user-specific collection
export async function getUserCollection(userId: string) {
    try {
        const collectionId = `conversations_${userId}`;
        
        try {
            // Try to list documents to check if collection exists
            await databases.listDocuments(databaseId, collectionId);
            return collectionId;
        } catch (error) {
            // Collection doesn't exist, create it manually
            console.log('Collection does not exist. Please create it manually in Appwrite Console with ID:', collectionId);
            
            // Return the collection ID anyway
            return collectionId;
        }
    } catch (error) {
        console.error('Error setting up user collection:', error);
        throw error;
    }
}














