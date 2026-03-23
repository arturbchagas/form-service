"use client";
import { useState } from "react";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./TableService.module.css";
import { Eye, Pencil, DollarSign, Trash2, FileText } from "lucide-react";

interface UserTableProps {
  items: FormItem[];
  onView: (item: FormItem) => void;
  onEdit: (id: string, data: Omit<FormItem, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (item: FormItem) => void;
  onUpdatePrice: (item: FormItem, price: number) => void;
}

export default function TableService({
  items,
  onView,
  onEdit,
  onDelete,
  onUpdatePrice,
}: UserTableProps) {
  const [priceModalItem, setPriceModalItem] = useState<FormItem | null>(null);
  const [priceValue, setPriceValue] = useState("");
  const [editModalItem, setEditModalItem] = useState<FormItem | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmpresa, setEditEmpresa] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAparelho, setEditAparelho] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editDefects, setEditDefects] = useState("");
  const [editDefectsHistory, setEditDefectsHistory] = useState("");

  function openPriceModal(e: React.MouseEvent, item: FormItem) {
    e.stopPropagation();
    setPriceModalItem(item);
    setPriceValue(item.price != null ? String(item.price) : "");
  }

  function closePriceModal() {
    setPriceModalItem(null);
    setPriceValue("");
  }

  function handleSavePrice() {
    if (!priceModalItem) return;
    const parsed = parseFloat(priceValue.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) return;
    onUpdatePrice(priceModalItem, parsed);
    closePriceModal();
  }

  function openEditModal(e: React.MouseEvent, item: FormItem) {
    e.stopPropagation();
    setEditModalItem(item);
    setEditName(item.name);
    setEditEmpresa(item.empresa ?? "");
    setEditPhone(item.phone ?? "");
    setEditCep(item.cep ?? "");
    setEditEmail(item.email ?? "");
    setEditAddress(item.address ?? "");
    setEditAparelho(item.aparelho ?? "");
    setEditBrand(item.brand ?? "");
    setEditModel(item.model ?? "");
    setEditSerialNumber(item.serialNumber ?? "");
    setEditDefects(item.defects);
    setEditDefectsHistory(item.defectsHistory ?? "");
  }

  function closeEditModal() {
    setEditModalItem(null);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModalItem) return;
    onEdit(editModalItem.id, {
      name: editName,
      empresa: editEmpresa,
      phone: editPhone,
      cep: editCep,
      email: editEmail,
      address: editAddress,
      aparelho: editAparelho,
      brand: editBrand,
      model: editModel,
      serialNumber: editSerialNumber,
      defects: editDefects,
      defectsHistory: editDefectsHistory,
      status: editModalItem.status,
    });
    closeEditModal();
  }

  if (!items || items.length === 0) {
    return <p>Nenhum item para exibir.</p>;
  }

  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}>Nome</th>
            <th className={styles.th}>Empresa</th>
            <th className={styles.th}>Telefone</th>
            <th className={styles.th}>Aparelho</th>
            <th className={styles.th}>Preço</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Data de criação</th>
            <th className={styles.th}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr className={styles.tr} key={item.id}>
              <td className={styles.td}>{item.name}</td>
              <td className={styles.td}>{item.empresa || "—"}</td>
              <td className={styles.td}>{item.phone || "—"}</td>
              <td className={styles.td}>{item.aparelho}</td>
              <td className={styles.td}>
                {item.price != null
                  ? item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "—"}
              </td>
              <td className={styles.td}>{item.status}</td>
              <td className={styles.td}>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionView}`}
                    title="Visualizar"
                    onClick={(e) => { e.stopPropagation(); onView(item); }}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionEdit}`}
                    title="Editar"
                    onClick={(e) => openEditModal(e, item)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionPrice}`}
                    title="Adicionar preço"
                    onClick={(e) => openPriceModal(e, item)}
                  >
                    <DollarSign size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionReceipt}`}
                    title={item.price == null ? "Adicione um preço antes de gerar o recibo" : "Gerar recibo PDF"}
                    disabled={item.price == null}
                    style={item.price == null ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { generateReceiptPDF } = await import("../Receipt/generateReceipt");
                      await generateReceiptPDF(item);
                    }}
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionDelete}`}
                    title="Excluir"
                    onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mini modal de preço */}
      {priceModalItem && (
        <div className={styles.overlay} onClick={closePriceModal}>
          <div className={styles.miniModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.miniModalHeader}>
              <h3>Adicionar Preço</h3>
              <button className={styles.closeBtn} onClick={closePriceModal}>&times;</button>
            </div>
            <p className={styles.miniModalSub}>O.S.: {priceModalItem.name} — {priceModalItem.aparelho}</p>
            <input
              type="number"
              min="0"
              step="0.01"
              className={styles.priceInput}
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              placeholder="0,00"
              autoFocus
            />
            <div className={styles.miniModalActions}>
              <button type="button" className={styles.cancelBtn} onClick={closePriceModal}>Cancelar</button>
              <button type="button" className={styles.saveBtn} onClick={handleSavePrice}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editModalItem && (
        <div className={styles.overlay} onClick={closeEditModal}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.miniModalHeader}>
              <h3>Editar Ordem de Serviço</h3>
              <button className={styles.closeBtn} onClick={closeEditModal}>&times;</button>
            </div>
            <form onSubmit={handleSaveEdit} className={styles.editForm}>
              <div className={styles.editGrid}>
                <div className={styles.editField}>
                  <label>Nome *</label>
                  <input required value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome completo" />
                </div>
                <div className={styles.editField}>
                  <label>Empresa</label>
                  <input value={editEmpresa} onChange={(e) => setEditEmpresa(e.target.value)} placeholder="Nome da empresa" />
                </div>
                <div className={styles.editField}>
                  <label>Telefone</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className={styles.editField}>
                  <label>CEP *</label>
                  <input required value={editCep} onChange={(e) => setEditCep(e.target.value)} placeholder="00000-000" />
                </div>
                <div className={styles.editField}>
                  <label>E-mail</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="email@exemplo.com" />
                </div>
                <div className={`${styles.editField} ${styles.editFieldFull}`}>
                  <label>Endereço</label>
                  <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" />
                </div>
                <div className={styles.editField}>
                  <label>Aparelho *</label>
                  <input required value={editAparelho} onChange={(e) => setEditAparelho(e.target.value)} placeholder="Ex: Ar condicionado" />
                </div>
                <div className={styles.editField}>
                  <label>Marca</label>
                  <input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} placeholder="Marca" />
                </div>
                <div className={styles.editField}>
                  <label>Modelo</label>
                  <input value={editModel} onChange={(e) => setEditModel(e.target.value)} placeholder="Modelo" />
                </div>
                <div className={styles.editField}>
                  <label>Número de série</label>
                  <input value={editSerialNumber} onChange={(e) => setEditSerialNumber(e.target.value)} placeholder="Nº de série" />
                </div>
                <div className={`${styles.editField} ${styles.editFieldFull}`}>
                  <label>Defeitos *</label>
                  <textarea required rows={3} value={editDefects} onChange={(e) => setEditDefects(e.target.value)} placeholder="Descreva o(s) defeito(s)" />
                </div>
                <div className={`${styles.editField} ${styles.editFieldFull}`}>
                  <label>Histórico de defeitos</label>
                  <textarea rows={3} value={editDefectsHistory} onChange={(e) => setEditDefectsHistory(e.target.value)} placeholder="Histórico de reparos anteriores" />
                </div>
              </div>
              <div className={styles.miniModalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeEditModal}>Cancelar</button>
                <button type="submit" className={styles.saveBtn}>Atualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
