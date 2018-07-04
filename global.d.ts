declare interface String {
  green: string
  gray: string
  grey: string
  yellow: string
  red: string
  cyan: string
  black: string
  inverse: string
  bgGreen: string
  bgRed: string
}

declare interface Error {
  desc?: string
  code?: string
  body?: string
}

declare namespace NodeJS {
  interface Global {
    forks: number
    predi: number
    sig0: boolean
  }
}

declare module '*.json' {
  const value: any
  export default value
}
