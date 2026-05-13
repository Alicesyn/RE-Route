import React, { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isBefore,
  parseISO,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DatePickerProps {
  /** Current value in "yyyy-MM-dd" format */
  value: string;
  /** Called with the selected date in "yyyy-MM-dd" format */
  onChange: (dateStr: string) => void;
  /** Minimum selectable date in "yyyy-MM-dd" format */
  min?: string;
  /** Label displayed above the input */
  label: string;
  /** Whether the calendar dropdown is open (controlled mode) */
  isOpen?: boolean;
  /** Called when the dropdown opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Extra className for the root wrapper */
  className?: string;
  /** Whether to show the pulsing highlight animation */
  highlight?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  label,
  isOpen: controlledIsOpen,
  onOpenChange,
  className = "",
  highlight = false,
}) => {
  const selectedDate = value ? parseISO(value) : new Date();
  const minDate = min ? parseISO(min) : null;

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const [viewMonth, setViewMonth] = useState(startOfMonth(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync the view month when the selected date changes externally
  useEffect(() => {
    if (value) {
      setViewMonth(startOfMonth(parseISO(value)));
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (onOpenChange) onOpenChange(false);
        else setInternalOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onOpenChange]);

  const toggleOpen = () => {
    const next = !isOpen;
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  const handleSelectDate = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    // In uncontrolled mode, close the dropdown ourselves.
    // In controlled mode, the parent decides what to do in its onChange handler
    // (e.g., auto-switch to the next picker).
    if (!onOpenChange) {
      setInternalOpen(false);
    }
  };

  // Build the calendar grid
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart); // Sunday
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let cursor = calStart;
  while (cursor <= calEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const isDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) return true;
    return false;
  };

  const today = new Date();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      <label
        className={`block text-xs font-bold uppercase mb-2 transition-colors duration-300 ${
          highlight
            ? "text-primary-600 dark:text-primary-400"
            : "text-surface-500"
        }`}
      >
        {label} {highlight && "←"}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full flex items-center gap-3 bg-surface-50 dark:bg-surface-900 border text-sm rounded-lg px-3 py-2.5 text-left outline-none transition-all duration-200 ${
          highlight
            ? "border-primary-500 ring-2 ring-primary-500/30 shadow-[0_0_15px_rgba(var(--primary-500-rgb),0.25)] animate-pulse"
            : isOpen
            ? "border-primary-500 ring-2 ring-primary-500/20"
            : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
        }`}
      >
        <Calendar
          className={`w-4 h-4 shrink-0 transition-colors ${
            highlight || isOpen ? "text-primary-500" : "text-surface-400"
          }`}
        />
        <span className="font-semibold text-surface-900 dark:text-white">
          {value ? format(selectedDate, "MMM d, yyyy") : "Select date..."}
        </span>
      </button>

      {/* Dropdown Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-full mt-2 left-0 right-0 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
          >
            {/* Month/Year Header */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-700">
              <button
                type="button"
                onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                className="p-1.5 rounded-lg text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-surface-900 dark:text-white tracking-wide">
                {format(viewMonth, "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                className="p-1.5 rounded-lg text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 px-2 pt-2 pb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold text-surface-400 uppercase tracking-wider py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 px-2 pb-2.5 gap-0.5">
              {days.map((date, i) => {
                const inMonth = isSameMonth(date, viewMonth);
                const selected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                const disabled = isDisabled(date);

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled || !inMonth}
                    onClick={() => handleSelectDate(date)}
                    className={`
                      relative h-8 w-full rounded-lg text-xs font-semibold transition-all duration-150
                      ${!inMonth ? "opacity-0 pointer-events-none" : ""}
                      ${
                        disabled && inMonth
                          ? "text-surface-300 dark:text-surface-600 cursor-not-allowed"
                          : ""
                      }
                      ${
                        selected
                          ? "bg-primary-500 text-white shadow-md shadow-primary-500/30 scale-105"
                          : ""
                      }
                      ${
                        !selected && !disabled && inMonth
                          ? "text-surface-700 dark:text-surface-200 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 active:scale-95"
                          : ""
                      }
                    `}
                  >
                    {format(date, "d")}
                    {/* Today dot indicator */}
                    {isToday && !selected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
