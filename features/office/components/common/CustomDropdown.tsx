import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  icon,
  className = '',
  buttonClassName = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = React.useId();

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      // FE-27: Escape closes the listbox (previously only outside-click did).
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className={`min-h-[44px] px-3.5 py-2 bg-white dark:bg-[#0E1A2E] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-[#B8832A] hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-500 dark:text-slate-400 shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={placeholder}
          className="absolute right-0 z-50 mt-1.5 min-w-[190px] w-full max-h-64 overflow-auto bg-white dark:bg-[#0E1A2E] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-sm custom-scrollbar"
        >
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#B8832A] dark:hover:text-[#E3BA63] transition-colors cursor-pointer text-sm ${
                option.value === value ? 'bg-blue-50 dark:bg-slate-800 text-[#B8832A] dark:text-[#E3BA63] font-semibold' : 'text-slate-700 dark:text-slate-200 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {option.icon}
                <span className="truncate">{option.label}</span>
              </div>
              {option.value === value && <Check className="w-4 h-4 text-[#B8832A] dark:text-[#E3BA63]" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
