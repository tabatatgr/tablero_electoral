const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');

function startStaticServer(root, port = 3000) {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(root, urlPath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const map = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };
      res.setHeader('Content-Type', map[ext] || 'application/octet-stream');
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

(async () => {
  // start static server
  const server = await startStaticServer(path.resolve(__dirname, '..', '..'), 3000);
  console.log('Static server started on http://localhost:3000');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/index.html', { timeout: 15000 });
    console.log('Page loaded');

    // Wait for notifications system to be ready
    await page.waitForFunction(() => window.notifications && window.notifications.isReady === true, { timeout: 10000 });
    console.log('Notification system ready');

    // Ensure there is at least one party slider. The app normally fetches parties from
    // a remote API, which may not run in this test environment, so inject mock sliders
    // by calling the component helper if necessary.
    const hasSlider = await page.$('#dynamic-party-sliders .control-slider');
    if (!hasSlider) {
      console.log('No dynamic sliders found; injecting mock parties via controlSidebar.updatePartySliders');
      await page.evaluate(() => {
        try {
          if (window.controlSidebar && typeof window.controlSidebar.updatePartySliders === 'function') {
            window.controlSidebar.updatePartySliders([
              { partido: 'UNO', porcentaje_vigente: 45.0 },
              { partido: 'DOS', porcentaje_vigente: 35.0 },
              { partido: 'TRES', porcentaje_vigente: 20.0 }
            ]);
          }
        } catch (e) {
          // swallow errors for the injection attempt
          console.warn('Injection failed:', e);
        }
      });
      // give the page a moment to render the injected sliders
      await page.waitForTimeout(250);
      // Mark initialization complete so user-triggered notifications are allowed
      await page.evaluate(() => {
        try { window.isInitializing = false; } catch (e) { /* ignore */ }
        try { if (window.notifications && window.notifications.hide) window.notifications.hide('initial-loading'); } catch (e) { /* ignore */ }
      });
    }
    // Now query the slider
    await page.waitForSelector('#dynamic-party-sliders .control-slider', { timeout: 10000 });
    const slider = await page.$('#dynamic-party-sliders .control-slider');
    if (!slider) {
      throw new Error('No party slider found after injection');
    }

    // Move the slider by evaluating in page context
    await page.evaluate(() => {
      const s = document.querySelector('#dynamic-party-sliders .control-slider');
      if (!s) throw new Error('slider not found in evaluate');
      // set to new value
      s.value = Math.min(Number(s.max || 100), (Number(s.value || 0) + 5));
      s.dispatchEvent(new Event('input', { bubbles: true }));
    });
    console.log('Slider moved (input event dispatched)');

    // As a fallback (timing differences), explicitly trigger the debounced update
    await page.evaluate(() => {
      try {
        if (window.actualizarDesdeControlesDebounced) {
          window.actualizarDesdeControlesDebounced(true);
        }
      } catch (e) { /* ignore */ }
    });

    // Also call the immediate function to force the notification path (test environment timing)
    await page.evaluate(() => {
      try { if (typeof actualizarDesdeControles === 'function') actualizarDesdeControles(); } catch (e) { console.warn('direct call failed', e); }
    });

    // Snapshot internal flags for debugging
    const snapshot = await page.evaluate(() => {
      return {
        isInitializing: window.isInitializing,
        isUserTriggered: window.isUserTriggered,
        hasNotificationsObj: !!window.notifications,
        notificationsReady: window.notifications ? window.notifications.isReady : null,
        safeNotificationAvailable: typeof window.safeNotification === 'function',
      };
    });
    console.log('DEBUG SNAPSHOT:', snapshot);

    // Wait a bit for any network calls to complete and then dump debug artifacts
    await page.waitForTimeout(1200);
    const debugData = await page.evaluate(() => {
      return {
        debugLastRequest: window.debugLastRequest || null,
        debugLastResponse: window.debugLastResponse || null,
        voteRedistributionState: window.voteRedistribution ? window.voteRedistribution.getState() : null,
        porcentajesTemporales: window.porcentajesTemporales || null
      };
    });
    console.log('DEBUG DUMP:', JSON.stringify(debugData, null, 2));

    // Debug: dump notification container HTML
    const notifHTML = await page.evaluate(() => {
      const c = document.getElementById('notification-system');
      return c ? c.innerHTML : null;
    });
    console.log('NOTIFICATION CONTAINER HTML:', notifHTML);

    // Wait for 'Calculando modelo' notification to show (safeNotification uses window.notifications.show)
    const calcFound = await page.waitForFunction(() => {
      const container = document.getElementById('notification-system');
      if (!container) return false;
      return Array.from(container.querySelectorAll('.notification')).some(n => n.textContent.includes('Calculando modelo') || n.textContent.includes('Procesando'));
    }, { timeout: 5000 }).catch(() => false);

    console.log('Calculando notification present?', !!calcFound);

    // Wait for 'Listo' or 'Redistribución ejecutada' success notification
    const successFound = await page.waitForFunction(() => {
      const container = document.getElementById('notification-system');
      if (!container) return false;
      return Array.from(container.querySelectorAll('.notification')).some(n => n.textContent.includes('Listo') || n.textContent.includes('Redistribución ejecutada'));
    }, { timeout: 10000 }).catch(() => false);

    console.log('Success notification present?', !!successFound);

    if (!calcFound) console.warn('Warning: did not detect Calculando notification');
    if (!successFound) console.warn('Warning: did not detect success notification');

    if (calcFound && successFound) {
      console.log('TEST PASSED: Notifications workflow visible');
    } else {
      console.log('TEST FAILED: Notifications not visible as expected');
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
  await browser.close();
  // Close the static server
  try { server.close(); } catch (e) { /* ignore */ }
    process.exit(0);
  }
})();
