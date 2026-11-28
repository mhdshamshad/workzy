export function getFirstErrorMessage(errors: Record<string, unknown>): string | undefined {
  function search(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      for (const item of value) {
        const message = search(item);
        if (message !== undefined) {
          return message;
        }
      }
      return undefined;
    }

    if (typeof value !== 'object' || value === null || value instanceof Element) {
      return undefined;
    }

    const record = value as Record<string, unknown>;
    if (typeof record.message === 'string') {
      return record.message;
    }

    for (const [key, child] of Object.entries(record)) {
      if (key === 'ref') {
        continue;
      }
      const message = search(child);
      if (message !== undefined) {
        return message;
      }
    }

    return undefined;
  }

  return search(errors);
}
