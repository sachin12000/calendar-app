/**
 * Hook for creating a subscribable object. Clients can use addOnPushCallback to add a callback to be called when a new
 * item is added to the subscribable.
 */

import { useRef } from "react"

type CallbackFunctionType = () => void;  // signature of callback functions that are added to the subscribable through addOnPushCallback

// functions used to manipulate the subcribable
export interface SubscribableClientFunctionsType<T> {
    push: (notification: T) => void  // push a new item to the subscribable
    shift: () => T | undefined  // remove the first element (earliest added) from the subscribable and return it
    getQueueLength: () => number // gets the length of the internal array that stores the added items
    // adds a new callback to be called when a new item is added to the susbcribable
    // returns a id number that identifies the added callback in this subscribablbe instance
    addOnPushCallback: (callbackFunction: CallbackFunctionType) => number
    removeOnPushCallback: (id: number) => void // remove the callback specified by the id from this subscribablbe instance
}

// type of the array that stores the callback functions
interface CallbacksArrayType {
    currentId: number, // current id that will be handed out to the next callback that is added through addOnPushCallback
    callbacks: [number, CallbackFunctionType][]  // array of callback and their Ids [id, callback function]
}

/**
 * Create a new subscribable
 * @argument T Type of the items that will be handled by the subscribable
 * @returns Functions for manipulating the subscribable
 */
export default function useSubscribable<T>(): SubscribableClientFunctionsType<T> {
    const queueRef = useRef<T[]>([]);  // queue of items of type T waiting to be processed by the callbacks in the subscribable

    // array of callback functions to be called when a notification is added to the array
    const callbacksRef = useRef<CallbacksArrayType>({ currentId: 0, callbacks: [] });
    const callbacks = callbacksRef.current;

    const push = (notification: T) => {
        queueRef.current.push(notification)
        for (const [, callback] of callbacks.callbacks) // call the callbacks to alert them there is a new event
            callback();
    }

    const shift = (): T | undefined => queueRef.current.shift();

    const getQueueLength = () => queueRef.current.length;

    /**
     * Adds a callback to be called when a notification is pushed to the queue
     * @param callbackFunction Callback function to be called.
     * @returns Id of the callback function. This uniquely identifies the callback.
     */
    const addOnPushCallback = (callbackFunction: CallbackFunctionType): number => {
        const id = callbacks.currentId++;
        callbacks.callbacks.push([id, callbackFunction]);
        return id;
    }

    /**
     * Stops the specified callback from being called when a new notification is pushed.
     * @param id ID of the callback to be stopped.
     */
    const removeOnPushCallback = (id: number) => {
        const callbacksArray = callbacks.callbacks;
        if (callbacksArray.length == 0)
            return;
        const index = callbacksArray.findIndex((([currentId]) => currentId == id));
        if (index != -1) {
            const newCallbacksArray = [...callbacksArray.slice(0, index), ...callbacksArray.slice(index + 1)];
            callbacksRef.current = { currentId: callbacks.currentId, callbacks: newCallbacksArray };
        }
    }

    return {
        push,
        shift,
        addOnPushCallback,
        removeOnPushCallback,
        getQueueLength
    };
}