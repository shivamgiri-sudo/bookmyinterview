import React from 'react';
import { createRoot } from 'react-dom/client';
import RouterNext from './RouterNext.jsx';
import './style.css';
import './topbar.css';
import './landing.css';
import './auth.css';
import './workspace.css';
import './insights.css';
import './integration.css';
import './global.css';
import './cost.css';
import './ops.css';

createRoot(document.getElementById('root')).render(<RouterNext />);
