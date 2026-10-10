/**
 * Mock helper: simulate async API delay
 */
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export { delay }
