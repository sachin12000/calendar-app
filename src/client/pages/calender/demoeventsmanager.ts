/**
 * Events manager used for handling dummy events for the demo mode.
 */

import { CalendarDate, CalendarEvent } from "../../../types";
import {
    compareEventTimes,
    compareDates,
    binarySearchFirstOccurrence,
    binarySearchLastOccurrence,
    validateDate,
    validateTime,
} from "../../../util";
import { getEventDiff } from './util';

import EventsManagerInterface from "./eventsmanagerinterface";

const eventComparator = (date: CalendarDate, event: CalendarEvent) => compareDates(date, event.date);
const compareTwoEvents = (e1: CalendarEvent, e2: CalendarEvent) => compareEventTimes(e1, e2);

export default class DemoEventsManager implements EventsManagerInterface {
    private eventsArray: CalendarEvent[];

    private nextAvailableId: number;

    constructor(demoEvents: CalendarEvent[]) {
        if (demoEvents) {
            this.eventsArray = Array.from(demoEvents);
            this.nextAvailableId = demoEvents.length;
        } else {
            this.eventsArray = [];
            this.nextAvailableId = 0;
        }
    }

    private getInsertionIndex(event: CalendarEvent) {
        const { eventsArray } = this;
        if (eventsArray.length == 0)
            return 0;

        let [exactMatch, index] = binarySearchFirstOccurrence(eventsArray, event, compareTwoEvents);
        if (!exactMatch && compareEventTimes(event, eventsArray[index]) == 1)
            index++;

        return index;
    }

    private getEventsWithinRange(startDate: CalendarDate, endDate: CalendarDate): CalendarEvent[] {
        const { eventsArray } = this;
        if (eventsArray.length == 0) // no events
            return [];

        let [exactI1, i1] = binarySearchFirstOccurrence(eventsArray, startDate, eventComparator);
        if (!exactI1 && compareDates(startDate, eventsArray[i1].date) == 1) {
            if (i1 == eventsArray.length - 1)
                return [];  // startDate - endDate range occurs after the events range
            else
                i1++;
        }

        let [exactI2, i2] = binarySearchLastOccurrence(eventsArray, endDate, eventComparator);
        if (!exactI2 && compareDates(endDate, eventsArray[i2].date) == -1)
            if (i2 == 0)
                return []; // // startDate - endDate range occurs before the events range
            else
                i2--;
        return eventsArray.slice(i1, i2 + 1);
    }

    /**
     * Gets the event with eventId from locally available events
     * @param eventId Event ID of the event to search.
     * @returns Returns the event with the eventId if it is available locally. Returns undefined otherwise.
     */
    getEventFromId(eventId: string): CalendarEvent | undefined {
        for (const event of this.eventsArray)
            if (event.id == eventId)
                return event;
    }

    /**
     * Adds a new event to Firestore.
     * @param event Event to be added. event.id will be ignored
     * @returns Does not return anything on sucess. Promise rejects on failure with an error message.
     */
    async addEvent(event: CalendarEvent) {
        const { eventsArray } = this;
        const id = (this.nextAvailableId++).toString();

        if (eventsArray.length == 0) {
            eventsArray.push({ ...event, id });
        } else {
            const index = this.getInsertionIndex(event);
            this.eventsArray.splice(index, 0, { ...event, id });
        }
    }

    getEventsForRangeLocally(startDate: CalendarDate, endDate: CalendarDate): CalendarEvent[] | undefined {
        return this.getEventsWithinRange(startDate, endDate);
    }

    async getEventsForRange(startDate: CalendarDate, endDate: CalendarDate): Promise<CalendarEvent[]> {
        const events = this.getEventsWithinRange(startDate, endDate);
        if (events) {
            return Promise.resolve(events);
        } else {
            return Promise.resolve([]);
        }
    }

    async updateEvent(eventId: string, event: Partial<CalendarEvent>) {
        const { eventsArray } = this;

        let eventToBeUpdated: CalendarEvent | undefined;
        let eventIndex: number = 0;

        if (!eventId)
            throw 'A valid event ID is required for for updating an event';
        else {
            // find the event to be updated and its index in the events array
            for (; eventIndex < eventsArray.length; eventIndex++) {
                if (eventsArray[eventIndex].id == eventId) {
                    eventToBeUpdated = eventsArray[eventIndex];
                    break;
                }
            }
        }

        if (!eventToBeUpdated)
            throw `An event with the id ${eventId} was not found`

        // fields in the updated object that are different from the original
        const eventDiff = getEventDiff(eventToBeUpdated, event);

        eventDiff.id = eventId;
        const { date, startTime } = eventDiff;

        if (!date && !startTime) {
            // the date or the start time of the event was not changed
            eventsArray[eventIndex] = { ...eventToBeUpdated, ...eventDiff };
        } else {
            // date or time of the event was changed
            if (startTime) {
                const timeValidator = validateTime(startTime);
                if (timeValidator)
                    throw timeValidator;
            }
            if (date) {
                const dateValidator = validateDate(date);
                if (dateValidator)
                    throw dateValidator;
            }

            // move the event to its new spot in the chronologically sorted array
            const updatedEvent = { ...eventToBeUpdated, ...eventDiff };
            const newIndex = this.getInsertionIndex(updatedEvent);

            eventsArray.splice(newIndex, 0, updatedEvent);  // add the updated event to its position
            if (newIndex <= eventIndex)
                eventIndex++;  // compensate for the inserted event before removing the old event
            eventsArray.splice(eventIndex, 1);  // remove the old event from the array
        }
    }

    async removeEvent(eventId: string) {
        const { eventsArray } = this;
        let index: number = -1; // index of the event to remove

        eventsArray.every(({ id }, i) => {
            if (id === eventId) {
                index = i;
                return false;
            }
            return true;
        });

        if (index == -1)
            throw `event with ID ${eventId} was not found`;
        this.eventsArray.splice(index, 1);
    }
}