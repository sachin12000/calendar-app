import { CalendarDate, CalendarEvent, Time } from "../types";
export * as eventvalidation from './eventvalidation';


const thirtyDayMonths = [3, 5, 8, 10]; // month indeces of months with 30 days

interface ComparisonFunction {
    (v1: any, v2: any): number | undefined
}

export const isLeapYear = (year: number): boolean => (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0));

/**
 * Tries to parse a string to a CalendarDate type. The string must be of format yyyymmdd.
 * On failure an error message is returned.
 * NOTE: THIS DOES NOT VALIDATE THE DATE. EXAMPLE: 20230134 (2023, feb 34) IS NOT A VALID DATE.
 * @param date string to validate
 */
export function parseDateFromString(date: string): CalendarDate | string {
    const isValid = /^\d{8}$/.test(date); // regex to check that the entire string is only made up of 8 digits
    if (isValid) {
        const d: CalendarDate = {
            year: parseInt(date.substring(0, 4)),
            month: parseInt(date.substring(4, 6)),
            date: parseInt(date.substring(6))
        }
        return d;
        // return {
        //     success: true,
        //     returnValue: d
        // }
    } else {
        // return {
        //     success: false,
        //     message: `"${date}" is not a valid date value. Date must of format yyyymmdd`
        // }
        return `"${date}" is not in valid format. Date must of format yyyymmdd`;
    }
}

/**
 * Validates an event ID by making sure that it fits the format of alphanumeric characters (case insensitive) and is no longer
 * than 8 chracters.
 * @param eventId id string to validate.
 * @returns boolean indicating if the string is of valid format or not.
 */
export function validateEventIdString(eventId: string): boolean {
    if (/^[a-z0-9]{1,8}$/i.test(eventId))
        return true;
    else
        return false;
}

/**
 * Parses and validates a time string. Makes sure the string is of format HHMM and of 24 hour format.
 * @param timeString String to parse and validate.
 * @returns return a Time object with the parsed time if valid. Returns false if time is invalid.
 */
export function parseAndValidateTimeString(timeString: string): false | Time {
    if (!/^\d{4}$/.test(timeString))
        return false;
    const hour = parseInt(timeString.substring(0, 2));
    if (hour > 23)
        return false;
    const minute = parseInt(timeString.substring(2));
    if (minute > 59)
        return false;
    return { hour, minute, second: 0 };
}

/**
 * Checks if the provided date is a valid date
 * @param date date to validate
 * @returns Returns true if validation succeeded, returns an error message (a string) describing the error.
 */
export function validateDate(date: CalendarDate): string | undefined {
    const { year, month, date: d } = date

    if (year < 1)
        return `The year value '${year} is too small. The year values should be larger than 0`
    else if (year > 9999)
        return `The year value '${year} is too large. The year values should not be larger than 9999`

    if (month > 11)
        return `The month value '${month} is too large. The month values should be between 0 and 11 (inclusive)`
    else if (month < 0)
        return `The month value '${month} is too small. The month values should be between 0 and 11 (inclusive)`

    if (d < 1)
        return `The date value '${d} is too small. The date values should be larger than 0`

    if (month == 1) {
        if ((isLeapYear(year) && d > 29) || d > 28)
            return `The date value '${d} is too large for month ${month}`
    } else if ([0, 2, 4, 6, 7, 9, 11].includes(month) && d > 31)
        return `The date value '${d} is too large. The date value for month ${month} should be no more than 31`
    else if ([3, 5, 8, 10].includes(month) && d > 30)
        return `The date value '${d} is too large. The date value for month ${month} should be no more than 30`
}

/**
 * Checks if the provided time is a valid 24 hour time
 * @param time time to validate
 * @returns Returns nothing if validation succeeded. Returns an error message (a string) describing the error if failed.
 */
export function validateTime(time: Time): string | undefined {
    const { hour, minute, second } = time;
    if (hour < 0 || hour > 24)
        return `Invalid hour value of ${hour}. Hour must be between 0 and 24`
    else if (minute < 0 || minute > 59)
        return `Invalid minute value of ${minute}. Minute must be between 0 and 59`
    else if (second < 0 || second > 59)
        return `Invalid second value of ${second}. Second must be between 0 and 59`
}
/**
 * Finds the index of the first occurence of valueToSearch in searchArray. If an exact match wasn't found then returns the index
 * of the value that is adjacent to valueToSearch (valueToSearch larger than or smaller the item at the returned index).
 * @param searchArray Array to search valueToSearch
 * @param valueToSearch Value to be searhed in searchArray
 * @param comparisonFunction Function used to compare values during search
 * @returns tuple [boolean, number]. tuple[0] indicates if an exact match was found. if tuple[0] is true then tuple [1] is the
 * exact index. If tuple[0] is false then tuple[1] is the index of the value that is adjacent to valueToSearch. tuple[1] is -1 if
 * the array is empty
 */
export function binarySearchFirstOccurrence(searchArray: any[],
    valueToSearch: unknown,
    comparisonFunction: ComparisonFunction): [boolean, number] {
    if (searchArray.length == 0)
        return [false, -1];
    let min = 0;
    let max = searchArray.length - 1;
    let mid = 0;
    while (min <= max) {
        mid = Math.floor((min + max) / 2);
        const comparisonResult = comparisonFunction(valueToSearch, searchArray[mid]);
        if (comparisonResult == 1)
            min = mid + 1;
        else if (comparisonResult == -1)
            max = mid - 1;
        else if (min != max && mid > 0 && comparisonFunction(valueToSearch, searchArray[mid - 1]) == 0)
            // [mid] is not the first occurence of valueToSearch in the array. continue to search for the first occurence
            max = mid - 1;
        else
            // [mid] is the first occurence of valueToSearch in the array
            return [true, mid];
    }
    return [false, mid]
}

/**
 * Finds the index of the last occurence of valueToSearch in searchArray. If an exact match wasn't found then returns the index
 * of the value that is adjacent to valueToSearch (valueToSearch larger than or smaller the item at the returned index).
 * @param searchArray Array to search valueToSearch
 * @param valueToSearch Value to be searhed in searchArray
 * @param comparisonFunction Function used to compare values during search
 * @returns tuple [boolean, number]. tuple[0] indicates if an exact match was found. if tuple[0] is true then tuple [1] is the
 * exact index. If tuple[0] is false then tuple[1] is the index of the value that is adjacent to valueToSearch. tuple[1] is -1 if
 * the array is empty
 */
export function binarySearchLastOccurrence(searchArray: any[],
    valueToSearch: any,
    comparisonFunction: ComparisonFunction): [boolean, number] {
    if (searchArray.length == 0)
        return [false, -1];
    let min = 0;
    let max = searchArray.length - 1;
    let mid = 0;
    while (min <= max) {
        mid = Math.floor((min + max) / 2);
        const comparisonResult = comparisonFunction(valueToSearch, searchArray[mid]);
        if (comparisonResult == 1)
            min = mid + 1;
        else if (comparisonResult == -1)
            max = mid - 1;
        else if (min != max && mid < searchArray.length - 1 && comparisonFunction(valueToSearch, searchArray[mid + 1]) == 0)
            // [mid] is not the last occurence of valueToSearch in the array. continue to search for the last occurence
            min = mid + 1;
        else
            // [mid] is the last occurence of valueToSearch in the array
            return [true, mid];
    }
    return [false, mid];
}

/**
 * Compares 2 dates and returns and 0, 1 or -1 depending on the chornological order of the dates.
 * @param d1 Date 1
 * @param d2 Date 2
 * @returns Returns 1 if d1 occurs is later than d2. Returns -1 if d2 occurs later than d1. Returns 0 if d1 and d2 occur on the same date
 */
export function compareDates(d1: CalendarDate, d2: CalendarDate): number {
    if (d1.year > d2.year) {
        return 1;
    } else if (d2.year > d1.year) {
        return -1;
    } else if (d1.month > d2.month) {
        return 1;
    } else if (d2.month > d1.month) {
        return -1
    } else if (d1.date > d2.date) {
        return 1;
    } else if (d2.date > d1.date) {
        return -1;
    } else {
        return 0;
    }
}

/**
 * Compares 2 times and returns and 0, 1 or -1 depending on the chornological order of the times.
 * @param t1 Time 1
 * @param t2 Time 2
 * @returns Returns 1 if t1 occurs is later than t2. Returns -1 if t2 occurs later than t1. Returns 0 if t1 and t2 occur on the same date
 */
export function compareTimes(t1: Time, t2: Time): number {
    if (t1.hour > t2.hour) {
        return 1;
    } else if (t2.hour > t1.hour) {
        return -1;
    } else if (t1.minute > t2.minute) {
        return 1;
    } else if (t2.minute > t1.minute) {
        return -1
    } else if (t1.second > t2.second) {
        return 1;
    } else if (t2.second > t1.second) {
        return -1;
    } else {
        return 0;
    }
}

/**
 * Compares 2 events and returns and 0, 1 or -1 depending on the chornological order of the events.
 * @param e1 event 1
 * @param e2 event 2
 * @returns Returns 1 if e1 occurs is later than e2. Returns -1 if e2 occurs later than e1. Returns 0 if e1 and e2 occur on the same date and
 * time
 */
export function compareEventTimes(e1: CalendarEvent, e2: CalendarEvent): number {
    let comparisonResult = compareDates(e1.date, e2.date);
    if (comparisonResult != 0)
        return comparisonResult;

    comparisonResult = compareTimes(e1.startTime, e2.startTime)
    return comparisonResult;
}

/**
 * Increments the provided date by 1 day and returns the new decremented date
 * @param date Date to increase
 * @returns CalendarDate object with the incremented date
 */
export function incrementDateByOne(date: CalendarDate): CalendarDate {
    let { year, month, date: d } = date;

    let monthEndDate = 0;
    if (month == 1)
        if (isLeapYear(year))
            monthEndDate = 29;
        else
            monthEndDate = 28;
    else if (thirtyDayMonths.includes(month))
        monthEndDate = 30;
    else
        monthEndDate = 31;

    if (d < monthEndDate) {
        d++;
        return { year, month, date: d };
    } else {
        d = 1; // roll the date over to the first of the next month
    }

    if (month < 11) {
        month++;
        return { year, month, date: d };
    } else {
        month = 0;
        year++;
    }

    return { year, month, date: d };
}

/**
 * Decrements the provided date by 1 day and returns the new decremented date
 * @param date Date to decrease
 * @returns CalendarDate object with the decremented date
 */
export function decrementDateByOne(date: CalendarDate): CalendarDate {
    let { year, month, date: d } = date;

    if (d > 1) {
        d--;
        return { year, month, date: d };
    }

    if (month > 0)
        month--;
    else {
        month = 11;
        year--;
    }

    // find the last new of the previous month
    if (month == 1)
        if (isLeapYear(year))
            d = 29;
        else
            d = 28;
    else if (thirtyDayMonths.includes(month))
        d = 30;
    else
        d = 31;

    return { year, month, date: d };
}

/**
 * Converts a CalendarDate object to a string with the format yyyymmdd
 * @param date date to convert to a string
 * @returns string containing the CalendarDate in the format yyyymmdd
 */
export function dateToString(date: CalendarDate): string {
    const { year, month, date: d } = date;
    return `${year.toString().padStart(4, '0')}${month.toString().padStart(2, '0')}${d.toString().padStart(2, '0')}`;
}

/**
 * Converts a string of format yyyymmdd to a CalendarDate object
 * @param dateString String of format yyyymmdd to be converted
 * @returns CalendarDate object that represents dateString
 */
export function dateStringToDate(dateString: string): CalendarDate {
    const regex = /^\d{8}$/;
    if (!regex.test(dateString))
        throw Error(`${dateString} does not fit the format yyyymmdd`);
    return {
        year: parseInt(dateString.substring(0, 4)),
        month: parseInt(dateString.substring(4, 6)),
        date: parseInt(dateString.substring(6))
    }
}

/**
 * Converts a Time object to a 4 character string with the format HHMM
 * @param time Time object to convert to string
 * @returns
 */
export function timeToString(time: Time): string {
    if (validateTime(time))
        throw new Error('Invalid time provided');
    const { hour, minute } = time;
    return `${hour < 10 ? '0' : ''}${hour}${minute < 10 ? '0' : ''}${minute}`;
}

/**
 * Converts a time string of format HHMM to a Time object.
 * @param timeString String of format HHMM to be converted
 * @returns Time object represents timeString
 */
export function timeStringToTime(timeString: string): Time {
    const regex = /^\d{4}$/;
    if (!regex.test(timeString))
        throw Error(`${timeString} does not fit the format HHMM`);

    const hour = parseInt(timeString.substring(0, 2));
    if (hour > 23)
        throw Error(`hour cannot be larger than 23 in ${timeString}`);

    const minute = parseInt(timeString.substring(2));
    if (minute > 59)
        throw Error(`minute cannot be larger than 59 in ${timeString}`);

    return {
        hour,
        minute,
        second: 0
    }
}

/**
 * Gets a string indicating which day of the week the specified date is.
 * @param date Date to find out which day it belongs to.
 * @returns Day that the specified date falls on.
 */
export const getDayOfDate = (date: CalendarDate): string => ['Sunday', 'Monday', 'Tuesday',
    'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date(date.year, date.month, date.date).getDay()
];