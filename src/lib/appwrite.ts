import { Client, Account, Databases } from 'appwrite';



const client = new Client();



// Log environment variables for debugging

console.log('Appwrite Config:', {

  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,

  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,

  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,

});



if (!import.meta.env.VITE_APPWRITE_PROJECT_ID || !import.meta.env.VITE_APPWRITE_DATABASE_ID) {

  throw new Error('Missing required Appwrite configuration');

}



client

    .setEndpoint('https://cloud.appwrite.io/v1')

    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);



export const account = new Account(client);

export const databases = new Databases(client);

export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;



// Function to create user document in database

export async function createUserDocument(userId: string, email: string, name: string) {

    try {

        // First, check if user document already exists

        try {

            await databases.getDocument(databaseId, 'users', userId);

            console.log('User document already exists');

            return;

        } catch (error) {

            // Document doesn't exist, proceed with creation

            console.log('Creating new user document');

        }



        const userDoc = await databases.createDocument(

            databaseId,

            'users',

            userId,

            {

                userId: userId,

                email: email,

                name: name,

                createdAt: new Date().toISOString(),

                preferences: {},

                status: 'active'

            }

        );

        

        console.log('User document created successfully:', userDoc);

        return userDoc;

    } catch (error) {

        console.error('Error in createUserDocument:', error);

        throw error;

    }

}



// Function to initialize required collections

export async function initializeCollections() {

    try {

        // Check if collections exist, create them if they don't

        try {

            await databases.listDocuments(databaseId, 'users');

        } catch (error) {

            console.log('Users collection needs to be created manually in Appwrite Console');

        }



        try {

            await databases.listDocuments(databaseId, 'conversations');

        } catch (error) {

            console.log('Conversations collection needs to be created manually in Appwrite Console');

        }

    } catch (error) {

        console.error('Error initializing collections:', error);

    }

}



// Call initialization on module load

initializeCollections().catch(console.error);



// Function to handle OAuth session

export async function handleOAuthSession(provider: string, success: string, failure: string) {

    try {

        const session = await account.createOAuth2Session(

            provider,

            success,

            failure,

            ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']

        );

        return session;

    } catch (error) {

        console.error('OAuth session error:', error);

        throw error;

    }

}



// Function to get user data

export async function getUserData(userId: string) {

    try {

        const userData = await databases.getDocument(

            databaseId,

            'users',

            userId

        );

        return userData;

    } catch (error) {

        console.error('Error fetching user data:', error);

        throw error;

    }

}



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






























