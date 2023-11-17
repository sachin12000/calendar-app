import * as ReactDOM from 'react-dom/client';
import App from './App'

import { AuthStateProvider } from './contexts/auth';

const root = document.getElementById('root');

if (root) {
    ReactDOM.createRoot(root).render(
        <AuthStateProvider>
            <App />
        </AuthStateProvider>
    );
}