/**
 * interface that describes the an EventsManger. Implemented by EventsManger and DemoEventsManager
 */

import { CalendarDate, CalendarEvent } from "../../../types";

export default interface EventsManagerInterface {
    getEventFromId(eventId: string): CalendarEvent | undefined
    addEvent(event: CalendarEvent): Promise<void>
    getEventsForRangeLocally(startDate: CalendarDate, endDate: CalendarDate): CalendarEvent[] | undefined
    getEventsForRange(startDate: CalendarDate, endDate: CalendarDate): Promise<CalendarEvent[]>
    updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void>
    removeEvent(eventId: string): Promise<void>
}