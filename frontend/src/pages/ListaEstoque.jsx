import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import Header from '../components/Header';
import '../assets/css/main.css'; // <--- A nova importação de CSS
import '../assets/css/modal.css'; // O modal usa classes específicas

const ListaEstoque = () => {
    const [produtos, setProdutos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);

    const fetchProdutos = async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data);
            setLoading(false);
        } catch (err) {
            setError('Não foi possível carregar os produtos. Verifique sua conexão.');
            setLoading(false);
            console.error('Erro ao buscar produtos:', err);
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    const handleEdit = (product) => {
        setEditingProduct({ ...product });
    };

    const handleDelete = (product) => {
        setDeletingProduct(product);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/produtos/${editingProduct.id}`, editingProduct);
            await fetchProdutos();
            setEditingProduct(null);
        } catch (err) {
            setError('Falha ao atualizar o produto.');
            console.error('Erro ao atualizar produto:', err);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/produtos/${deletingProduct.id}`);
            await fetchProdutos();
            setDeletingProduct(null);
        } catch (err) {
            setError('Falha ao excluir o produto.');
            console.error('Erro ao excluir produto:', err);
        }
    };

    const filteredProdutos = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p className="loading-message">Carregando...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <>
            <Header />
            <div className="container">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {filteredProdutos.length > 0 ? (
                    <table className="professional-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Preço</th>
                                <th>Quantidade</th>
                                <th>Descrição</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProdutos.map(produto => (
                                <tr key={produto.id}>
                                    <td>{produto.nome}</td>
                                    <td>R$ {parseFloat(produto.preco).toFixed(2)}</td>
                                    <td className={produto.quantidade < 10 ? 'low-stock' : ''}>{produto.quantidade}</td>
                                    <td>{produto.descricao}</td>
                                    <td>
                                        <button className="action-button edit-button" onClick={() => handleEdit(produto)}>Editar</button>
                                        <button className="action-button delete-button" onClick={() => handleDelete(produto)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-products-message">Nenhum produto encontrado.</p>
                )}
            </div>

            {/* Modal de Edição */}
            {editingProduct && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Editar Produto</h2>
                        <form className="modal-form" onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={editingProduct.nome}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, nome: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Preço</label>
                                <input
                                    type="number"
                                    value={editingProduct.preco}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, preco: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantidade</label>
                                <input
                                    type="number"
                                    value={editingProduct.quantidade}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, quantidade: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-button">Salvar</button>
                                <button type="button" className="cancel-button" onClick={() => setEditingProduct(null)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {deletingProduct && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirmar Exclusão</h2>
                        <p>Tem certeza que deseja excluir o produto <strong>{deletingProduct.nome}</strong>?</p>
                        <div className="form-actions">
                            <button className="confirm-delete-button" onClick={handleConfirmDelete}>Sim, Excluir</button>
                            <button className="cancel-button" onClick={() => setDeletingProduct(null)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListaEstoque;