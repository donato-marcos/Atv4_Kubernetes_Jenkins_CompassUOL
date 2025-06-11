// Espera o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
  // Seleciona todos os botões
  const buttons = document.querySelectorAll('button[data-endpoint]');
  const responseDiv = document.getElementById('response');

  // Adiciona evento de clique a cada botão
  buttons.forEach(button => {
    button.addEventListener('click', async function() {
      const endpoint = this.getAttribute('data-endpoint');
      await callApi(endpoint);
    });
  });

  // Função para chamar a API
  async function callApi(endpoint) {
    responseDiv.innerHTML = '<p>Carregando...</p>';

    try {
      const response = await fetch(`/api${endpoint}`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      displayResponse(data, endpoint);
    } catch (error) {
      responseDiv.innerHTML = `<p class="error">Erro: ${error.message}</p>`;
      console.error('Erro na requisição:', error);
    }
  }

  // Função para exibir a resposta
  function displayResponse(data, endpoint) {
    let content = '';

    switch (endpoint) {
      case '/color':
        content = `
          <div class="color-box" style="background-color: ${data.color};"></div>
          <p>Cor hexadecimal: <strong>${data.color}</strong></p>
        `;
        break;

      case '/cat':
      case '/random-photo':
      case '/scare':
      case '/lookalike':
        const key = Object.keys(data)[0];
        content = `<img id="imageResponse" src="${data[key]}" alt="Resposta da API">`;
        break;

      default:
        content = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    responseDiv.innerHTML = content;
  }
});

