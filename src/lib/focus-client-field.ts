/** Focus during the tap so mobile keyboards open, then follow the visible viewport. */
export function focusClientField(field: HTMLElement | null) {
  if (!field) return;
  field.focus({ preventScroll: true });
  const viewport = window.visualViewport;
  const reveal = () => {
    if (document.activeElement !== field || !field.isConnected) return;
    const rect = field.getBoundingClientRect();
    const top = viewport?.offsetTop ?? 0;
    const height = viewport?.height ?? window.innerHeight;
    window.scrollBy({ top: rect.top + rect.height / 2 - top - height / 2, behavior: 'instant' });
  };
  const cleanup = () => {
    viewport?.removeEventListener('resize', reveal);
    field.removeEventListener('blur', cleanup);
    document.removeEventListener('astro:before-swap', cleanup);
  };
  viewport?.addEventListener('resize', reveal);
  field.addEventListener('blur', cleanup, { once: true });
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  reveal();
  requestAnimationFrame(reveal);
}
