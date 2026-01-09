import { z } from 'zod'

export const ThemeColorSchemeSchema = z.object({
  primary: z.string().optional(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  background: z.string().optional(),
  surface: z.string().optional(),
  text: z.string().optional(),
  'text-secondary': z.string().optional(),
  border: z.string().optional(),
  success: z.string().optional(),
  warning: z.string().optional(),
  error: z.string().optional(),
})

export const ThemeConfigSchema = z.object({
  name: z.string().min(1),
  version: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }).optional(),
  description: z.string().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  minVeloCMSVersion: z.string().optional(),
  screenshot: z.string().optional(),
  config: z.object({
    colors: ThemeColorSchemeSchema.optional(),
    darkColors: ThemeColorSchemeSchema.optional(),
    fonts: z.record(z.any()).optional(),
    layout: z.record(z.any()).optional(),
    features: z.record(z.boolean()).optional(),
    spacing: z.record(z.any()).optional(),
    seo: z.record(z.any()).optional(),
  }).optional(),
  templates: z.record(z.string()),
  assets: z.object({
    css: z.array(z.string()).optional(),
    js: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    fonts: z.array(z.string()).optional(),
  }).optional(),
  settings: z.array(z.object({
    key: z.string(),
    type: z.enum(['boolean', 'string', 'number', 'color', 'select', 'range', 'text']),
    default: z.any(),
    label: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    options: z.array(z.string()).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
  })).optional(),
  customComponents: z.array(z.object({
    name: z.string(),
    component: z.string(),
    props: z.record(z.any()).optional(),
  })).optional(),
  filters: z.array(z.object({
    name: z.string(),
    file: z.string(),
  })).optional(),
  hooks: z.object({
    onInit: z.string().optional(),
    beforeRender: z.string().optional(),
    afterRender: z.string().optional(),
  }).optional(),
  extends: z.string().optional(),
})

export type ThemeColorScheme = z.infer<typeof ThemeColorSchemeSchema>
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>

export interface Theme {
  name: string
  version: string
  path: string
  config: ThemeConfig
  templates: Record<string, string>
  compiledTemplates?: Record<string, any>
  assets: {
    css: string[]
    js: string[]
    images: string[]
    fonts: string[]
  }
}

export interface ResolvedTheme extends Theme {
  config: ThemeConfig
  templates: Record<string, string>
  assets: {
    css: string[]
    js: string[]
    images: string[]
    fonts: string[]
  }
}

export interface ThemeRegistry {
  themes: Map<string, Theme>
  activeTheme: string | null
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface UserThemeSettings {
  themeName: string
  settings: Record<string, any>
}

export type ColorMode = 'light' | 'dark' | 'system'
