import penguinsData from './data/penguins.json'

export const SPECIES = ['Adelie', 'Chinstrap', 'Gentoo'] as const

export type Species = (typeof SPECIES)[number]
export type SpeciesFilter = Species | 'All species'
export type Sex = 'Female' | 'Male' | 'Unknown'
export type MetricKey = 'billLength' | 'billDepth' | 'flipperLength' | 'bodyMass'

export type PenguinDatum = {
  species: Species
  island: string
  sex: Sex
  billLength: number
  billDepth: number
  flipperLength: number
  bodyMass: number
}

type RawPenguinDatum = {
  Species: string | null
  Island: string | null
  'Beak Length (mm)': number | null
  'Beak Depth (mm)': number | null
  'Flipper Length (mm)': number | null
  'Body Mass (g)': number | null
  Sex: string | null
}

export type MetricOption = {
  key: MetricKey
  label: string
  unit: string
}

export type DatasetSummary = {
  totalRows: number
  completeRows: number
  droppedRows: number
  islands: string[]
  speciesCounts: Array<{
    species: Species
    total: number
    complete: number
  }>
}

export const METRICS: MetricOption[] = [
  { key: 'billLength', label: 'Bill length', unit: 'mm' },
  { key: 'billDepth', label: 'Bill depth', unit: 'mm' },
  { key: 'flipperLength', label: 'Flipper length', unit: 'mm' },
  { key: 'bodyMass', label: 'Body mass', unit: 'g' },
]

export const DATA_FIELDS = [
  { label: 'Species', detail: 'Categorical species label' },
  { label: 'Island', detail: 'Island where the penguin was observed' },
  { label: 'Sex', detail: 'Raw values MALE, FEMALE, or missing; normalized to Male, Female, Unknown' },
  { label: 'Beak Length (mm)', detail: 'Mapped to billLength for plotting' },
  { label: 'Beak Depth (mm)', detail: 'Mapped to billDepth for plotting' },
  { label: 'Flipper Length (mm)', detail: 'Mapped to flipperLength for plotting' },
  { label: 'Body Mass (g)', detail: 'Mapped to bodyMass for plotting' },
] as const

export const SPECIES_OPTIONS: SpeciesFilter[] = ['All species', ...SPECIES]

export const SPECIES_COLORS: Record<Species, string> = {
  Adelie: '#4f46e5',
  Chinstrap: '#0f766e',
  Gentoo: '#d97706',
}

export const CHART_WIDTH = 620
export const CHART_HEIGHT = 320
export const CHART_PADDING = { top: 18, right: 18, bottom: 46, left: 54 }
export const GRID_STEPS = 4

const RAW_PENGUINS = penguinsData as RawPenguinDatum[]

function isSpecies(value: string | null): value is Species {
  return value !== null && SPECIES.some((species) => species === value)
}

function normalizeSex(value: string | null): Sex {
  if (value === 'MALE') {
    return 'Male'
  }

  if (value === 'FEMALE') {
    return 'Female'
  }

  return 'Unknown'
}

function normalizePenguin(penguin: RawPenguinDatum): PenguinDatum | null {
  if (
    !isSpecies(penguin.Species) ||
    penguin.Island === null ||
    penguin['Beak Length (mm)'] === null ||
    penguin['Beak Depth (mm)'] === null ||
    penguin['Flipper Length (mm)'] === null ||
    penguin['Body Mass (g)'] === null
  ) {
    return null
  }

  return {
    species: penguin.Species,
    island: penguin.Island,
    sex: normalizeSex(penguin.Sex),
    billLength: penguin['Beak Length (mm)'],
    billDepth: penguin['Beak Depth (mm)'],
    flipperLength: penguin['Flipper Length (mm)'],
    bodyMass: penguin['Body Mass (g)'],
  }
}

function buildDatasetSummary(penguins: PenguinDatum[]): DatasetSummary {
  const totalRows = RAW_PENGUINS.length
  const completeRows = penguins.length
  const droppedRows = totalRows - completeRows
  const islands = Array.from(new Set(penguins.map((penguin) => penguin.island))).sort()
  const speciesCounts = SPECIES.map((species) => ({
    species,
    total: RAW_PENGUINS.filter((penguin) => penguin.Species === species).length,
    complete: penguins.filter((penguin) => penguin.species === species).length,
  }))

  return {
    totalRows,
    completeRows,
    droppedRows,
    islands,
    speciesCounts,
  }
}

export const PENGUINS: PenguinDatum[] = RAW_PENGUINS.flatMap((penguin) => {
  const normalized = normalizePenguin(penguin)

  return normalized === null ? [] : [normalized]
})

export const DATASET_SUMMARY = buildDatasetSummary(PENGUINS)

export function getMetric(key: MetricKey) {
  return METRICS.find((metric) => metric.key === key) ?? METRICS[0]
}

export function filterPenguins(speciesFilter: SpeciesFilter) {
  if (speciesFilter === 'All species') {
    return PENGUINS
  }

  return PENGUINS.filter((penguin) => penguin.species === speciesFilter)
}

export function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function buildTicks(min: number, max: number) {
  const step = (max - min) / GRID_STEPS

  return Array.from({ length: GRID_STEPS + 1 }, (_, index) => min + step * index)
}

export function formatMetricValue(value: number, metric: MetricOption) {
  return `${Math.round(value * 10) / 10} ${metric.unit}`
}

export function buildExplorerStats(penguins: PenguinDatum[]) {
  const averageMass = average(penguins.map((penguin) => penguin.bodyMass))
  const averageFlipper = average(penguins.map((penguin) => penguin.flipperLength))
  const islands = new Set(penguins.map((penguin) => penguin.island))

  return [
    {
      label: 'Average body mass',
      value: `${Math.round(averageMass).toLocaleString()} g`,
    },
    {
      label: 'Average flipper length',
      value: `${Math.round(averageFlipper)} mm`,
    },
    {
      label: 'Islands represented',
      value: islands.size.toString(),
    },
  ]
}
