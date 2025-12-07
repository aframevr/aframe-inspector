import { useState, useEffect, useRef } from 'react';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { AwesomeIcon } from '../AwesomeIcon';
import '../../style/themes.css';

const STORAGE_KEY = 'aframe-inspector-theme';

const availableThemes = [
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'retro',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'fantasy',
  'luxury',
  'dracula',
  'autumn',
  'business',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk'
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatLabel(theme) {
  if (theme === 'caramellatte') return 'Caramel latte';
  return capitalize(theme);
}

function buildThemeOptions(themes) {
  const options = [{ value: '', label: 'Default' }];
  for (const theme of themes) {
    options.push({ value: theme, label: formatLabel(theme) });
  }
  return options;
}

export default function ThemeSelector() {
  const [themeOptions] = useState(() => buildThemeOptions(availableThemes));
  const [theme, setTheme] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Validate and set initial theme
    const stored = localStorage.getItem(STORAGE_KEY);
    const isValid = stored && themeOptions.some((opt) => opt.value === stored);
    setTheme(isValid ? stored : '');
  }, []);

  // Apply theme to DOM and localStorage
  useEffect(() => {
    if (theme) {
      document
        .getElementById('aframeInspector')
        ?.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    } else {
      document.getElementById('aframeInspector')?.removeAttribute('data-theme');
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [theme]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <a
        className="button"
        title="Select theme"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AwesomeIcon icon={faPalette} />
      </a>
      {isOpen && (
        <div className="theme-dropdown">
          {themeOptions.map((option) => (
            <div
              key={option.value}
              className={`theme-option${theme === option.value ? ' selected' : ''}`}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
