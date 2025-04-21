import { expect } from 'vitest' // ✅ Vitest's own expect
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
