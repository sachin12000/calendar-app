/**
 * Context used to share useful utility functions
 * notifications utility allows the any component in the app to push notifications to the notification queue
 * isLoading flag can be set by any component to enable load state which causes a spinner to be displayed
 */
import { createContext, useState, ReactNode, useCallback } from "react";

import { useSubscribable } from "../hooks";

import { NotificationQueueFunctions, NotificationType } from "../types";

export interface UtilityType {
    notifications: NotificationQueueFunctions
    handleError: (error: any) => void  // handles error messages and creates a push notification for the error if possible
    isLoading: boolean // indicates if the app is in the loading state
    setIsLoading: (isLoading: boolean) => void  // sets or clears the loading state
}

export const UtilityFunctions = createContext<UtilityType>({} as UtilityType);

export const createUtilityState = (): UtilityType => {
    const notifications = useSubscribable<NotificationType>();

    const handleError = useCallback((error: any) => {
        if (typeof error === 'string')
            notifications.push({ text: error, severity: 'error' });
        else if (error && error.message)
            notifications.push({ text: error.message, severity: 'error' });
        else
            notifications.push({ text: "Error Occurred", severity: 'error' });
    }, [notifications]);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    return {
        notifications,
        handleError,
        isLoading,
        setIsLoading
    }
}