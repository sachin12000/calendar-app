/**
 * EventsManager class retrives events from Firestore when requested.
 * The retrieved events are stored locally for future use.
 * When a call is made to EventsManager to retrieve events for a certain range, it only calls
 * Firestore to retrieve the events that are not available locally.
 */
import * as API from '../../API'
import { CalendarDate, CalendarEvent } from "../../../types";
import {
    compareEventTimes,
    compareDates,
    decrementDateByOne,
    incrementDateByOne,
    binarySearchFirstOccurrence,
    binarySearchLastOccurrence,
    validateDate,
    validateTime,
} from "../../../util";
import { getEventDiff } from './util';

import EventsManagerInterface from './eventsmanagerinterface';

const eventComparator = (date: CalendarDate, event: CalendarEvent) => compareDates(date, event.date);
const compareTwoEvents = (e1: CalendarEvent, e2: CalendarEvent) => compareEventTimes(e1, e2);

// used to indicate the availability of ranges
enum RangeStateEnum {
    available,  // events for the range were fetched from Firestore and are available locally
    requested  // request to Firestore was made to fetch the events for the range
}

export default class EventsManager implements EventsManagerInterface {
    // array to store events that were already fetched from Firestore the array if choronologically sorted
    private eventsArray: CalendarEvent[] = [];

    // indicates availability of events for ranges of dates
    // example: if tuple: [2023:0:01, 2023:01:15, RangeStateEnum.available, []] exists it means that the events for
    // the range 2023:0:01 - 2023:01:15 (inclusive) have been retrieved from Firestore and are available locally
    // the RangeStateEnum indicates if events for a given range is available locally or if a request to Firestore
    // was made to retrieve it (RangeStateEnum.requested)
    // the functions in the array of () => void will be called when the correspoding range is successfully fetched
    private availableRanges: [
        CalendarDate,
        CalendarDate,
        RangeStateEnum,
        ((success: boolean, message: string) => void)[] | null
    ][] = [];

    /**
    * Gets the index where the specified event should be inserted to the chronologically sorted eventsArray.
    * @param event Event to find the insertion index of.
    * @returns Insertion index of the specified event.
    */
    private getInsertionIndex(event: CalendarEvent) {
        const { eventsArray } = this;
        if (eventsArray.length == 0)
            return 0;

        let [exactMatch, index] = binarySearchFirstOccurrence(eventsArray, event, compareTwoEvents);
        if (!exactMatch && compareEventTimes(event, eventsArray[index]) == 1)
            index++;

        return index;
    }

    // Returns an array of events between startDate and endDate (inclusive) from the local array.
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

    // returns this.eventsArray
    // only used for testing
    getArrays(): [CalendarEvent[], [CalendarDate, CalendarDate][]] {
        const availableRanges: [CalendarDate, CalendarDate][] = [];
        this.availableRanges.forEach(range => {
            if (range[2] == RangeStateEnum.available)
                availableRanges.push([range[0], range[1]]);
        });
        return [this.eventsArray, availableRanges];
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

        if (!this.getEventsForRangeLocally(event.date, event.date))
            await this.getEventsForRange(event.date, event.date);

        const { success, id, message } = await API.addEvent(event);
        if (!success)
            throw message;

        if (eventsArray.length == 0) {
            eventsArray.push({ ...event, id });
        } else {
            const index = this.getInsertionIndex(event);
            this.eventsArray.splice(index, 0, { ...event, id });
        }
    }

    /**
     * Attempts to retrieve events for the specified range locally.
     * @param startDateCopy Start date of the range to retrieve.
     * @param endDate End date of the range (inclusive) to retrieve.
     * @returns Returns the events between the range startDate and endDate (inclusive) if the entire range is available locally.
     * Returns undefined if events for at least 1 day are not available locally.
     */
    getEventsForRangeLocally(startDate: CalendarDate, endDate: CalendarDate): CalendarEvent[] | undefined {
        if (compareDates(startDate, endDate) == 1)
            throw 'startDate cannot be later than the endDate';

        const { availableRanges } = this;
        let startDateCopy = { ...startDate };  // make a copy to prevent mutation of startDate

        if (availableRanges.length == 0 ||
            compareDates(startDateCopy, availableRanges[availableRanges.length - 1][1]) == 1 ||
            compareDates(endDate, availableRanges[0][0]) == -1)
            return; // no events are available locally or startDate - endDate range is outside all available ranges

        // check that all necessary events are available locally
        for (let i = 0; i < availableRanges.length && compareDates(startDateCopy, endDate) != 1; i++) {
            if (compareDates(startDateCopy, availableRanges[i][0]) == -1)
                return; // events between startDate and availableRanges[i][0] are not available
            startDateCopy = incrementDateByOne(availableRanges[i][1]);
        }
        if (compareDates(startDateCopy, endDate) != 1)
            return; // events startDate and endDate are not available

        return this.getEventsWithinRange(startDate, endDate);
    }

    /**
     * Gets the events that occur between the range startDate and endDate (insclusive). The events in the range that are not avilable
     * locally will be fetched from Firestore.
     * @param startDate starting date of the range
     * @param endDate ending date of the range
     * @returns promise that resolves to an array of events that occur in the range
     */
    async getEventsForRange(startDate: CalendarDate, endDate: CalendarDate): Promise<CalendarEvent[]> {
        const { eventsArray, availableRanges } = this;
        return new Promise<CalendarEvent[]>((resolve, reject) => {
            let callSuccess = true; // inidicates if the call was successful
            let failMessage = '';

            // ranges where the events are not available locally
            const rangesToFetch: [CalendarDate, CalendarDate, RangeStateEnum, ((success: boolean, message: string) => void)[]][] = [];
            let numberOfRangesRequested = 0;
            const originalStartDate: CalendarDate = { ...startDate };

            // check which sub ranges of the given range are available locally
            // subranges of the range that are unavailable locally needs to be fetched from Firestore

            // find the index in the ranges array where to start
            let i = 0;
            for (;
                i < availableRanges.length && compareDates(endDate, availableRanges[i][0]) == 1 && compareDates(startDate, availableRanges[i][1]) == 1;
                i++);

            while (i < availableRanges.length && compareDates(endDate, availableRanges[i][0]) != -1 && compareDates(startDate, endDate) != 1) {
                const subRange = availableRanges[i];

                if (compareDates(startDate, subRange[0]) == -1) {
                    // startDate to subRange[0] - 1 is not available. Add it to the array of ranges to be fetched
                    const newSubrange: [CalendarDate, CalendarDate, RangeStateEnum, ((success: boolean, message: string) => void)[]]
                        = [startDate, decrementDateByOne(subRange[0]), RangeStateEnum.requested, []];
                    rangesToFetch.push(newSubrange);
                    availableRanges.splice(i, 0, newSubrange);
                    numberOfRangesRequested++;
                    i++;
                }

                // the range is requested and awaiting the request to be completed by the server
                // add a callback to be called when the request is completed
                if (subRange[2] == RangeStateEnum.requested) {
                    subRange[3]?.push((success, message) => {
                        if (!success && callSuccess) {
                            callSuccess = false;
                            failMessage = message;
                        }
                        numberOfRangesRequested--;
                        if (numberOfRangesRequested == 0) {
                            if (callSuccess) {
                                resolve(this.getEventsForRange(originalStartDate, endDate));
                            } else {
                                reject(failMessage);
                            }
                        }
                    });
                    numberOfRangesRequested++;
                }
                startDate = incrementDateByOne(subRange[1]);
                i++;
            }
            if (compareDates(startDate, endDate) != 1) {
                // the final section of the requested range needs to be fetched
                const newSubrange: [CalendarDate, CalendarDate, RangeStateEnum, ((success: boolean, message: string) => void)[]]
                    = [startDate, endDate, RangeStateEnum.requested, []];
                rangesToFetch.push(newSubrange);
                availableRanges.splice(i, 0, newSubrange);
                numberOfRangesRequested++;

            }

            for (const rangeToFetch of rangesToFetch) {
                const [rangeStart, rangeEnd] = [rangeToFetch[0], rangeToFetch[1]];

                // gets the index in availableRanges of the range that is specified startDate and endDate
                const getIndexInAvailableRanges = (startDate: CalendarDate, endDate: CalendarDate) => {
                    if (availableRanges.length > 0) {
                        for (let i = 0; i < availableRanges.length; i++) {
                            if (!compareDates(startDate, availableRanges[i][0]) && !compareDates(endDate, availableRanges[i][1]))
                                return i;
                        }
                        return -1;
                    }
                    return 0;
                }

                // make the request to fetch the rangeStart - rangeEnd range
                const fetchPromise = API.getEventsForRange(rangeStart, rangeEnd);
                fetchPromise.then(({ success, message, events }) => {
                    let indexInAvailableRanges = getIndexInAvailableRanges(rangeStart, rangeEnd);
                    if (indexInAvailableRanges == -1) {
                        // unable to find the range in the availableRanges array
                        callSuccess = false;
                        failMessage = 'Unable to find the range';
                        return;
                    }

                    const range = availableRanges[indexInAvailableRanges];
                    if (success) {
                        if (events.length > 0) {
                            // merge the new events in to the local array
                            let insertionIndex = 0;
                            for (;
                                insertionIndex < eventsArray.length && compareEventTimes(events[0], eventsArray[insertionIndex]) == 1;
                                insertionIndex++);
                            eventsArray.splice(insertionIndex, 0, ...events);
                        }

                        // call the callbacks and indicate the range has been fetched successfully
                        range[3]?.forEach(callback => callback(true, ''));

                        // indicate the requested has been completed and the range is now available locally
                        range[2] = RangeStateEnum.available;
                        range[3] = null;
                    } else {
                        // fetching events failed
                        // call the callbacks with the error message
                        range[3]?.forEach(callback => callback(false, message));
                        if (callSuccess) {
                            // fetching the events failed
                            availableRanges.splice(indexInAvailableRanges, 1); // remove the range from the array because fetching it failed
                            callSuccess = false;
                            failMessage = message;

                        }
                        availableRanges.splice(indexInAvailableRanges, 1); // remove the range from the array because fetching it failed
                    }
                }).catch(() => {
                    // fetching events failed
                    if (callSuccess) {
                        callSuccess = false;
                        failMessage = 'General error when fetching events for range';
                    }
                    let indexInAvailableRanges = getIndexInAvailableRanges(startDate, rangeEnd);
                    if (indexInAvailableRanges == -1) {
                        // unable to find the range in the availableRanges array
                        callSuccess = false;
                        failMessage = 'Unable to find the range';
                        return;
                    }
                    // call the callbacks with the error message
                    availableRanges[indexInAvailableRanges][3]?.forEach(callback => callback(false, 'General error when fetching events for range'));
                    availableRanges.splice(indexInAvailableRanges, 1); // remove the range from the array because fetching it failed
                }).finally(() => {
                    numberOfRangesRequested--;
                    if (numberOfRangesRequested == 0) {
                        if (callSuccess) {
                            resolve(this.getEventsWithinRange(originalStartDate, endDate));
                        } else {
                            reject(failMessage);
                        }
                    }
                });
            }
        });
    }

    /**
     * Updates an existing event.
     * @param event New event data to update the existing event with.
     * @returns Does not return anything on success. Promise rejects on failure with an error message.
     */
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

        const eventDiff = getEventDiff(eventToBeUpdated, event);  // fields in the updated object that are different from the original
        eventDiff.id = eventId;
        const { date, startTime } = eventDiff;

        if (!date && !startTime) {
            // the date or the start time of the event was not changed
            const { success, message } = await API.updateEvent(eventId, eventDiff);
            if (!success)
                throw message;
            eventsArray[eventIndex] = { ...eventToBeUpdated, ...eventDiff };
        } else {
            let dateOrTimeChanged = false;
            if (startTime) {
                dateOrTimeChanged = true;
                const timeValidator = validateTime(startTime);
                if (timeValidator)
                    throw timeValidator;
            }
            if (date) {
                dateOrTimeChanged = true;
                const dateValidator = validateDate(date);
                if (dateValidator)
                    throw dateValidator;
                await this.getEventsForRange(date, date);
            }

            // send the update request to the server
            const { success, message } = await API.updateEvent(eventId, eventDiff);
            if (!success)
                throw message;

            if (dateOrTimeChanged) {
                // date or time of the event was changed
                // move the event to its new spot in the chronologically sorted array
                const updatedEvent = { ...eventToBeUpdated, ...eventDiff };
                const newIndex = this.getInsertionIndex(updatedEvent);

                eventsArray.splice(newIndex, 0, updatedEvent);  // add the updated event to its position
                if (newIndex <= eventIndex)
                    eventIndex++;  // compensate for the inserted event before removing the old event
                eventsArray.splice(eventIndex, 1);  // remove the old event from the array
            }
        }
    }

    /**
    * Removes event specified by the event ID.
    * @param id ID of the event to be removed.
    * @returns Does not return anything on sucess. Promise rejects on failure with an error message.
    */
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
        const { success, message } = await API.removeEvent(eventId);
        if (!success)
            throw message;
        this.eventsArray.splice(index, 1);
    }
}