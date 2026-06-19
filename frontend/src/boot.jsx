import React from 'react';
import { createRoot } from 'react-dom/client';
import RouterShell from './RouterShell.jsx';
import './style.css';
import './landing.css';
import './workspace.css';
import './insights.css';
import './integration.css';
import './global.css';
import './cost.css';
import './ops.css';

createRoot(document.getElementById('root')).render(<RouterShell/>);
