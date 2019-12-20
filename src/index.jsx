import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@reshuffle/react-auth';
import * as serviceWorker from './serviceWorker';

import 'sanitize.css';
import 'sanitize.css/forms.css';
import 'sanitize.css/typography.css';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.css';

import './style/index.scss';

import GA from './utils/GoogleAnalytics';
import App from './App';

ReactDOM.render(
  <AuthProvider>
    <Router>
      {GA.init() && <GA.RouteTracker />}
      <App />
    </Router>
  </AuthProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
