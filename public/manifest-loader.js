async function fetchManifest(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: Status ${response.status} ${response.statusText}`);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.log(`Failed to fetch manifest from ${url}:`, error);
    throw error;
  }
}

function loadManifest() {
  // First set default values
  window.manifest = window.manifest || {};

  // Try to fetch dynamic manifest from server
  fetchManifest('/manifest.json')
    .then(dynamicManifest => {
      // Merge with any existing values
      console.log('Dynamic Manifest: ', dynamicManifest)
      window.manifest = { ...window.manifest, ...dynamicManifest };
      document.dispatchEvent(new Event('manifestLoaded'));
    })
    .catch(error => {
      console.log('Trying default manifest: ', error);
      // If fetch fails, load the default manifest
      fetchManifest('/manifest.default.json')
        .then(defaultManifest => {
          window.manifest = { ...window.manifest, ...defaultManifest };
          document.dispatchEvent(new Event('manifestLoaded'));
        })
        .catch(error => {
          console.log('Failed to load any manifest', error);
        });
    });
}

loadManifest()