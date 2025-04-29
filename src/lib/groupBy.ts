interface GroupCategory<T, G> {
  key(x: T): string | null | undefined
  of(x: T): G
  append(g: G, x: T): void
}

export default function groupBy<T, G>(xs: T[], cat: GroupCategory<T, G>): G[] {
  let index = 0
  const indexes: Record<string, number> = {}
  const groups: G[] = []
  xs.forEach((x) => {
    const key = cat.key(x)
    if (key) {
      if (!(key in indexes)) {
        const groupIx = index++
        indexes[key] = groupIx
        groups[groupIx] = cat.of(x)
      }
      cat.append(groups[indexes[key]], x)
    }
  })
  return groups
}
