import React, { useState, useEffect } from 'react';
import api from '../services/api';

function RegistroVenda() {
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  // Busca a lista de produtos para preencher o <select>
  useEffect(() => {
    const fetchProdutos = async () => {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    };
    fetchProdutos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!produtoId) {
      alert('Por favor, selecione um produto.');
      return;
    }

    const data = {
      produto_id: parseInt(produtoId, 10),
      quantidade: parseInt(quantidade, 10),
    };

    try {
      await api.post('/vendas', data);
      alert('Venda registrada com sucesso!');

    } catch (error) {
      console.error("Erro ao registrar venda:", error);
   
      alert(error.response?.data?.message || 'Erro ao registrar venda.');
    }
  };

  return (
    <div>
      <h2>Registrar Venda</h2>
      <form onSubmit={handleSubmit}>
        <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
          <option value="">Selecione um Produto</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.modelo} (Estoque: {produto.quantidade})
            </option>
          ))}
        </select>
        <input 
          type="number" 
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          min="1"
        />
        <button type="submit">Registrar Venda</button>
      </form>
    </div>
  );
}

export default RegistroVenda;