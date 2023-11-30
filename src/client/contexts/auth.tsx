/**
 * Keeps track of current auth state and makes the firebase auth's user object available to the app through context
 * auth state and the user object is updated when the user logs in and out
 */

import { useState, createContext, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth'

import { auth } from '../firebaselogic';

export interface AuthContextValues {
    user: User | null
    setUser: (user: User | null) => void
}

// interface describing auth data used for demo mode
interface DemoInfo {
    email: string
}

interface AuthStateType {
    demoMode: DemoInfo | null  // indicates if the app is in demo mode
    setDemoMode(set: DemoInfo | null): void
    authStateCheckedOnLoad: boolean  // inidicates if the auth state was set after the initial page load
    user: User | null  // firebases's user object. can be only accessed after the user logs in
}

export const authStateContext = createContext<AuthStateType>({
    demoMode: null,
    setDemoMode: () => {},
    authStateCheckedOnLoad: false,  // indidicates if the auth state was checked on app load
    user: null
});

export const AuthStateProvider = (props: { children: ReactNode }) => {
    const [demoMode, setDemoMode] = useState<DemoInfo | null>(null);
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [initialAuthStateSet, setInitialAuthStateSet] = useState<boolean>(false);

    // add a listener to auth state change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (initialAuthStateSet == false) {
                setInitialAuthStateSet(true);  // inidiate that the auth state was checked for the first time after the app loaded
            }
        });
        return () => unsubscribe();
    }, []);

    return (<authStateContext.Provider value={{
        demoMode,
        setDemoMode,
        authStateCheckedOnLoad: initialAuthStateSet,
        user
    }}>
        {props.children}
    </authStateContext.Provider>
    );
}

export const createAuthState = (): AuthContextValues => {
    const [user, setUser] = useState<User | null>(auth.currentUser);

    // add a listener to auth state change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    return {
        user,
        setUser
    }
}