/**
 * Allows the user to edit the attributes of an event
 * The editable attributes are the title, description, event date, event start time, event end time,event color
 */
import { useCallback } from "react";

import { Box, TextField, Button, Typography } from "@mui/material";
import { CalendarEvent } from "../../../types";
import { convertDateToIiSOString, convertTimeToString } from "../../util";
import { TimeFormat } from "../../../types";

interface CalendarEventEditorProps {
    event: CalendarEvent
    onClickSave?: (eventData: Partial<CalendarEvent>) => void
    onClickClose?: () => void
    errorMessage?: string // invalid input error message
    disabled?: boolean
}

const CalendarEventEditor = (props: CalendarEventEditorProps) => {
    const { event, onClickSave = () => { }, onClickClose = () => { }, errorMessage, disabled = false } = props;
    const { title = "", description = "" } = event;

    const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);

        // parse date inputs (year, month, date) to int
        const dateInputs = data.get('date')?.toString().split('-');
        const dateInputsInt = dateInputs ? dateInputs?.map(section => parseInt(section)) : [0, 0, 0];

        // parse time inputs (hour, minute) to int
        const timeInputs = data.get('startTime')?.toString().split(':');
        const timeInputsInt = timeInputs ? timeInputs?.map(section => parseInt(section)) : [0, 0];

        const updatedEvent: Partial<CalendarEvent> = {
            ...event,
            title: data.get('title')?.toString(),
            description: data.get('description')?.toString(),
            date: { year: dateInputsInt[0], month: dateInputsInt[1] - 1, date: dateInputsInt[2] },
            startTime: { hour: timeInputsInt[0], minute: timeInputsInt[1], second: 0 }
        };
        onClickSave(updatedEvent);
    }, []);

    return (
        <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: '100%',
                pb: '0.5rem',
                gap: "0.5rem"
            }}
        >
            <Box display={'flex'} alignItems={"center"}>
                <TextField
                    autoFocus
                    name="title"
                    label="Title"
                    required
                    placeholder="Title"
                    autoComplete="off"
                    variant="filled"
                    size="small"
                    defaultValue={title}
                    sx={{ flexGrow: 1, mr: '0.75rem' }}
                    disabled={disabled}
                />
                <Button
                    aria-label="save changes"
                    type="submit"
                    variant="contained"
                    sx={{ ml: '0.5rem' }}
                    size="large"
                    disabled={disabled}
                >
                    Save
                </Button>
                <Button
                    aria-label="close"
                    variant="contained"
                    sx={{ ml: '0.5rem' }}
                    size="large"
                    color="error"
                    onClick={onClickClose}
                    disabled={disabled}
                >
                    Close
                </Button>
            </Box>
            {errorMessage ? <Typography component="span" color="text.error">{errorMessage}</Typography> : null}
            <Box display="flex" gap={0.5}>
                <TextField
                    name="date"
                    label="Date"
                    type="date"
                    autoComplete="off"
                    defaultValue={convertDateToIiSOString(props.event.date)}
                    variant="outlined"
                    size="small"
                    disabled={disabled}
                />
                <TextField
                    name="startTime"
                    label="Time"
                    type="time"
                    autoComplete="off"
                    defaultValue={convertTimeToString(props.event.startTime, TimeFormat.TwentyFourHours).substring(0, 5)}
                    variant="outlined"
                    size="small"
                    disabled={disabled}
                />
            </Box>
            <TextField
                name="description"
                label="Description"
                placeholder="Description"
                autoComplete="off"
                multiline
                rows={7}
                defaultValue={description}
                variant="outlined"
                size="small"
                disabled={disabled}
            />
        </Box>
    );
}

export default CalendarEventEditor;