export function Config(overrides) {
  return {
    // Keep the inspector perspective camera position in sync with the A-Frame active camera.
    copyCameraPosition: true,
    ...overrides
  };
}
