import { createContext, ReactNode } from 'react';

import { UtilityType, createUtilityState } from "./utlity";
import { DeviceTypeType, createDeviceTypeState } from "./deviceType";
import { AuthContextValues, createAuthState } from './auth';

interface AppContextValues {
    utility: UtilityType
    deviceType: DeviceTypeType
    auth: AuthContextValues
}

export const appContext = createContext<AppContextValues>({} as AppContextValues);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
    return <appContext.Provider value={{
        utility: createUtilityState(),
        deviceType: createDeviceTypeState(),
        auth: createAuthState()
    }}>
        {children}
    </appContext.Provider>
}