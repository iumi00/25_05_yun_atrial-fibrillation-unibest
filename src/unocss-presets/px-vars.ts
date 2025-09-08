import { Preset, Rule } from 'unocss'

interface PxVarsOptions {
  max?: number
  types?: string[]
}

export function presetPxVars(options: PxVarsOptions = {}): Preset {
  const max = options.max ?? 100
  const types = options.types ?? [
    // 字体
    'text',

    // padding
    'p',
    'pl',
    'pr',
    'pt',
    'pb',
    'px',
    'py',

    // margin
    'm',
    'ml',
    'mr',
    'mt',
    'mb',
    'mx',
    'my',

    // gap
    'gap',
    'gap-x',
    'gap-y',

    // 宽高
    'w',
    'min-w',
    'max-w',
    'h',
    'min-h',
    'max-h',

    // 圆角
    'rounded',
    'rounded-t',
    'rounded-b',
    'rounded-l',
    'rounded-r',

    // border
    'border',
    'border-t',
    'border-b',
    'border-l',
    'border-r',

    // 行高、字间距
    'leading',
    'tracking',

    // 定位
    'top',
    'right',
    'bottom',
    'left',

    // 层级
    'z',
  ]

  // 动态生成 safelist
  const pxClasses = Array.from({ length: max }, (_, i) => i + 1).flatMap((d) =>
    types.map((type) => `${type}-${d}-px`),
  )

  // 属性映射表，统一管理所有需要带 px 值的样式属性
  const propertyMap: Record<string, string | Record<string, string>> = {
    // 字体
    text: 'font-size',

    // padding
    p: 'padding',
    pl: { 'padding-left': '' },
    pr: { 'padding-right': '' },
    pt: { 'padding-top': '' },
    pb: { 'padding-bottom': '' },
    px: { 'padding-left': '', 'padding-right': '' },
    py: { 'padding-top': '', 'padding-bottom': '' },

    // margin
    m: 'margin',
    ml: { 'margin-left': '' },
    mr: { 'margin-right': '' },
    mt: { 'margin-top': '' },
    mb: { 'margin-bottom': '' },
    mx: { 'margin-left': '', 'margin-right': '' },
    my: { 'margin-top': '', 'margin-bottom': '' },

    // gap
    gap: 'gap',
    'gap-x': { 'column-gap': '' },
    'gap-y': { 'row-gap': '' },

    // width / height
    w: 'width',
    'min-w': 'min-width',
    'max-w': 'max-width',
    h: 'height',
    'min-h': 'min-height',
    'max-h': 'max-height',

    // border-radius
    rounded: 'border-radius',
    'rounded-t': {
      'border-top-left-radius': '',
      'border-top-right-radius': '',
    },
    'rounded-b': {
      'border-bottom-left-radius': '',
      'border-bottom-right-radius': '',
    },
    'rounded-l': {
      'border-top-left-radius': '',
      'border-bottom-left-radius': '',
    },
    'rounded-r': {
      'border-top-right-radius': '',
      'border-bottom-right-radius': '',
    },

    // letter-spacing
    tracking: 'letter-spacing',

    // top/right/bottom/left
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left',
  }

  // 动态生成规则
  const rules: Rule[] = types.map((type) => {
    const property = propertyMap[type]
    return [
      new RegExp(`^${type}-(\\d+)-px$`),
      ([, d]: string[]) => {
        const value = `var(--px-${d})`
        if (typeof property === 'string') {
          return { [property]: value }
        }
        if (typeof property === 'object') {
          return Object.fromEntries(Object.keys(property).map((key) => [key, value]))
        }
        return {}
      },
    ]
  })

  return {
    name: 'unocss-px-vars',
    safelist: pxClasses,
    rules,
  }
}
