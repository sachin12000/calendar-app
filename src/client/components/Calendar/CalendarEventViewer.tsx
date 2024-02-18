/**
 * Displays an event in detail
 * The displayed data are the title, description, event date, event start time, event end time,event color
 */
import { Box, Typography, IconButton } from "@mui/material";
import { CalendarEvent } from "../../../types";
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

import { getDateSuffix } from "./util";

interface EventEditorModalProps {
    event: CalendarEvent
    color?: string
    onClickEdit?: (eventId: string) => void
    onClickClose?: (eventId: string) => void
    onClickDelete?: (eventId: string) => void
}

const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarEventViewer = (props: EventEditorModalProps) => {
    let { id, title, description, color } = props.event;
    const { onClickEdit = () => { }, onClickClose = () => { }, onClickDelete = () => { } } = props;
    const { month, date } = props.event.date;
    let { hour, minute } = props.event.startTime;

    // create the title component
    const titleSpan = title ?
        <Typography component="span" variant="h6" lineHeight={1} sx={{ wordWrap: 'anywhere' }}>{title}</Typography> :
        <Typography component="span" variant="h6" color='text.disabled' lineHeight={1} sx={{ wordWrap: 'anywhere' }}>(No Title)</Typography>;

    // convert to date to a string
    const dateString = `${months[month]} ${date}${getDateSuffix(date)}`;

    // convert the time to a string
    let timeString;
    let timeSuffix;
    if (hour >= 12) {
        if (hour > 12)
            hour -= 12;
        timeSuffix = 'PM';
    } else {
        timeSuffix = 'AM';
    }
    timeString = hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + timeSuffix;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}>
            <Box sx={{ alignSelf: 'end' }}>
                {/* Display the event viewer control buttons edit, delete and closer view */}
                <IconButton
                    aria-label="edit event"
                    component="button"
                    color="primary"
                    onClick={() => onClickEdit(id)}
                >
                    <Edit />
                </IconButton>
                <IconButton
                    aria-label="delete event"
                    component="button"
                    color="primary"
                    onClick={() => onClickDelete(id)}
                >
                    <DeleteIcon />
                </IconButton>
                <IconButton aria-label="close event view"
                    component="button"
                    color="primary"
                    onClick={() => onClickClose(id)}
                >
                    <Close />
                </IconButton>
            </Box>
            {titleSpan}
            <Typography component="span" variant="subtitle1" lineHeight={1}>
                {`${dateString}, ${timeString}`}
            </Typography>
            {
                description ?
                    <Typography component="p" variant="subtitle1" lineHeight={1} sx={{ wordWrap: 'anywhere' }}>
                        {description}
                    </Typography>
                    : null
            }
        </Box>
    );
}

export default CalendarEventViewer;