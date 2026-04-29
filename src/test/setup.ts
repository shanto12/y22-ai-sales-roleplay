import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest doesn't auto-cleanup between tests by default; otherwise sequential
// renders accumulate in the DOM and `getByTestId` finds multiples.
afterEach(() => {
  cleanup()
})
