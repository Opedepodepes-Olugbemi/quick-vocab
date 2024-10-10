import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const historyDatabaseId = import.meta.env.VITE_APPWRITE_HISTORY_DATABASE;
export const historyCollectionId = import.meta.env.VITE_APPWRITE_HISTORY_COLLECTION;

export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID;