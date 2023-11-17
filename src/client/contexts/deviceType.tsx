/**
 * Context that keeps track of the current display area size and updates the device type based on it
 */
import { useState, useEffect } from 'react';

export type DeviceTypeType = boolean;

export const createDeviceTypeState = (): DeviceTypeType => {
    const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 599px)").matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 599px)");
        const eventListener = (e: MediaQueryListEvent) => setIsMobile(e.matches);;
        mediaQuery.addEventListener("change", eventListener);
        return () => mediaQuery.removeEventListener("change", eventListener);;
    }, []);

    return isMobile;
}