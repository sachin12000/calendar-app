# Calendar App
Calendar app is an app that allows the its users to manage their events in a hassle free manner.

Built with React, MUI, Typescript and Firebase using the best software development practices.

# IMPORTANT: Make sure the configuration values are properly set to ensure that the front-end can properly communicate with Firebase emulators (during developement and testing) and production servers (during production).

# How to set configuration values
- Set the port for *webpack-dev-server* in *webpack.common.js*. Set to 3000 by default.
- Host and port numbers for Firebase emulators can be found under the "emulators" field in the file *./src/server/firebase.json*. These values can be modified if necessary.
- For the development build, set *emulatorIp* for Firebase emulator in *configs.js*.
  - Note: The *emulatorIp* must be properly set to avoid CORS errors.

# How to run the project
- Install dependencies by running `npm install`
- Install the Firebase CLI by running `npm install -g firebase-tools`
- To run both the client and the Firebase emulators, run `npm run emulators` to start Firebas emulators, then run `npm run client` to start the UI.
  - The UI can be accessed at localhost:3000 assuming that the port of *webpack-dev-server* in *webpack.common.js was* not modified.
- To run only the front end use the command `npm run client`
- To run only the Firebase emulators end use the command `npm run emulators`
  - By default, the UI for the emulators can be accessed at localhost:4000
  - The emulators import dummy data from the directory *./src/server/dummy_data*

# Login with test user credentials
- The emulator loads up dummy data for 10 test users from the directory *./src/server/dummy_data*
- The credentials for thes users can be found in *test_users_credentials.txt*

# How to build the project
Note: Only the front-end can be built. Firebase doesn't require building and instead is directly deployed.
- Run `npm run build:dev` to build the development build. The output files will be placed in *build-dev* of the root directory.
- Run `npm run build:prod` to build the production build. The output files will be placed in *build-prod* of the root directory.
  - IMPORTANT: Make sure to populate *production* object in *configs.js* with the correct values for the production build.

# How to deploy
### Deploy only Firebase Hosting
- The front-end of the app is hosted in Firebase Hosting.
- Build the production build by running the command `npm run build:prod`
- Copy the resulting files from *build-prod* to *./src/server/public*
- Run the command `npm run deploy hosting`
### Deploy only Firestore rules
- The security rules for the Firestore are stored in *./src/server/firestore.rules*
- Deploy the security rules by running the command `npm run deploy firestore`.