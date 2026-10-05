/** Focus during the tap, then reveal the field after the keyboard settles. */
export function focusClientField(field: HTMLElement | null) {
  if (!field) return;
  field.focus({ preventScroll: true });
  const viewport = window.visualViewport;
  let timer: ReturnType<typeof setTimeout>;
  const reveal = () => {
    if (document.activeElement !== field || !field.isConnected) return;
    const rect = field.getBoundingClientRect();
    const top = (viewport?.offsetTop ?? 0) + 24;
    const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) - 24;
    // Keep visible fields still; centering fights the browser's keyboard panning.
    const delta =
      rect.top < top ? rect.top - top : rect.bottom > bottom ? Math.min(rect.bottom - bottom, rect.top - top) : 0;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(reveal, 150);
  };
  const cleanup = () => {
    clearTimeout(timer);
    viewport?.removeEventListener('resize', schedule);
    viewport?.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    field.removeEventListener('blur', cleanup);
    document.removeEventListener('pointerdown', cleanup);
    document.removeEventListener('wheel', cleanup);
    document.removeEventListener('astro:before-swap', cleanup);
  };
  viewport?.addEventListener('resize', schedule);
  viewport?.addEventListener('scroll', schedule);
  window.addEventListener('resize', schedule);
  field.addEventListener('blur', cleanup, { once: true });
  // Once the user interacts again, leave scrolling under their control.
  document.addEventListener('pointerdown', cleanup, { once: true });
  document.addEventListener('wheel', cleanup, { once: true });
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  schedule();
}
