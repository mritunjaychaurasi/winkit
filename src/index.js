
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ThemeProvider } from 'styled-components';
import * as History from 'history';
import LanguageProvider from './components/LanguageProvider';

import App from './App';

import * as serviceWorker from './serviceWorker';

import translations from './i18n';
import AppProviders from './context/AppProviders';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { Provider} from '@rollbar/react';
import ErrorBoundary from 'components/ErrorBoundary';

const queryClient = new QueryClient();
export const history = History.createBrowserHistory();




const theme = {
  primary: '#464646',
  secondary: '#908d8d',
  light: '#eaeaea',
   bg: "#2F3F4C"
};



ReactDOM.render(
<ErrorBoundary>
  <LanguageProvider messages={translations.translationMessages}>
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AppProviders>
            <App />
          </AppProviders>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  </LanguageProvider>
</ErrorBoundary>
,
  document.getElementById('root'),
);

serviceWorker.register();
