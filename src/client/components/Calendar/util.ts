import { CalendarDate } from '../../../types';

/**
 * Generates an array of dates that starts from startingDate and continues for numberOfDays
 * @param startingDate date to start generating from
 * @param numberOfDays number of days to generate
 * example: generateDateArray({2023, 3, 25}, 10) returns [25, 26, 27, 28, 29, 30, 1, 2, 3, 4]
 */
export function generateDateArray(startingDate: CalendarDate, numberOfDays: number): CalendarDate[] {
    let { year, month, date: monthStartingDate } = startingDate;
    const datesArray: CalendarDate[] = [];

    while (numberOfDays > 0) {
        let monthEndingDate = new Date(year, month + 1, 0).getDate();  // last day of month
        const dayCount = monthEndingDate - monthStartingDate + 1;
        const loopEndDate = monthStartingDate + (dayCount < numberOfDays ? dayCount : numberOfDays);
        for (let day = monthStartingDate; day < loopEndDate; day++)
            datesArray.push({ year, month, date: day });

        month++;
        if (month == 12) {
            month = 0;
            year++;
        }
        monthStartingDate = 1;
        numberOfDays -= dayCount;
    }

    return datesArray;
}

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
 * Gets the suffix for the specified date.
 * @param date date to which the suffix is needed.
 * @returns st, nd, rd or th depending on the date. (example: would return st for 21, would return th for 15)
 */
export function getDateSuffix(date: number): string {
    if (date == 1 || date == 21 || date == 31)
        return 'st';
    else if (date == 2 || date == 22)
        return 'nd';
    else if (date == 3 || date == 23)
        return 'rd';
    else
        return 'th';
}