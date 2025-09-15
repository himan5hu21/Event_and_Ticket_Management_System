'use client'

import { useEffect } from 'react'

export function ExtensionCleanup() {
  useEffect(() => {
    // Remove attributes added by browser extensions that cause hydration mismatches
    const cleanupExtensionAttributes = () => {
      // Common extension attributes that cause hydration issues
      const extensionAttributes = [
        'cz-shortcut-listen',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'spellcheck',
        'data-ms-editor'
      ];

      extensionAttributes.forEach(attr => {
        if (document.body.hasAttribute(attr)) {
          document.body.removeAttribute(attr);
        }
      });
    };

    // Clean up immediately
    cleanupExtensionAttributes();

    // Set up a mutation observer to clean up any future extension modifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === document.body) {
          cleanupExtensionAttributes();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed', 'spellcheck', 'data-ms-editor']
    });

    return () => {
      observer.disconnect();
    };
  }, [])

  return null
}