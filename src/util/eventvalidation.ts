import { validateDate, validateTime } from './index';
import { CalendarEvent } from '../types';

/**
 * This module is used to validate events
 */
export { validateTime, validateDate, validateEventIdString } from './index';

// export function validateStartAndEndDate(event: CalendarEvent): boolean | string {
//     if (validateDate(startDate) !== true || validateDate(endDate) !== true || compareDates(startDate, endDate) == 1)
// return true;
// }

/**
 * Checks if the provided event title is valid.
 * @param title Event title to validate.
 * @returns Returns an error string if the title is invalid. Returns undefined if the title is valid.
 */
export function validateTitle(title: string): string | undefined {
    if (!title)
        return 'Title cannot be empty'
    else if (title.length > 100)
        return 'Title cannot be longer than 100 characters'
}

export function validateDescription(description: string): string | undefined {
    if (description.length > 300)
        return 'Description cannot be longer than 300 characters'
}


interface ValidationReturnType {
    success: boolean
    errorMessage: string
    parsedEvent: CalendarEvent
}

// Validates a newly created event and returns the validated data in a CalendarEvent object
export function validateNewEvent({ id, title, description, date, startTime }: Partial<CalendarEvent>): ValidationReturnType {
    const parsedEvent: CalendarEvent = {
        id: id ? id : '',
        title: '',
        date: { year: 0, month: 0, date: 0 },
        startTime: { hour: 0, minute: 0, second: 0 }
    };

    const createErrorReturnValue = (errorMessage: string): ValidationReturnType => {
        return { success: false, errorMessage, parsedEvent }
    }

    if (!title || title.length == 0)
        return createErrorReturnValue('Title must be provided');
    else if (title.length > 100)
        return createErrorReturnValue('Title cannot be longer than 100 characters');
    else
        parsedEvent.title = title;

    if (description || description === '') // if description is '' it means that the existing description is to be cleared out
        if (description.length > 300)
            return createErrorReturnValue('Description cannot be longer than 300 characters');
        else
            parsedEvent.description = description;
    parsedEvent.description = description;


    if (!date || validateDate(date))
        return createErrorReturnValue('A valid event date must be specified');
    else
        parsedEvent.date = date;

    if (!startTime || validateTime(startTime))
        return createErrorReturnValue('A valid event time must be provided');
    else
        parsedEvent.startTime = startTime;

    return { success: true, errorMessage: '', parsedEvent }
}