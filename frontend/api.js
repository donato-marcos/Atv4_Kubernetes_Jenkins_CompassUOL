document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.endpoint-card');
  const responseDiv = document.getElementById('response');
  const loadingDiv = document.getElementById('loading');
  const statusIndicator = document.getElementById('statusIndicator');
  const responseMeta = document.getElementById('responseMeta');

  buttons.forEach(button => {
    button.addEventListener('click', async function (event) {
      event.preventDefault();
      const endpoint = this.getAttribute('data-endpoint');
      await callApi(endpoint);
    });
  });

  async function callApi(endpoint) {
    loadingDiv.classList.remove('hidden');
    responseDiv.innerHTML = '';
    statusIndicator.classList.remove('active');

    try {
      const startTime = performance.now();
      const response = await fetch(`/api${endpoint}`);
      const duration = (performance.now() - startTime).toFixed(0);

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      statusIndicator.classList.add('active');
      responseMeta.textContent = `${response.status} • ${duration}ms`;
      displayResponse(data, endpoint);

    } catch (error) {
      responseDiv.innerHTML = `
        <div class="error-message fade-in">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error: ${error.message}</p>
        </div>
      `;
      statusIndicator.style.backgroundColor = 'var(--error)';
      console.error('API request failed:', error);
    } finally {
      loadingDiv.classList.add('hidden');
    }
  }

  function displayResponse(data, endpoint) {
    let content = '';
    const responseContainer = document.createElement('div');
    responseContainer.className = 'fade-in';

    switch (endpoint) {
      case '/color':
        content = `
          <div class="color-box" style="background-color: ${data.color};"></div>
          <p style="text-align: center; font-size: 1.1rem;">
            Hex: <strong>${data.color}</strong>
          </p>
        `;
        break;

      case '/cat':
      case '/random-photo':
      case '/scare':
      case '/lookalike':
        const key = Object.keys(data)[0];
        content = `
          <img class="api-image" src="${data[key]}" alt="API response image">
          <div style="text-align: center; margin-top: 12px;">
            <button class="refresh-btn" type="button" onclick="window.location.reload()">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        `;
        break;

      default:
        content = `
          <div class="pre-formatted">${JSON.stringify(data, null, 2)}</div>
        `;
    }

    responseContainer.innerHTML = content;
    responseDiv.appendChild(responseContainer);
  }
});