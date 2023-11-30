import { Box, Typography, BoxProps, Modal, SxProps, Theme, CircularProgress } from '@mui/material';
import { useState, useRef, useEffect, useContext, useMemo, useCallback, useLayoutEffect } from 'react';

import { appContext } from '../../contexts';

import { compareDates, eventvalidation } from '../../../util';
import { CalendarDate, CalendarEvent } from '../../../types';
import { getFirstDateOfCalendar, fetchDemoData } from './util';

import EventsManagerInterface from './eventsmanagerinterface';
import EventsManager from './eventsmanager';
import DemoEventsManager from './demoeventsmanager';

import CalendarControls from './CalendarControls';
import MonthlyView from './MonthlyView';
import CalendarEventViewer from './CalendarEventViewer';
import CalendarEventEditor from './CalendarEventEditor';

interface CalenderProps extends BoxProps {
    backgroundcolors?: string[]
    viewType?: 'yearly' | 'monthly' | 'weekly' | 'daily'
    initialDateToView?: CalendarDate
    weekStartingDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    demoMode?: boolean  // indicates if the calendar is running in the demo mode
}

const Calender = (props: CalenderProps) => {
    let { initialDateToView, demoMode } = props;

    const { deviceType, utility } = useContext(appContext);

    const pushNotification = utility.notifications.push;
    const handleError = utility.handleError;

    const [dateToView, setDateToView] = useState<CalendarDate>(() => {
        if (initialDateToView)
            return { ...initialDateToView };
        else {
            const today = new Date();  // view today by default if no date to display is provided
            return { year: today.getFullYear(), month: today.getMonth(), date: 1 }
        }
    });
    const [eventToView, setEventToView] = useState<CalendarEvent | null>(); // event that is viewed when a user clicks on an event
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(); // event that is being edited by the user
    const [newEvent, setNewEvent] = useState<CalendarEvent | null>();
    const [eventEditorError, setEventEditorError] = useState<string>('');
    const [availableSpace, setAvailableSpace] = useState<[number, number]>([0, 0]); // width, height available to render the calendar
    const [loading, setLoading] = useState(false); // indicates that a request was sent to the server to edit, create or delete an event

    // ref used to measure the size of the area that is available for the calendar
    const calendarViewRef = useRef<HTMLElement>({} as HTMLElement);

    // create a ref for storing the events manager both for demo and authenticated modes
    const eventsManagerRef = useRef<EventsManagerInterface>(demoMode ? new DemoEventsManager([]) : new EventsManager());
    let eventsManager = eventsManagerRef.current;

    // date string displayed along with the calendar
    const dateString = useMemo(() => {
        const dateObject = new Date(dateToView.year, dateToView.month);
        return `${dateToView.year}, ${dateObject.toLocaleDateString('default', { month: 'long' })}`
    }, [dateToView]);

    // create the sx prop
    let sx: SxProps<Theme> = useMemo(() => {
        let sx = {
            display: 'flex',
            flexDirection: 'column',
            borderTop: 1,
            borderLeft: 1,
            borderColor: "border.primary"
        };
        if (props.sx) {
            sx = Object.assign(sx, props.sx);
        }
        return sx;
    }, [props.sx]);

    // calculate the starting and the ending date of the dates range that will be displayed in the calendar
    const [startingDate, endingDate] = useMemo<[CalendarDate, CalendarDate]>(() => {
        let { year, month } = dateToView;
        const startingDate = getFirstDateOfCalendar(year, month);
        // it requires 42 days(6 weeks) in the calendar to display a month
        // therefore the ending date = starting date + 41 more days
        const endingDate = new Date(startingDate.year, startingDate.month, startingDate.date + 41);
        return [
            startingDate,
            { year: endingDate.getFullYear(), month: endingDate.getMonth(), date: endingDate.getDate() }
        ];
    }, [dateToView]);

    // array storing the events for the dates that are being displayed
    const [eventsToView, setEventsToDisplay] = useState<CalendarEvent[]>([]);

    // retrives the events to fetch for the given dates range
    const getEventsToView = () => {
        // first check if all events for the range of dates to be displayed are available locally
        const events = eventsManager.getEventsForRangeLocally(startingDate, endingDate);
        if (events) {
            // all events are available locally
            setEventsToDisplay(events);
            setLoading(false);
        } else {
            // not all events are available locally. retreieve the unavailble events over the network
            const dateToViewForCurrentCall: CalendarDate = { ...dateToView }; // store the current value of dateToView
            eventsManager.getEventsForRange(startingDate, endingDate)
                .then((events) => setEventsToDisplay(events))
                .catch((error) => handleError(error))
                .finally(() => {
                    // only update if current date that is being viewed is same as the date that the function was called for
                    // viewing. If the dates arent the same that means the user is viewing a different date
                    if (!compareDates(dateToView, dateToViewForCurrentCall))
                        setLoading(false);
                });
        }
    }

    // load the demo data if the app is running in the demo mode
    useEffect(() => {
        if (demoMode) {
            setLoading(true);
            fetchDemoData()
                .then(demoEvents => {
                    eventsManagerRef.current = new DemoEventsManager(demoEvents);
                    eventsManager = eventsManagerRef.current;
                    getEventsToView();
                })
                .catch(e => {
                    handleError(e);
                    setLoading(false);
                });
        }
    }, []);

    // retrieve the events that needs to be displayed when a new date is set to be viewed
    useEffect(() => {
        setLoading(true);
        getEventsToView();
    }, [dateToView]);

    // callback that is called when an event on the calendar is clicked by the user
    const onClickCalendarItem = useCallback(
        (eventId: string) => setEventToView(eventsManager.getEventFromId(eventId)),
        [eventsManagerRef.current]
    );

    // use a layout effect for determining the space available to render the calednar
    useLayoutEffect(() => {
        const boundingRect = calendarViewRef.current.getBoundingClientRect();
        setAvailableSpace([boundingRect.width, boundingRect.height]);

        // use an oberserver to keep track of window size changes so the correct amount of available space can be
        // passed to the calendar
        const observer = new ResizeObserver((e) => {
            const width = e[0].contentRect.width;
            const height = e[0].contentRect.height;
            if (availableSpace[0] != width || availableSpace[1] != height)
                setAvailableSpace([width, height]);
        });
        observer.observe(calendarViewRef.current);

        return () => observer.disconnect();
    }, []);

    let eventViewerOrEditor: JSX.Element | undefined; // used to display the event editor or viewer component
    if (eventToEdit) { // check if an event is chosen by the user to be edited
        eventViewerOrEditor = <CalendarEventEditor
            event={eventToEdit}
            onClickSave={(event) => {
                // callback for when the user clicks the save button on the event editor
                event.id = eventToView?.id;
                const validatorResult = eventvalidation.validateNewEvent(event);
                if (validatorResult.success != true) {
                    // new event data is not valid
                    setEventEditorError(validatorResult.errorMessage);
                } else {
                    setLoading(true);
                    setEventEditorError('');
                    eventsManager.updateEvent(eventToEdit.id, validatorResult.parsedEvent)
                        .then(() => {
                            getEventsToView();
                            setEventToEdit(null);
                            setEventToView(validatorResult.parsedEvent);
                            pushNotification({ text: "Updated Event", severity: "success" });
                        })
                        .catch(handleError)
                        .finally(() => setLoading(false));
                }
            }}
            onClickClose={() => { setEventToEdit(null); setEventEditorError(''); }}
            errorMessage={eventEditorError}
            disabled={loading}
        />;
    } else if (eventToView) { // check if an event is chosen by the user for viewing
        eventViewerOrEditor = <CalendarEventViewer
            event={eventToView}
            onClickEdit={() => setEventToEdit(eventToView)}
            onClickClose={() => setEventToView(null)}
            onClickDelete={(id) => eventsManager.removeEvent(id)
                .then(() => {
                    setLoading(true);
                    getEventsToView();
                    setEventToView(null);
                    pushNotification({ text: 'Deleted Event', severity: 'success' });
                })
                .catch(handleError)
                .finally(() => setLoading(false))
            }
        />;
    } else if (newEvent) {
        eventViewerOrEditor = <CalendarEventEditor
            event={newEvent}
            onClickSave={(event) => {
                const validatorResult = eventvalidation.validateNewEvent(event);
                if (validatorResult.success != true) {
                    // new event data is not valid
                    setEventEditorError(validatorResult.errorMessage);
                } else {
                    setLoading(true);
                    setEventEditorError('');
                    eventsManager.addEvent(validatorResult.parsedEvent!)
                        .then(() => {
                            getEventsToView();
                            setNewEvent(null);
                            pushNotification({ text: 'Created Event', severity: 'success' });
                        }).catch(handleError)
                        .finally(() => setLoading(false));
                }
            }}
            onClickClose={() => { setNewEvent(null); setEventEditorError(''); }}
        />
    }

    // callback functions that are used in the by the calendar conttrols
    const onClickNextMonth = useCallback(() => setDateToView((dateToView) => {
        const dateObject = new Date(dateToView.year, dateToView.month + 1);
        return { year: dateObject.getFullYear(), month: dateObject.getMonth(), date: 1 };
    }), []);
    const onClickPreviousMonth = useCallback(() => setDateToView((dateToView) => {
        const dateObject = new Date(dateToView.year, dateToView.month - 1);
        return { year: dateObject.getFullYear(), month: dateObject.getMonth(), date: 1 };
    }), []);
    const onClickAddEvent = useCallback(() =>
        setNewEvent({ id: '', title: '', date: { ...dateToView }, startTime: { hour: 6, minute: 0, second: 0 } }),
        [dateToView]);

    return (
        <Box sx={sx}>
            <Box sx={{ display: 'flex' }}> { /* Display the calendar control buttons */}
                <CalendarControls
                    onClickBack={onClickPreviousMonth}
                    onClickForward={onClickNextMonth}
                    onClickAdd={onClickAddEvent}
                />
                <Typography component='h1' variant='h5' sx={{ lineHeight: '40px' }}>{dateString}</Typography> { /*current date string */}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 0' }} ref={calendarViewRef}> {/* week rows */}
                {loading ?
                    /* display the loader if loading state is set */
                    <Box sx={{
                        position: 'absolute',
                        width: `${availableSpace[0]}px`,
                        height: `${availableSpace[1]}px`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <CircularProgress />
                    </Box> : null
                }
                <MonthlyView
                    dateToView={dateToView}
                    eventsToView={eventsToView}
                    availableSpace={availableSpace}
                    mobile={deviceType}
                    onClickCalendarItem={onClickCalendarItem}
                />
            </Box>
            {
                /* display the event viewer or the editor if one of them are visible */
                eventViewerOrEditor ?
                    <Modal open={true} sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Box sx={{
                            backgroundColor: 'background.light',
                            padding: '2rem',
                            paddingTop: !eventToEdit && eventToView ? '0.5rem' : '',
                            borderRadius: '0.3rem',
                        }}>
                            {eventViewerOrEditor}
                        </Box>
                    </Modal> : null
            }
        </Box>
    );
}

export default Calender;