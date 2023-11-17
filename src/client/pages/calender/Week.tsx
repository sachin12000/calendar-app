import { Box, Typography } from '@mui/material';
import CalendarItem from './CalenderItem';
import { CalendarEvent } from '../../../types';

const colors = [
    'rgb(213,0,0)',
    'rgb(230,124,115)',
    'rgb(244,81,30)',
    'rgb(246,191,38)',
    'rgb(51,182,121)',
    'rgb(11,128,67)',
];

export interface WeekProps {
    id: string
    days: [number, CalendarEvent[]][] // [date, events list for that date. undefined if no events are scheduled for that date]
    onClickCalendarItem?: (weekId: string, calendarEvent: CalendarEvent) => void  // callback to be called when a calender item is clicked
}

export const Week = ({ id: weekId, days, onClickCalendarItem = () => { } }: WeekProps) => {
    return (
        <Box display="flex" flex={'1 1 0'} minHeight={0}>
            {
                // add individual days
                days.map(date =>
                    <Box
                        key={date[0]}
                        sx={{
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: '2px',
                            flex: '1 1 0',
                            borderRight: 1,
                            borderBottom: 1,
                            borderColor: 'border.primary'
                        }}>
                        {/* add date label */}
                        <Typography
                            variant='overline'
                            component="span"
                            sx={{
                                marginBottom: '-2px',
                                textAlign: 'center',
                                fontWeight: 'fontWeightBold',
                                color: 'grey.800'
                            }}>
                            {date[0]}
                        </Typography>
                        {/* add individual calendar tasks */}
                        {
                            date[1]?.map((item) =>
                                <CalendarItem
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    onClick={(id) => onClickCalendarItem(weekId, item)}
                                    backgroundColor={item.backgroundColor}
                                />
                            )
                        }
                    </Box>
                )
            }
        </Box>
    );
}

export default Week;