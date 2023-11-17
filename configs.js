/**
 * This file contains the different configurations used by the App.
 * The configuration is placed in the app as text replace by Webpacks's DefinePlugin
 */

const projectId = 'calendar-app-85893';
const emulatorIp = '127.0.0.1';
const development = {
    mode: 'development',
    apiKey: 'test',
    projectId,
    authDomain: "",
    appId: "",
    authEmulatorHost: emulatorIp,
    authEmulatorPort: 9099,
    firestoreHost: emulatorIp,
    firestorePort: 8080
}

const production = {
    mode: 'production',
    apiKey: "",
    projectId,
    authDomain: "",
    appId: "",
    authEmulatorHost: '',
    authEmulatorPort: 0,
    firestoreHost: '',
    firestorePort: 0
}

module.exports = {
    development,
    production
}