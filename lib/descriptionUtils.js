export function parseDescription(description, fallback = 'No description available.') {
  if (!description && description !== 0) {
    return { short: '', long: fallback };
  }

  if (typeof description === 'object' && description !== null) {
    const short = typeof description.short === 'string' ? description.short.trim() : '';
    const long = typeof description.long === 'string' ? description.long.trim() : '';
    return {
      short,
      long: long || short || fallback,
    };
  }

  if (typeof description !== 'string') {
    return { short: '', long: String(description) || fallback };
  }

  const trimmed = description.trim();
  if (!trimmed) {
    return { short: '', long: fallback };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const short = typeof parsed.short === 'string' ? parsed.short.trim() : '';
      const long = typeof parsed.long === 'string' ? parsed.long.trim() : '';
      return {
        short,
        long: long || short || fallback,
      };
    }
  } catch {
    // fall through to plain text handling
  }

  return {
    short: '',
    long: trimmed || fallback,
  };
}
