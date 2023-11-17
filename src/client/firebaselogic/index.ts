import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * This object is creaed by webpack's DefinePlugin
 */
declare const CLIENT_CONFIG_OBJECT: {
    mode: 'development' | 'production'
    apiKey: string
    projectId: string,
    authDomain: string,
    appId: string,
    authEmulatorHost: string,
    authEmulatorPort: number,
    firestoreHost: string,
    firestorePort: number
}
const config = CLIENT_CONFIG_OBJECT;

const app = initializeApp({
    apiKey: config.apiKey,
    projectId: config.projectId,
    authDomain: config.authDomain,
    appId: config.appId
});

const auth = getAuth(app);
const db = getFirestore(app);
const signOut = () => firebaseSignOut(auth);

// connect to emulators if the build is in the development mode
if (config.mode === 'development') {
    const authEmulatorURL = `http://${config.authEmulatorHost}:${config.authEmulatorPort}`;
    connectAuthEmulator(auth, authEmulatorURL);
    connectFirestoreEmulator(db, config.firestoreHost, config.firestorePort);
}

export {
    auth,
    db,
    signOut
}