/**
 * Utility functions used by the calendar components
 */
import { CalendarEvent, CalendarDate } from "../../../types";
import { compareTimes, compareDates } from "../../../util";

/**
 * Gets the first date of the calendar of 6 weeks that displays the given month, year
 * @param year Year that the month is in.
 * @param month Month to be displayed.
 * @returns CalendarDate object specifying the first date of the 6 week calendar to be displayed.
 */
export function getFirstDateOfCalendar(year: number, month = 0): CalendarDate {
    const monthStartingDay = new Date(year, month, 1).getDay();

    if (monthStartingDay != 0) {
        const dateObject = new Date(year, month, 1 - monthStartingDay);
        return { year: dateObject.getFullYear(), month: dateObject.getMonth(), date: dateObject.getDate() };
    } else {
        return { year, month, date: 1 }
    }
}

/**
 * Compares e1 to e2 and returns a new object with the fields in e2 that are different to fields e1. Useful when updating
 * an event. NOTE: THIS FUNCTION DOES NOT COMPARE THE IDs OF EVENTS.
 * @param e1 First of two events to use in the comparison.
 * @param e2 Second of two events to use in the comparison.
 * @returns Partial CalendarEvent with only the differences
 */
export function getEventDiff(e1: Partial<CalendarEvent>, e2: Partial<CalendarEvent>): Partial<CalendarEvent> {
    const diff: Partial<CalendarEvent> = {};

    if (e2.title !== undefined && e1.title !== e2.title)
        diff.title = e2.title;
    if (e2.description !== undefined && e1.description !== e2.description)
        diff.description = e2.description;
    if ((!e1.startTime && e2.startTime) || (e2.startTime && e1.startTime && compareTimes(e1.startTime, e2.startTime) != 0))
        diff.startTime = e2.startTime;
    if ((!e1.date && e2.date) || (e1.date && e2.date && compareDates(e1.date, e2.date) != 0))
        diff.date = e2.date;

    return diff;
}

// fetches the demo data from /demo.json for the app demo feature
export async function fetchDemoData(): Promise<CalendarEvent[]> {
    const response = await fetch("/demo.json");
    const events: CalendarEvent[] = await response.json();
    return events;
}