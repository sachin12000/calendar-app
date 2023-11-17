/**
 * Hanldes firestore API calls
 */
import { collection, doc, addDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '../firebaselogic';

import { CalendarDate, CalendarEvent } from "../../types";
import { validateDate, compareDates, dateToString, timeToString, dateStringToDate, timeStringToTime } from '../../util';

// type that represents the event doc that is stored in firestore
interface EventFirestoreDocType {
    title: string
    description?: string
    dateTime: string
}

// basic return type of functions in this module
interface FirebaseApiReturnType {
    success: boolean
    message: string
}

// gets the Firebase auth's user object
// throws an exception if the user is not authenticated
function getUID(): string {
    if (!auth.currentUser)
        throw new Error('Invalid authentication. auth.currentUser is not available');
    else
        return auth.currentUser.uid;

}

// return type of the getEventsForRange function
export type GetEventsForRangeReturnType = FirebaseApiReturnType & { events: CalendarEvent[], startDate: CalendarDate, endDate: CalendarDate };

export async function addEvent(event: CalendarEvent): Promise<{ id: string } & FirebaseApiReturnType> {
    const { title, description, date, startTime } = event;
    const eventDoc: EventFirestoreDocType = {
        title,
        description,
        dateTime: `${dateToString(date)}${timeToString(startTime)}`,
    }
    const uid = getUID();
    const eventsCollection = collection(db, 'users', uid, 'events');
    const newEventDoc = await addDoc(eventsCollection, eventDoc);
    return { success: true, id: newEventDoc.id, message: '' };
}

export async function getEventsForRange(startDate: CalendarDate, endDate: CalendarDate): Promise<GetEventsForRangeReturnType> {
    if (validateDate(startDate) || validateDate(endDate))
        return { success: false, events: [], message: "Invalid iput paramters", startDate, endDate };
    else if (compareDates(startDate, endDate) == 1)
        return { success: false, events: [], message: "startDate cannot be later than the endDate", startDate, endDate };

    try {
        const events: CalendarEvent[] = [];
        const uid = getUID();
        const eventsCollection = collection(db, 'users', uid, 'events');

        const q = query(eventsCollection,
            where('dateTime', '>=', `${dateToString(startDate)}0000`),
            where('dateTime', '<=', `${dateToString(endDate)}2359`
            ));

        const eventDocs = await getDocs(q);
        eventDocs.forEach((doc) => {
            const eventDoc = doc.data() as EventFirestoreDocType;

            const event: CalendarEvent = {
                id: doc.id,
                title: eventDoc.title,
                description: eventDoc.description,
                date: dateStringToDate(eventDoc.dateTime.substring(0, 8)),
                startTime: timeStringToTime(eventDoc.dateTime.substring(8))
            }
            events.push(event);
        });
        return { success: true, message: '', events, startDate, endDate };
    } catch {
        return { success: false, events: [], message: "Network Error", startDate, endDate }
    }
}

export async function updateEvent(eventId: string, updatedEvent: Partial<CalendarEvent>): Promise<FirebaseApiReturnType> {
    const updatedEventDoc: Partial<EventFirestoreDocType> = {}; // contains the updated fields in the format accepted by the firestore
    if (updatedEvent.title)
        updatedEventDoc.title = updatedEvent.title;
    if (updatedEvent.description || updatedEvent.description === '')
        updatedEventDoc.description = updatedEvent.description;
    if (updatedEvent.date && updatedEvent.startTime)
        updatedEventDoc.dateTime = `${dateToString(updatedEvent.date)}${timeToString(updatedEvent.startTime)}`;

    const uid = getUID();
    const docRef = doc(db, 'users', uid, 'events', eventId);
    try {
        await updateDoc(docRef, updatedEventDoc);
        return {
            success: true,
            message: ''
        }
    } catch (e) {
        return {
            success: false,
            message: 'Error updating event'
        }
    }
}

export async function removeEvent(eventId: string): Promise<FirebaseApiReturnType> {
    try {
        const uid = getUID();
        const r = await deleteDoc(doc(db, 'users', uid, 'events', eventId))
        return {
            success: true,
            message: ''
        }
    } catch {
        return {
            success: false,
            message: 'Error deleting event'
        }
    }
}