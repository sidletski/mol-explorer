import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select, type SelectOption } from './index'

const options: SelectOption<string>[] = [
  { value: '1CRN', label: '1CRN - CRAMBIN' },
  { value: '4HHB', label: '4HHB - HEMOGLOBIN' },
  { value: '2MBW', label: '2MBW - ALBUMIN' }
]

const defaultProps = {
  label: 'PDB id',
  value: options[0],
  options,
  onChange: vi.fn()
}

describe('Select', () => {
  it('renders the label and selected value', () => {
    render(<Select {...defaultProps} />)

    expect(screen.getByText('PDB id')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '1CRN - CRAMBIN' })
    ).toBeInTheDocument()
  })

  it('opens dropdown on click and shows options', async () => {
    const user = userEvent.setup()
    render(<Select {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '1CRN - CRAMBIN' }))

    expect(screen.getByText('4HHB - HEMOGLOBIN')).toBeInTheDocument()
    expect(screen.getByText('2MBW - ALBUMIN')).toBeInTheDocument()
  })

  it('calls onChange when an option is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Select {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '1CRN - CRAMBIN' }))
    await user.click(screen.getByText('4HHB - HEMOGLOBIN'))

    expect(onChange).toHaveBeenCalledWith(options[1])
  })

  it('navigates options with arrow keys and selects with Enter', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Select {...defaultProps} onChange={onChange} />)

    const trigger = screen.getByRole('button', { name: '1CRN - CRAMBIN' })
    await user.click(trigger)
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith(options[1])
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<Select {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '1CRN - CRAMBIN' }))
    expect(screen.getByText('4HHB - HEMOGLOBIN')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('4HHB - HEMOGLOBIN')).not.toBeInTheDocument()
  })

  describe('searchable', () => {
    it('renders an input instead of a button', () => {
      render(<Select {...defaultProps} searchable />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls onSearch when typing', async () => {
      const onSearch = vi.fn()
      const user = userEvent.setup()
      render(
        <Select {...defaultProps} searchable onSearch={onSearch} />
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      // After click opens the dropdown, input shows the empty query
      // Type a search term
      await user.keyboard('cram')

      expect(onSearch).toHaveBeenCalled()
      // Each keystroke fires onSearch with the accumulated query
      const calls = onSearch.mock.calls.map((c: string[]) => c[0])
      expect(calls).toContain('cram')
    })

    it('shows loading state in dropdown when loading with no options', async () => {
      const user = userEvent.setup()
      render(
        <Select {...defaultProps} searchable options={[]} loading />
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows loading indicator at bottom when loading with options', async () => {
      const user = userEvent.setup()
      render(
        <Select {...defaultProps} searchable loading />
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('1CRN - CRAMBIN')).toBeInTheDocument()
    })

    it('shows "No results" when not loading and no options', async () => {
      const user = userEvent.setup()
      render(
        <Select {...defaultProps} searchable options={[]} />
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(screen.getByText('No results')).toBeInTheDocument()
    })
  })
})
