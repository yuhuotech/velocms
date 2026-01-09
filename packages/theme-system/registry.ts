import * as fs from 'fs/promises'
import * as path from 'path'
import { z } from 'zod'
import type { Theme, ThemeConfig, ValidationResult, ValidationError } from './types'

const ThemeConfigSchema = z.object({
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
    colors: z.record(z.string()).optional(),
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

export class ThemeRegistry {
  private themes = new Map<string, Theme>()
  private activeTheme: string | null = null
  private themesDir: string

  constructor(themesDir?: string) {
    if (themesDir) {
      this.themesDir = themesDir
    } else {
      // 💡 Vercel 环境下调整路径检测
      const root = process.cwd()
      this.themesDir = path.join(root, 'themes')
      
      // 如果根目录找不到，尝试在当前文件的上层找
      // 这在 Vercel Standalone 模式下很有用
      if (process.env.VERCEL) {
        console.log(`[ThemeRegistry] CWD: ${root}`)
      }
    }
  }

  async registerTheme(themePath: string): Promise<Theme> {
    const configPath = path.join(themePath, 'theme.config.json')

    // Check if config file exists
    try {
      await fs.access(configPath)
    } catch {
      throw new Error(`Theme config not found: ${configPath}`)
    }

    // Read and parse config
    const configContent = await fs.readFile(configPath, 'utf-8')
    let config: ThemeConfig

    try {
      config = ThemeConfigSchema.parse(JSON.parse(configContent))
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid theme config: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw error
    }

    // Validate theme structure
    await this.validateThemeStructure(themePath, config)

    // Load templates
    const templates: Record<string, string> = {}
    const templatesDir = path.join(themePath, 'templates')

    try {
      const entries = await fs.readdir(templatesDir, { recursive: true })
      for (const entry of entries) {
        if (entry.endsWith('.vt')) {
          const fullPath = path.join(templatesDir, entry)
          const content = await fs.readFile(fullPath, 'utf-8')
          templates[entry] = content
        }
      }
    } catch {
      // Templates directory might not exist
    }

    // Create theme object
    const theme: Theme = {
      name: config.name,
      version: config.version,
      path: themePath,
      config,
      templates,
      assets: {
        css: config.assets?.css || [],
        js: config.assets?.js || [],
        images: config.assets?.images || [],
        fonts: config.assets?.fonts || [],
      },
    }

    // Register theme
    this.themes.set(config.name, theme)

    return theme
  }

  async loadAllThemes(): Promise<void> {
    try {
      const entries = await fs.readdir(this.themesDir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const themePath = path.join(this.themesDir, entry.name)
          try {
            await this.registerTheme(themePath)
          } catch (error) {
            console.warn(`Failed to load theme at ${themePath}: ${error}`)
          }
        }
      }
    } catch (error) {
      console.warn(`Themes directory not found: ${this.themesDir}`)
    }
  }

  async activateTheme(themeName: string): Promise<Theme> {
    const theme = this.themes.get(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    this.activeTheme = themeName
    return theme
  }

  getActiveTheme(): Theme | null {
    if (!this.activeTheme) return null
    return this.themes.get(this.activeTheme) || null
  }

  getTheme(name: string): Theme | undefined {
    return this.themes.get(name)
  }

  listThemes(): Theme[] {
    return Array.from(this.themes.values())
  }

  listThemeNames(): string[] {
    return Array.from(this.themes.keys())
  }

  isThemeActive(themeName: string): boolean {
    return this.activeTheme === themeName
  }

  getTemplate(name: string): string | undefined {
    const theme = this.getActiveTheme()
    if (!theme) return undefined
    return theme.templates[name]
  }

  private async validateThemeStructure(themePath: string, config: ThemeConfig): Promise<void> {
    const errors: ValidationError[] = []

    // Validate required directories
    const requiredDirs = ['templates']
    for (const dir of requiredDirs) {
      const dirPath = path.join(themePath, dir)
      try {
        await fs.access(dirPath)
      } catch {
        errors.push({
          field: 'structure',
          message: `Missing required directory: ${dir}/`,
        })
      }
    }

    // Validate required template files
    const requiredTemplates = ['layout.vt', 'home.vt', 'post.vt', 'page.vt']
    for (const template of requiredTemplates) {
      const templatePath = path.join(themePath, 'templates', template)
      try {
        await fs.access(templatePath)
      } catch {
        errors.push({
          field: 'templates',
          message: `Missing required template: templates/${template}`,
        })
      }
    }

    // Validate assets
    if (config.assets) {
      for (const cssFile of config.assets.css || []) {
        const fullPath = path.join(themePath, cssFile)
        try {
          await fs.access(fullPath)
        } catch {
          errors.push({
            field: 'assets.css',
            message: `CSS file not found: ${cssFile}`,
          })
        }
      }

      for (const jsFile of config.assets.js || []) {
        const fullPath = path.join(themePath, jsFile)
        try {
          await fs.access(fullPath)
        } catch {
          errors.push({
            field: 'assets.js',
            message: `JS file not found: ${jsFile}`,
          })
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Theme validation failed: ${errors.map(e => e.message).join('; ')}`)
    }
  }
}

export async function validateTheme(themePath: string): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  try {
    const configPath = path.join(themePath, 'theme.config.json')

    try {
      await fs.access(configPath)
    } catch {
      return {
        valid: false,
        errors: [{ field: 'config', message: 'theme.config.json is required' }],
      }
    }

    const configContent = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(configContent)

    // Validate required fields
    const requiredFields = ['name', 'version', 'templates']
    for (const field of requiredFields) {
      if (!config[field]) {
        errors.push({
          field,
          message: `Missing required field: ${field}`,
        })
      }
    }

    // Validate version format (basic semver check)
    if (config.version && !/^\d+\.\d+\.\d+/.test(config.version)) {
      errors.push({
        field: 'version',
        message: 'Invalid version format. Use semver (e.g., 1.0.0)',
      })
    }

    // Validate templates
    if (config.templates) {
      for (const [key, templatePath] of Object.entries(config.templates)) {
        if (typeof templatePath !== 'string') {
          errors.push({
            field: `templates.${key}`,
            message: 'Template path must be a string',
          })
          continue
        }

        const fullPath = path.join(themePath, templatePath)
        try {
          await fs.access(fullPath)
        } catch {
          errors.push({
            field: `templates.${key}`,
            message: `Template file not found: ${templatePath}`,
          })
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  } catch (error) {
    return {
      valid: false,
      errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Unknown error' }],
    }
  }
}

export const themeRegistry = new ThemeRegistry()
