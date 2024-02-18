/**
 * Monthly view of the calendar
 */
import { useMemo, Fragment, useCallback } from "react";
import { Box, useTheme } from "@mui/material"

import { CalendarDate, CalendarEvent } from "../../../types"
import { compareDates } from "../../../util"

import Days from './Days';  // component that views day labels, sunday, monday, tuesday, etc...
import Day from './Day';  // component that views events for a single date in the calendar
import { getFirstDateOfCalendar, generateDateArray } from "./util";

interface MonthlyViewProps {
    dateToView: CalendarDate,
    eventsToView: CalendarEvent[],
    availableSpace: [number, number],  // , height available to render the calendar
    mobile?: boolean
    onClickCalendarItem: (id: string) => void
}

export default ({ dateToView, eventsToView, onClickCalendarItem, availableSpace, mobile = false }: MonthlyViewProps) => {
    // calculate the array of dates that are displayed in the calendar
    // the array contains 42 dates because calendar displays 6 weeks
    const datesToDisplay = useMemo(() => {
        // first date that is displayed in the calendar
        const calendarStartingDate = getFirstDateOfCalendar(dateToView.year, dateToView.month);
        return generateDateArray(calendarStartingDate, 42)
    }, [dateToView]);

    const fontSize = useTheme().typography.htmlFontSize;

    // calculate the height available for each Day component
    const [dayComponentWidth, dayComponentHeight] = useMemo(() => {
        let [width, height] = availableSpace;
        height -= fontSize * 1.875 + 2;  // substract the date label height
        return [width / 7, height / 6]; // the dates are displayed in a 7x6 grid
    }, [availableSpace]);


    // callback that is called when display all events button is pressed on a Day where there is not enough space
    // to display all events
    const onClickDisplayAll = useCallback((date: CalendarDate) => {
        const { year: y1, month: m1, date: d1 } = date;
        let index = 0; // index of date in datesToDisplay
        for (; index < datesToDisplay.length; index++) {
            const { year: y0, month: m0, date: d0 } = datesToDisplay[index];
            if (d0 == d1 && m0 == m1 && y0 == y1)
                break;
        }

        // find the events that occur on the specified date
        let i0 = 0, i1;
        for (; i0 < eventsToView.length; i0++) {
            const { year: y0, month: m0, date: d0 } = eventsToView[i0].date;
            if (d0 == d1 && m0 == m1 && y0 == y1)
                break;
        }
        for (i1 = i0 + 1; i1 < eventsToView.length; i1++) {
            const { year: y0, month: m0, date: d0 } = eventsToView[i1].date;
            if (d0 != d1 || m0 != m1 || y0 != y1)
                break;
        }

        // calculate the x, y coordinates of the Day component that called the callback
        let x = (index % 7) * dayComponentWidth;
        let y = Math.trunc(index / 7) * dayComponentHeight;
    }, [eventsToView, datesToDisplay]);


    // memonize the rows of the calendar since they do not need to be re-rendered if the eventsToView are the same
    const weeks = useMemo(() => {
        let i0 = 0, i1 = 0;
        return Array.from(Array(6).keys()).map(i => { // render each individual week (6 weeks in total)
            return <Box key={i} display='flex' flex='1 1 0' minWidth={0}>
                {
                    Array.from(Array(7).keys()).map(j => { // render 7 days
                        const date: CalendarDate = datesToDisplay[i * 7 + j];
                        const { year, month, date: d } = date;
                        let events: CalendarEvent[] | undefined;
                        if (i0 < eventsToView.length && !compareDates(eventsToView[i0].date, date)) {
                            // events are available for the date datesToDisplay[i * 7 + j]
                            // figure out which slice of the array contain events for the date
                            for (; i1 < eventsToView.length && !compareDates(eventsToView[i1].date, date); i1++);
                            events = eventsToView.slice(i0, i1);
                            i0 = i1;
                        }
                        return <Day
                            key={`${year}${month}${d}`}
                            date={d}
                            events={events}
                            availableHeight={dayComponentHeight}
                            onClickCalendarItem={onClickCalendarItem}
                        />
                    })
                }
            </Box>
        })
    }, [eventsToView]);

    return <>
        <Days mobile={mobile} /> {/* the day lables Monday, Tuesday, etc... */}
        {
            weeks
        }
    </>;
}
