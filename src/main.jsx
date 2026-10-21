import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const savedTheme = localStorage.getItem('tmbis-theme');
if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
}

createRoot(document.getElementById('root')).render(

    <App />

)
