// Função auxiliar para gerar token do Credere
export async function generateCredereToken(clientId, clientSecret) {
  try {
    // Método 1: Seguindo a documentação do Credere
    console.log('Tentando com grant_type authorization_code...');
    
    // Para integração embedded, o Credere pode usar um fluxo simplificado
    const response = await fetch('https://app.meucredere.com.br/api/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'embedded',
        // Para embedded, alguns sistemas permitem um código especial
        code: 'embedded_integration',
        redirect_uri: 'https://www.atriaveiculos.com/callback'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro authorization_code:', errorText);
      throw new Error(`authorization_code falhou: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Authorization code não funcionou, tentando client_credentials...');
    
    // Método 2: Tenta client_credentials (método padrão para integrações)
    try {
      console.log('Tentando com grant_type client_credentials...');
      const clientCredResponse = await fetch('https://app.meucredere.com.br/api/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'embedded'
        })
      });

      if (!clientCredResponse.ok) {
        const errorText = await clientCredResponse.text();
        console.error('Erro client_credentials:', errorText);
        throw new Error(`client_credentials falhou: ${clientCredResponse.status}`);
      }

      const clientCredData = await clientCredResponse.json();
      console.log('Client credentials funcionou!');
      return clientCredData.access_token;
    } catch (clientCredError) {
      console.error('Client credentials falhou:', clientCredError);
    }
    
    // Método 3: Tenta com credenciais de usuário (password grant)
    try {
      console.log('Tentando com grant_type password (login de usuário)...');
      const passwordResponse = await fetch('https://app.meucredere.com.br/api/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: clientId,  // email
          password: clientSecret,  // senha
          scope: 'embedded'
        })
      });

      if (!passwordResponse.ok) {
        const errorText = await passwordResponse.text();
        console.error('Erro login usuário:', errorText);
        throw new Error(`Login usuário falhou: ${passwordResponse.status}`);
      }

      const passwordData = await passwordResponse.json();
      console.log('Login de usuário funcionou!');
      return passwordData.access_token;
    } catch (passwordError) {
      console.error('Login de usuário também falhou:', passwordError);
    }
    
    // Método 3: Tenta método alternativo com Basic Auth
    try {
      const authString = btoa(`${clientId}:${clientSecret}`);
      const altResponse = await fetch('https://app.meucredere.com.br/api/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=embedded'
      });

      if (!altResponse.ok) {
        throw new Error(`Método alternativo falhou: ${altResponse.status}`);
      }

      const altData = await altResponse.json();
      return altData.access_token;
    } catch (altError) {
      console.error('Método alternativo também falhou:', altError);
      throw error;
    }
  }
}

// Função para testar as credenciais
export async function testCredereCredentials(clientId, clientSecret) {
  try {
    const token = await generateCredereToken(clientId, clientSecret);
    if (token) {
      console.log('Token gerado com sucesso!');
      return { success: true, token };
    }
  } catch (error) {
    console.error('Falha ao testar credenciais:', error);
    return { success: false, error: error.message };
  }
}