import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import styles from './Select.module.scss'

export type SelectOption<T> = {
  value: T
  label: string
}

type SelectProps<T> = {
  label: string
  value: SelectOption<T>
  options: SelectOption<T>[]
  className?: string
  searchable?: boolean
  placeholder?: string
  loading?: boolean
  placement?: Placement
  onChange: (_option: SelectOption<T>) => void
  // Only used if searchable is true
  onSearch?: (_query: string) => void
  // Only used if searchable is true
  onLoadMore?: () => void
}

export const Select = <T extends string | number = string>({
  label,
  value,
  options,
  className,
  searchable = false,
  placeholder = 'Search...',
  loading = false,
  placement = 'bottom-start',
  onChange,
  onSearch,
  onLoadMore
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [referenceEl, setReferenceEl] = useState<HTMLElement | null>(null)
  const [floatingEl, setFloatingEl] = useState<HTMLDivElement | null>(null)

  const { floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      setIsOpen(open)
      setQuery('')
    },
    placement,
    elements: { reference: referenceEl, floating: floatingEl },
    middleware: [
      offset(4),
      flip(),
      size({
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.min(availableHeight, 200)}px`
        }
      })
    ],
    whileElementsMounted: autoUpdate
  })

  const click = useClick(context, { keyboardHandlers: false })
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss
  ])

  useEffect(() => {
    if (floatingEl) {
      floatingEl.scrollTo(0, 0)
    }
  }, [query, floatingEl])

  const selectedLabel = value.label

  const filtered =
    searchable && query && !onSearch
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        )
      : options

  const updateQuery = (next: string) => {
    setQuery(next)
    setHighlightedIndex(0)
    onSearch?.(next)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore) return
    const el = e.currentTarget
    const threshold = 20
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      onLoadMore()
    }
  }

  const select = (option: SelectOption<T>) => {
    onChange(option)
    setIsOpen(false)
    setQuery('')
    referenceEl?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[highlightedIndex]) {
          select(filtered[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setQuery('')
        referenceEl?.blur()
        break
    }
  }

  const dropdown = isOpen && (
    <div
      ref={setFloatingEl}
      className={clsx(styles.dropdown, {
        [styles.withItems]: filtered.length > 0
      })}
      style={floatingStyles}
      {...getFloatingProps()}
      onScroll={handleScroll}
    >
      {filtered.length > 0 ? (
        <>
          {filtered.map((option, i) => (
            <div
              key={option.value.toString()}
              title={option.label}
              className={[
                styles.option,
                i === highlightedIndex ? styles.highlighted : '',
                option.value === value.value ? styles.selected : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setHighlightedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                select(option)
              }}
            >
              {option.label}
            </div>
          ))}
          {loading && <div className={styles.loading}>Loading...</div>}
        </>
      ) : (
        <div className={styles.empty}>
          {loading ? 'Loading...' : 'No results'}
        </div>
      )}
    </div>
  )

  if (searchable || onSearch) {
    return (
      <div className={clsx(styles.select, className)}>
        <span className={styles.label}>{label}</span>
        <input
          ref={setReferenceEl}
          className={styles.input}
          value={isOpen ? query : selectedLabel}
          placeholder={placeholder}
          onChange={(e) => updateQuery(e.target.value)}
          {...getReferenceProps({ onKeyDown: handleKeyDown })}
        />
        {dropdown}
      </div>
    )
  }

  return (
    <div className={styles.select}>
      <span className={styles.label}>{label}</span>
      <button
        ref={setReferenceEl}
        className={styles.trigger}
        {...getReferenceProps({ onKeyDown: handleKeyDown })}
      >
        {selectedLabel}
      </button>
      {dropdown}
    </div>
  )
}
