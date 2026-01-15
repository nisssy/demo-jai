'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// 時間リストを生成（00:00から23:30まで、30分単位）
const generateTimeOptions = (): string[] => {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    times.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 23) {
      times.push(`${String(hour).padStart(2, '0')}:30`)
    }
  }
  return times
}

type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  min?: string // 最小時間（終了時間選択時に使用）
  max?: string // 最大時間（開始時間選択時に使用）
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function TimePicker({
  value,
  onChange,
  min,
  max,
  placeholder = '時間を選択',
  disabled = false,
  id,
}: TimePickerProps) {
  const timeOptions = React.useMemo(() => generateTimeOptions(), [])

  // 時間を分に変換して比較
  const timeToMinutes = React.useCallback((time: string): number => {
    if (!time) return 0
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + (minutes || 0)
  }, [])

  // 時間が有効かどうかを判定
  const isTimeDisabled = React.useCallback((time: string): boolean => {
    const timeMinutes = timeToMinutes(time)
    
    if (min) {
      const minMinutes = timeToMinutes(min)
      if (timeMinutes <= minMinutes) {
        return true
      }
    }
    
    if (max) {
      const maxMinutes = timeToMinutes(max)
      if (timeMinutes >= maxMinutes) {
        return true
      }
    }
    
    return false
  }, [min, max, timeToMinutes])

  // onChangeハンドラーをメモ化して無限ループを防ぐ
  const handleValueChange = React.useCallback((newValue: string) => {
    if (newValue) {
      onChange(newValue)
    }
  }, [onChange])

  // valueが空または無効な場合はundefinedにする
  const selectValue = value && timeOptions.includes(value) ? value : undefined

  return (
    <SelectPrimitive.Root
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-9",
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[300px] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
          )}
          position="popper"
        >
          <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
            <ChevronUpIcon className="size-4" />
          </SelectPrimitive.ScrollUpButton>
          
          <SelectPrimitive.Viewport className="p-1">
            {timeOptions.map((time) => {
              const disabled = isTimeDisabled(time)
              return (
                <SelectPrimitive.Item
                  key={time}
                  value={time}
                  disabled={disabled}
                  className={cn(
                    "focus:bg-accent focus:text-accent-foreground relative flex w-full items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors",
                    disabled
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "cursor-pointer",
                  )}
                  style={disabled ? { filter: 'grayscale(100%)' } : undefined}
                >
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <CheckIcon className="size-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText
                    style={disabled ? { filter: 'grayscale(100%)' } : undefined}
                  >
                    {time}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              )
            })}
          </SelectPrimitive.Viewport>
          
          <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
            <ChevronDownIcon className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
