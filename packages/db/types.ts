export interface DatabaseAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  query<T>(sql: string, params?: any[]): Promise<T[]>
  execute(sql: string, params?: any[]): Promise<void>
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>
  healthCheck(): Promise<boolean>
}

export interface Transaction {
  query<T>(sql: string, params?: any[]): Promise<T[]>
  execute(sql: string, params?: any[]): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
}

export interface CacheAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  get<T>(key: string): Promise<T | undefined>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  deletePattern(pattern: string): Promise<void>
  healthCheck(): Promise<boolean>
}
