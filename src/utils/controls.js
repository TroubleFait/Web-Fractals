export function setupControls(
  canvas,
  onPointDown,
  onPointUp,
  onPan,
  onZoom,
  onPanZoom
) {
  let pointers = new Map();

  function getPointerCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    const coordinates = getPointerCoordinates(e);
    pointers.set(e.pointerId, { start: coordinates, current: coordinates });
    onPointDown(pointers.get(e.pointerId));
  });

  canvas.addEventListener("pointerup", (e) => {
    pointers.delete(e.pointerId);
    onPointUp();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;

    const movingPointer = pointers.get(e.pointerId);
    movingPointer.current = getPointerCoordinates(e);

    // if (pointers.size === 1) {
    //   onPan(movingPointer);
    // } else if (pointers.size === 2) {
    //   onPanZoom(pointers);
    // }

    // TEST
    onPan(movingPointer);
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const coordinates = getPointerCoordinates(e);

      onZoom(coordinates, e.deltaY);
    },
    { passive: false }
  );
}
