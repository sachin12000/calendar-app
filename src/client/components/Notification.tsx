import { Alert, Fade } from '@mui/material';
import { useEffect, useState, useContext } from 'react';

import { NotificationType } from '../types';

import { appContext } from '../contexts';

interface NotificationComponentProps {
    notification: NotificationType,
    onFadeOut?: () => void // called after the end of the notification's fade out animation
    onClose?: () => void // called after the end of the notification's fade out animation
}

// Notification view that displays the notification text
const NotificationComponent = ({ notification, onFadeOut = () => { }, onClose = () => { } }: NotificationComponentProps) => {
    const [visible, setVisible] = useState<boolean>(true);

    const { text, severity, stayOnTimeMs = 2000, fadeOutTimeMs = 250 } = notification;

    useEffect(() => {
        if (!visible)
            setVisible(true);
        const timeOut = setTimeout(() => setVisible(false), stayOnTimeMs);
        return () => clearTimeout(timeOut);
    }, [notification]);

    return <Fade
        in={visible}
        timeout={fadeOutTimeMs}
        onExited={onFadeOut}
    >
        <Alert
            severity={severity}
            onClose={onClose}
            sx={{ pointerEvents: 'all' }}
        >
            {text}
        </Alert>
    </Fade>;
}

// component responsible handling component queue and passing the notification data to the notification view
const NotficationController = () => {
    const notificationsQueue = useContext(appContext).utility.notifications;
    const [notificationToDisplay, setNotificationToDisplay] = useState<NotificationType | null>(null);

    // called when a notification is ended. Displays the next notification if one is available in the queue
    const onNotificationEnd = () => {
        const notification = notificationsQueue.shift();
        if (notification) {
            setNotificationToDisplay(notification);
        } else if (notificationToDisplay)
            setNotificationToDisplay(null); // no more notifications to display
    }

    useEffect(() => {
        const id = notificationsQueue.addOnPushCallback(() => {
            const notification = notificationsQueue.shift();
            if (notification)
                // new notification added and no notifications are currently being displayed
                // so start the notification displaying process
                setNotificationToDisplay(notification);
        });

        onNotificationEnd(); // this call causes to start displaying notifications if there are notifications in the queue

        return () => notificationsQueue.removeOnPushCallback(id);
    }, []);
    return notificationToDisplay ? <NotificationComponent
        notification={notificationToDisplay}
        onClose={onNotificationEnd}
        onFadeOut={onNotificationEnd}
    /> : null;
}

export default NotficationController;