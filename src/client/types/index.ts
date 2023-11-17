/**
 * Types that are only used in the front end
 */

import { SubscribableClientFunctionsType } from "../hooks/useSubscribable"

export interface NotificationType {
    severity: "error" | "warning" | "info" | "success"
    text: string
    stayOnTimeMs?: number // number of milliseconds to stay on screen before starting to fade out
    fadeOutTimeMs?: number // number of milliseconds taken for the notification completely fade out
}

// used subscribable that is used to store and manipulate the notifications
export type NotificationQueueFunctions = SubscribableClientFunctionsType<NotificationType>;