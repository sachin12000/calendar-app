import { CalendarDate, Time, TimeFormat } from '../../types';

export function convertDateToIiSOString(date: CalendarDate): string {
    const { year, month } = date;
    const dateStrings = [month + 1, date.date].map(dateSegment => dateSegment < 10 ? `0${dateSegment}` : dateSegment.toString());
    return `${year}-${dateStrings[0]}-${dateStrings[1]}`;
}

/**
 * Converts the given time to a string of format HH:MM:SSTIMESUFFIX or in 12 hour format or HH:MM:SS in 24 hour format
 * @param time Time object to convert to string to.
 * @param timeFormat TimeFormat enum value specifying whether to convert to 12 hour or 24 hour format.
 * @returns String that indicates the given time in the specified format
 */
export function convertTimeToString(time: Time, timeFormat: TimeFormat = TimeFormat.TwelveHours): string {
    let { hour, minute, second } = time;
    let timeSuffix = '';
    if (timeFormat == TimeFormat.TwelveHours) {
        if (hour >= 12) {
            if (hour > 12)
                hour -= 12;
            timeSuffix = 'PM';
        } else {
            timeSuffix = 'AM';
        }
    }

    // convert the int time values to strings. add a preceeding 0 to values that are only 1 digit long
    const timeStrings = [hour, minute, second].map(timeSegment => timeSegment < 10 ? `0${timeSegment}` : timeSegment.toString());
    return `${timeStrings[0]}:${timeStrings[1]}:${timeStrings[2]}${timeSuffix}`;
}

/**
 * Converts an input of type string | null | undefined to a string.
 * Useful for parsing inputs form FormData text fields. FormData returns null for empty text fields.
 * @param inputText text input that is of type string | null | undefined
 * @returns inputText as is if it is a non-empty string. Returns an empty string if the inputText is an
 * empty string, null or undefined
 */
export const parseTextFieldInput = (inputText?: string | null): string => inputText ? inputText : '';