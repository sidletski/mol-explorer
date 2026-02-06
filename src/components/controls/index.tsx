import type { FC } from 'react'

import styles from './Controls.module.scss'

type SliderControlProps = {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}

export function SliderControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  suffix = '%',
  onChange
}: SliderControlProps) {
  return (
    <div className={styles.sliderControl}>
      <span className={styles.sliderLabel}>{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={styles.sliderValue}>
        {value}
        {suffix}
      </span>
    </div>
  )
}

type ToggleControlProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ToggleControl({
  label,
  checked,
  onChange
}: ToggleControlProps) {
  return (
    <div className={styles.toggleControl}>
      <span className={styles.toggleLabel}>{label}</span>
      <button
        className={`${styles.toggle} ${checked ? styles.checked : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  )
}

type ColorPickerProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

export const ColorPicker: FC<ColorPickerProps> = ({
  label,
  value,
  onChange
}) => {
  return (
    <div className={styles.colorPicker}>
      <span className={styles.colorLabel}>{label}</span>
      <label className={styles.colorSwatch} style={{ backgroundColor: value }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}

type TextInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
}

export const TextInput: FC<TextInputProps> = ({
  label,
  value,
  onChange,
  onSubmit,
  placeholder
}) => {
  return (
    <div className={styles.textInput}>
      <span className={styles.textLabel}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
      />
    </div>
  )
}

type SelectBoxOption = {
  value: string
  label: string
}

type SelectBoxProps = {
  label: string
  value: string
  options: SelectBoxOption[]
  onChange: (value: string) => void
}

export const SelectBox: FC<SelectBoxProps> = ({
  label,
  value,
  options,
  onChange
}) => {
  return (
    <div className={styles.selectBox}>
      <span className={styles.selectLabel}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
