/** Routes retaining their existing presentation, including translated variants. */
export function usesRefinedPresentation(pathname: string): boolean {
  const path = pathname.replace(/^\/ru(?=\/|$)/, '').replace(/\/+$/, '') || '/';
  return (
    !/^\/(?:clients|contract|thank_you|landing)(?:\/|$)/.test(path) &&
    !/^\/(?:services\/(?:family|first-year)-photography|pricing\/(?:family|first-year))$/.test(path)
  );
}
