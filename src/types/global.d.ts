declare interface String {
  green: string
  gray: string
  yellow: string
  red: string
  cyan: string
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
