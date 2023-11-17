# Firebase back end configs and other files

This directory contains the configs that are deployed to Firebase and the Firebase emulators for use during development and testing.

- *firebase.json* is the main settings file for the project
  - *"firestore.rules"* field specifies the rules that are used by the Firestore. This Firestore rules file will be deployed when deploying the project.
  - *"hosting.public"* specifies the directory that contains the files that will be deployed to Firebase Hosting when deploying the project.
  - The "emulators" field contains the settings for the emulators
    - Ensure that the *"host"* and *"port"* fields are properly set to ensure that the front-end can connect to the emulators during devlopment and testing. The settings for the front-end can be set in *configs.js* in the main directory.
    - There can be CORS issues if *"host"* and *"port"* are not set properly.
- *dummy_data* directory contains data for 10 test users that can be used during development and testing.
  - Credentials for the test users can be found in *test_users_credentials.txt* in the main directory.
  - `npm run emulators` will import this data through the flag `--import=`