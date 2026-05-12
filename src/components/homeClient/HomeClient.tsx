"use client"; // Client Component — gerencia toda a interatividade da página principal

import { useState } from "react";
import styles from "../../app/page.module.css";
import FormService from "../form/FormService";
import TableService from "../Table/TableService";
import SearchBar from "../search/SearchBar";
import Modal from "../modal/Modal";
import { FormItem } from "../../types/Form-itens/FormItem";
import {
  createServiceOrder,
  updateStatus,
  updateServiceOrder,
  deleteServiceOrder,
  updatePrice,
} from "../../app/action";

interface HomeClientProps {
  // Dados iniciais vindos do servidor (page.tsx), evitando uma segunda requisição ao banco
  initialItems: FormItem[];
}

// HomeClient é o "cérebro" da interface: recebe os dados do servidor e
// coordena todos os componentes filhos (formulário, tabela, busca, modal).
export default function HomeClient({ initialItems }: HomeClientProps) {
  // Lista de ordens exibida na tabela — começa com os dados do servidor
  const [items, setItems] = useState<FormItem[]>(initialItems);

  // Texto digitado na barra de busca
  const [searchValue, setSearchValue] = useState("");

  // OS selecionada para visualização no modal (null = modal fechado)
  const [selectedItems, setSelectedItems] = useState<FormItem | null>(null);

  // Atualiza o status otimisticamente: muda na tela primeiro, depois sincroniza com o banco.
  // Isso faz a UI parecer instantânea mesmo que a requisição demore.
  function handleStatusChange(status: FormItem["status"]) {
    if (!selectedItems) return;

    const currentId = selectedItems.id;

    // Atualiza o estado local imediatamente (otimista)
    setSelectedItems({ ...selectedItems, status });
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === currentId ? { ...item, status } : item
      )
    );

    // Sincroniza com o banco em background — se falhar, apenas loga o erro
    updateStatus(currentId, status).catch((error) => {
      console.error("Erro ao atualizar status da ordem de serviço:", error);
    });
  }

  // Abre o modal de visualização para a OS clicada
  function handleView(item: FormItem) {
    setSelectedItems(item);
  }

  // Fecha o modal limpando a seleção
  function handleCloseModal() {
    setSelectedItems(null);
  }

  // Exibe confirmação antes de deletar e remove da lista local após sucesso
  async function handleDelete(item: FormItem) {
    if (!confirm(`Excluir a O.S. de "${item.name?.trim() || "sem identificação"}"?`)) return;
    try {
      await deleteServiceOrder(item.id);
      // Remove do estado local para atualizar a tabela sem recarregar a página
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error("Erro ao excluir ordem de serviço:", error);
    }
  }

  // Salva a edição e substitui o item antigo pelo atualizado na lista local
  async function handleUpdateItem(
    id: string,
    data: Omit<FormItem, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const updated = await updateServiceOrder(id, data);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (error) {
      console.error("Erro ao atualizar ordem de serviço:", error);
    }
  }

  // Atualiza o preço de uma OS e reflete na tabela imediatamente
  async function handleUpdatePrice(item: FormItem, price: number) {
    try {
      await updatePrice(item.id, price);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, price } : i))
      );
    } catch (error) {
      console.error("Erro ao atualizar preço:", error);
    }
  }

  // Cria uma nova OS e adiciona no topo da lista (mais recente primeiro)
  async function handleAddItem(
    item: Omit<FormItem, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const created = await createServiceOrder(item);
      setItems((prev) => [created, ...prev]);
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error);
    }
  }

  // Normaliza o texto de busca: sem espaços extras e em minúsculas para comparação
  const searchLower = searchValue.trim().toLowerCase();

  // Formata datas no padrão brasileiro (dd/mm/aaaa)
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Filtra os itens em tempo real conforme o usuário digita.
  // Busca em nome, empresa, aparelho e data de criação.
  const filteredItems = items.filter((item) => {
    if (!searchLower) return true; // Sem busca = mostra tudo
    const matchesName = (item.name ?? "").toLowerCase().includes(searchLower);
    const matchesEmpresa = (item.empresa ?? "").toLowerCase().includes(searchLower);
    const matchesAparelho = (item.aparelho ?? "").toLowerCase().includes(searchLower);
    const dateStr = formatDate(item.createdAt);
    const matchesDate = dateStr.includes(searchLower);
    return matchesName || matchesEmpresa || matchesAparelho || matchesDate;
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Formulário de criação de nova OS (expansível/recolhível) */}
        <FormService onAddItem={handleAddItem} />

        {/* Barra de busca — filtra a lista localmente sem ir ao banco */}
        <SearchBar value={searchValue} onChange={setSearchValue} />

        <div className={styles.tableSection}>
          {/* Tabela exibe apenas os itens que passaram pelo filtro */}
          <TableService
            items={filteredItems}
            onView={handleView}
            onEdit={handleUpdateItem}
            onDelete={handleDelete}
            onUpdatePrice={handleUpdatePrice}
          />
        </div>

        {/* Modal só renderiza quando há uma OS selecionada */}
        {selectedItems && (
          <Modal
            items={selectedItems}
            onChangeStatus={handleStatusChange}
            closeModal={handleCloseModal}
          />
        )}
      </main>
    </div>
  );
}
