import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', 
});

api.interceptors.request.use(async (config) => {
  console.log('--- Interceptor Iniciado ---');
  
  try {
    const userDataString = localStorage.getItem('user');
    console.log('Passo 1: String lida do localStorage:', userDataString);

    if (userDataString) {
      console.log('Passo 2: userDataString existe. Tentando fazer o parse...');
      const userData = JSON.parse(userDataString);
      console.log('Passo 3: Parse bem-sucedido. Objeto userData:', userData);

      const token = userData.token;
      console.log('Passo 4: Tentando extrair o token. Valor:', token);

      if (token) {
        console.log('Passo 5: Token existe! Adicionando header...');
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Passo 6: Header de autorização adicionado com sucesso!');
      } else {
        console.error('ERRO: A propriedade "token" não foi encontrada no objeto userData.');
      }
    } else {
      console.warn('AVISO: Nenhuma string "user" encontrada no localStorage.');
    }
  } catch (error) {
    console.error('ERRO CRÍTICO NO INTERCEPTOR:', error);
  }
  
  console.log('--- Interceptor Finalizado ---');
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;