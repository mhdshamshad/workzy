export function enumToOptions(enumObj: Record<string, string>, allLabel?: string) {
  const options = Object.values(enumObj).map(value => ({
    label: value.charAt(0).toUpperCase() + value.slice(1).replaceAll('_', ' '),
    value,
  }));

  return allLabel ? [{ label: allLabel, value: 'all' }, ...options] : options;
}
