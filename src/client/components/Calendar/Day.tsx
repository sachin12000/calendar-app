import { ReactElement, Fragment, useCallback, useState, useRef, useEffect, useMemo, memo } from "react";

import { Box, IconButton, Typography, useTheme, ClickAwayListener } from "@mui/material";
import Close from '@mui/icons-material/Close';

import { CalendarEvent } from "../../../types";
import { getDayOfDate } from "../../../util";
import CalendarItem from "./CalendarItem";

interface DayProps {
    date: number // date number that is displayed at the top
    events?: CalendarEvent[] // events scheduled for the particular date
    availableHeight: number // height available to render the day

    onClickCalendarItem?: (eventId: string) => void // called when a calendar item is clicked
}

const Day = memo((props: DayProps) => {
    const { date, events, onClickCalendarItem = () => { } } = props;
    let { availableHeight } = props;

    // popper that displays all events if there isn't enough space to display them on the component itself
    const [popperVisible, setPopperVisible] = useState<boolean>(false);
    // how much to transform the popper. this is calculated based on the position of the Day compoentn
    const [popperTransformAmount, setPopperTransformAmount] = useState<[number, number] | null>(null);

    const mainContainerRef = useRef<Element | undefined>();  // ref to popper parent
    const popperRef = useRef<Element | undefined>();  // ref to popper

    const fontSize = useTheme().typography.htmlFontSize;

    useEffect(() => {
        // calculate amount to translate the popper to fit inside the screen if the popper overflows
        if (popperVisible && mainContainerRef.current && popperRef.current) {
            const { left, top, } = mainContainerRef.current.getBoundingClientRect();
            const { width, height } = popperRef.current.getBoundingClientRect();

            const availableWidth = window.screen.availWidth - left;  // amount of width available to render the popper
            const availableHeight = window.screen.availHeight - top;  // amount of height available to render the popper

            let deltaX = -fontSize * 0.2, deltaY = 0;
            if (availableWidth < width) // check if popper overflows horizontally
                deltaX = width - availableWidth;
            if (availableHeight < height) // check if popper overflows vertically
                deltaY = height - availableHeight;
            setPopperTransformAmount([deltaX, deltaY]);
        }
    }, [popperVisible]);

    // callback that is called when display all events button is clicked
    const onClickDisplayAll = useCallback(() => setPopperVisible(true), []);

    // render the calendar events
    const renderedEvents = useMemo<ReactElement | null>(() => {
        // All events are rendered inside the Day component if there is enough space
        // A button to display all events is displayed if there isn't enough space
        if (!events) {
            return null;
        }
        else {
            // calculate how many events can be displayed in the available height
            availableHeight -= fontSize * 1.5; // substract the date label height
            availableHeight -= 1; // substract the border bottom height
            availableHeight -= 2; // substract the padding-bottom

            // calculate the number of items that can be displayed in the available height. availableHeight / heightOfOneItem
            // heightOfOneItem = height of the fay compoennt + 2 pixel row gap
            let numberOfItems = Math.trunc(availableHeight / (fontSize * 1.5 + 2));

            if (numberOfItems == 0)
                return null;  // no space to display any items. no space to even display the display all events button
            else if (numberOfItems >= events.length)
                numberOfItems = events.length;  // all items can be rendered in the available height
            else
                numberOfItems -= 1; // not enough height to render all events. leave one space for the display all events button

            const calendarItems: ReactElement[] = [];
            for (let i = 0; i < numberOfItems; i++) {
                const item = events[i];
                calendarItems.push(
                    <CalendarItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        onClick={onClickCalendarItem}
                        backgroundColor={item.backgroundColor}
                    />
                );
            }

            // diplay a button to display all the items if the total number of items to be displayed takes up
            // more space than the available space.
            if (numberOfItems < events.length) {
                calendarItems.push(
                    <CalendarItem
                        key="more"
                        id=""
                        title={`${events.length - numberOfItems} more`}
                        onClick={onClickDisplayAll}
                        color="black"
                        backgroundColor="transparent"
                    />
                );
            }

            return <Fragment>
                {...calendarItems}
            </Fragment>;
        }
    }, [events, availableHeight]);

    const closePopper = useCallback(() => {
        setPopperVisible(false);
        setPopperTransformAmount(null)
    }, []);

    return (
        <Box
            ref={mainContainerRef}
            sx={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 0',
                rowGap: '2px',
                borderRight: 1,
                borderBottom: 1,
                borderColor: 'border.primary',
                paddingLeft: '2px',
                paddingRight: '2px',
                paddingBottom: '2px',
            }}>
            {/* add date label */}
            <Typography
                variant='overline'
                component="span"
                sx={{
                    lineHeight: '1.5rem',
                    textAlign: 'center',
                    fontWeight: 'fontWeightBold',
                    color: 'grey.800'
                }}>
                {date}
            </Typography>
            {
                /* display calendar tasks */
                renderedEvents
            }
            {
                // display the events list popover if it's open
                popperVisible ?
                    <ClickAwayListener onClickAway={closePopper}>
                        <Box
                            sx={{
                                position: 'absolute',
                                width: screen.availWidth < 250 ? 'auto' : '250px',
                                transform: popperTransformAmount ?
                                    `translate(-${popperTransformAmount[0]}px, -${popperTransformAmount[1]}px)` : '',
                                visibility: popperTransformAmount ? 'visible' : 'hidden', // hide the element during layout measuring phase
                                display: 'flex',
                                flexDirection: 'column',
                                rowGap: '2px',
                                padding: '0.5rem 1rem 1rem 1rem',
                                backgroundColor: 'white'
                            }}
                            boxShadow={10}
                            ref={popperRef}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {/* display the title and close button */}
                                <Typography component="h5" variant="h5">{
                                    `${getDayOfDate(events![0].date)}, ${date.toString()}`
                                }
                                </Typography>
                                <IconButton
                                    aria-label="close events list"
                                    sx={{ padding: 0 }}
                                    component="button"
                                    color="primary"
                                    onClick={closePopper}
                                >
                                    <Close />
                                </IconButton>
                            </Box>
                            {
                                // display the events
                                events?.map((item) => <CalendarItem
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    onClick={onClickCalendarItem}
                                    backgroundColor={item.backgroundColor}
                                />)
                            }
                        </Box>
                    </ClickAwayListener> : null
            }
        </Box>
    );
});

export default Day;