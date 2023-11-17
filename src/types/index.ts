/**
 * Represents a date of a certain month and year
 */
export interface CalendarDate {
    year: number
    month: number // month values go from 0 (january) to 11 (december)
    date: number // dates start on 1
}

// Reprents time in hours, minutes, seconds
export interface Time {
    hour: number
    minute: number
    second: number
}

/**
 * Event that can be put in the calendar
 */
export interface CalendarEvent {
    id: string
    title: string
    description?: string
    date: CalendarDate
    startTime: Time
    endTime?: Time
    backgroundColor?: string
    color?: string
}

export enum TimeFormat {
    TwelveHours,
    TwentyFourHours
}