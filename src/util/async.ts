export const asyncTimeout = async (fn: () => void, ms: number) => {
  await sleep(ms)
  return fn()
}

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
