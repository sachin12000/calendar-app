/**
 * Component that displays an individual event
 */
import { memo } from 'react';
import { blue } from '@mui/material/colors'
import { Typography } from '@mui/material';

export interface CalendarItemProps {
    id: string
    title?: string
    backgroundColor?: string
    color?: string
    onClick?: (id: string) => void
}

const CalendarItem = memo(({ id, title = '(No Title)', backgroundColor = blue[600], color = 'white', onClick = (id) => { } }: CalendarItemProps) => {
    return (
        <Typography
            component='span'
            onClick={() => onClick(id)}
            sx={{
                backgroundColor,
                color,
                fontWeight: 'fontWeightBold',
                fontSize: '0.75rem',
                lineHeight: "1.5rem",
                borderRadius: '0.25rem',
                paddingLeft: '0.2rem',
                paddingRight: '0.2rem',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                '&:hover': {
                    opacity: 0.9,
                    cursor: 'pointer'
                }
            }}>
            {title}
        </Typography>
    );
});

export default CalendarItem;