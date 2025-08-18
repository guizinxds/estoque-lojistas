import React, { useState } from 'react';
import api from '../services/api'; // Importa a API configurada

function CadastroProduto() {
  const [modelo, setModelo] = useState('');
  const [valor, setValor] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    const data = {
      modelo,
      valor: parseFloat(valor), // Converte para número
      quantidade: parseInt(quantidade, 10), // Converte para número inteiro
    };

    try {
      // Faz a chamada para a rota de cadastro de produtos no backend
      await api.post('api/produtos', data);
      alert('Produto cadastrado com sucesso!');
      // Limpar formulário ou redirecionar o usuário
      setModelo('');
      setValor('');
      setQuantidade('');
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert('Erro ao cadastrar produto. Verifique o console.');
    }
  };

  return (
    <div>
      <h2>Cadastro de Produto</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={modelo} 
          onChange={(e) => setModelo(e.target.value)} 
          placeholder="Modelo do Produto" 
        />
        <input 
          type="number" 
          value={valor} 
          onChange={(e) => setValor(e.target.value)} 
          placeholder="Valor" 
        />
        <input 
          type="number" 
          value={quantidade} 
          onChange={(e) => setQuantidade(e.target.value)} 
          placeholder="Quantidade" 
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default CadastroProduto;