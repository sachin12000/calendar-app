import { Box, Typography } from '@mui/material';
import { memo } from 'react';

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// text that is displayed on the top of the calendar with day labels. example: sunday, monday, etc...
const Days = memo(({ startingDayIndex = 0, mobile }: { startingDayIndex?: 0 | 1 | 2 | 3 | 4 | 5 | 6, mobile?: boolean }) => {
    const dayLabels = mobile ?
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndeces = startingDayIndex > 0 ?
        Array.from(Array(7).keys()).map((i) => (i + startingDayIndex) % 7) : Array.from(Array(7).keys());

    return (
        <Box display="flex" flex='0 1 auto' minHeight={0} >
            {
                dayIndeces.map((i) =>
                    <Typography
                        variant='overline'
                        component="span"
                        key={dayKeys[i]}
                        sx={{
                            lineHeight: "1.875rem",
                            textAlign: 'center',
                            fontWeight: 'fontWeightBold',
                            color: 'grey.800',
                            minWidth: 0,
                            flex: 1,
                            borderTop: 1,
                            borderRight: 1,
                            borderBottom: 1,
                            borderColor: 'border.primary',
                            overflow: 'hidden',
                            textOverflow: 'clip'
                        }}>
                        {dayLabels[i]}
                    </Typography>
                )
            }
        </Box>
    );
});

export default Days;