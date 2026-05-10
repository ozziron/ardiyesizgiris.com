export const CONTAINER_TYPE_OPTIONS = [
  { value: "20DC", label: "20 Feet Standart (20DC)" },
  { value: "40DC", label: "40 Feet Standart (40DC)" },
  { value: "40HC", label: "40 Feet Yuksek (40HC)" },
] as const

export type ContainerTypeOption = (typeof CONTAINER_TYPE_OPTIONS)[number]
