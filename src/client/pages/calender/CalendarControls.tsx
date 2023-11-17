/**
 * Calendar controls compoenents displayed at the top of calendar
 */
import { memo } from 'react';

import { IconButton } from '@mui/material';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import AddCircleIcon from '@mui/icons-material/AddCircle';

interface CalendarControlsProps {
    onClickBack?: () => void  // back button callback
    onClickForward?: () => void // forward button callback
    onClickAdd: () => void // add new event button callback
}

export default memo(({ onClickBack, onClickForward, onClickAdd }: CalendarControlsProps) =>
    <>
        <IconButton
            aria-label="previous month"
            component="button"
            color="primary"
            onClick={onClickBack}
        >
            <ArrowBackIosIcon />
        </IconButton>
        <IconButton
            aria-label="next month"
            component="button"
            color="primary"
            onClick={onClickForward}
        >
            <ArrowForwardIos />
        </IconButton>
        <IconButton
            aria-label="create event"
            component="button"
            color="primary"
            onClick={onClickAdd}
        >
            <AddCircleIcon />
        </IconButton>
    </>
);