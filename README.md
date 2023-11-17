# Calendar App
Calendar app is an app that allows the its users to manage their events in a hassle free manner.

Built with React, MUI, Typescript and Firebase using the best software development practices.

# How to set configuration values
- Development build should work with the default values. But they can be modified if necessary.
  - The *webpack-dev-server* can acceessed at `localhost:3000` and the Firebase emulators also run at `localhost`
- For the production build to work the *production* object in *configs.json* must be populated with correct values.
- The following instructions describe how to modify settings if neccessary
  - The host and port for *webpack-dev-server* can be modified in *webpack.common.js*.
  - Host and port for Firebase emulators can be found under the "emulators" field in the file *./src/server/firebase.json*.
  - The emulator host and port used by the front-end can be set by modifying the *development* object in *configs.js*.
  - There will be CORS issues if both the *webpack-dev-server* and the Firebase emulators are not running on the same host name.

# How to run the project
- Install dependencies by running `npm install`
- Install the Firebase CLI by running `npm install -g firebase-tools`
- To run both the client and the Firebase emulators, run `npm run emulators` to start Firebas emulators, then run `npm run client` to start the UI.
  - The UI can be accessed at `localhost:3000` assuming that the port of *webpack-dev-server* in *webpack.common.js* was not modified.
- To run only the front end use the command `npm run client`
- To run only the Firebase emulators end use the command `npm run emulators`
  - By default, the UI for the emulators can be accessed at `localhost:4000`
  - The emulators import dummy data from the directory *./src/server/dummy_data*

# Login with test user credentials
- The emulator loads up dummy data for 10 test users from the directory *./src/server/dummy_data*
- The credentials for thes users can be found in *test_users_credentials.txt*

# How to build the project
Note: Only the front-end can be built. Firebase back-end doesn't require building and instead is directly deployed.
- Run `npm run build:dev` to build the development build. The output files will be placed in *build-dev* of the root directory.
- Run `npm run build:prod` to build the production build. The output files will be placed in *build-prod* of the root directory.
  - IMPORTANT: Make sure to populate *production* object in *configs.js* with the correct values for the production build.

# How to deploy
### Deploy Firebase Hosting
- The front-end of the app is hosted in Firebase Hosting.
- Build the production build by running the command `npm run build:prod`
- Copy the resulting files from *build-prod* to *./src/server/public*
- Run the command `npm run deploy:hosting`
### Deploy Firestore rules
- Note: Only deploy Firestore rules if they were modified.
- The security rules for the Firestore are stored in *./src/server/firestore.rules*
- Deploy the security rules by running the command `npm run deploy:firestore`.