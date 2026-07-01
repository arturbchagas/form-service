"use client"; // Precisa rodar no browser para gerenciar os modais e interações

import { useState, useEffect, useMemo } from "react";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./TableService.module.css";
import { Eye, Pencil, DollarSign, Trash2, FileText, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import FormMediaUpload, { validateFormMedia } from "../form/FormMediaUpload";
import ReceiptFormModal from "../Receipt/ReceiptFormModal";
import type { ReceiptClientPayload } from "../Receipt/receiptTypes";
import StatusBadge from "../StatusBadge/StatusBadge";
import { resolveMediaForSubmit } from "@/lib/formMedia";

const ITEMS_PER_PAGE = 10;

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

interface UserTableProps {
  items: FormItem[];                                                                   // Lista de OS para exibir
  onView: (item: FormItem) => void;                                                    // Abre modal de visualização
  onEdit: (id: string, data: Omit<FormItem, "id" | "createdAt" | "updatedAt">) => void; // Salva edição
  onDelete: (item: FormItem) => void;                                                  // Exclui a OS
  onUpdatePrice: (item: FormItem, price: number) => void;                              // Atualiza o preço
}

export default function TableService({
  items,
  onView,
  onEdit,
  onDelete,
  onUpdatePrice,
}: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Volta para a primeira página sempre que a lista de itens mudar (ex: busca)
  useEffect(() => { setCurrentPage(1); }, [items]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // OS selecionada para editar o preço (null = modal de preço fechado)
  const [priceModalItem, setPriceModalItem] = useState<FormItem | null>(null);
  const [priceValue, setPriceValue] = useState("");

  const [budgetModalItem, setBudgetModalItem] = useState<FormItem | null>(null);
  const [budgetServiceDescription, setBudgetServiceDescription] = useState("");
  const [budgetObservations, setBudgetObservations] = useState("");

  const [receiptModalItem, setReceiptModalItem] = useState<FormItem | null>(null);

  // OS selecionada para editar os dados completos (null = modal de edição fechado)
  const [editModalItem, setEditModalItem] = useState<FormItem | null>(null);

  // Estados controlados do formulário de edição inline
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
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editAudioFiles, setEditAudioFiles] = useState<File[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editExistingAudios, setEditExistingAudios] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Abre o mini modal de preço e preenche com o preço atual da OS (se existir)
  function openPriceModal(e: React.MouseEvent, item: FormItem) {
    e.stopPropagation(); // Impede que o clique propague para a linha da tabela
    setPriceModalItem(item);
    setPriceValue(item.price != null ? String(item.price) : "");
  }

  function closePriceModal() {
    setPriceModalItem(null);
    setPriceValue("");
  }

  function openBudgetModal(e: React.MouseEvent, item: FormItem) {
    e.stopPropagation();
    setBudgetModalItem(item);
    setBudgetServiceDescription("");
    setBudgetObservations("");
  }

  function closeBudgetModal() {
    setBudgetModalItem(null);
    setBudgetServiceDescription("");
    setBudgetObservations("");
  }

  async function handleConfirmBudgetPdf() {
    if (!budgetModalItem) return;
    const item = budgetModalItem;
    const description = budgetServiceDescription;
    const observations = budgetObservations;
    closeBudgetModal();
    const { generateBudgetPDF } = await import("../Budget/generateBudgetPDF");
    await generateBudgetPDF(item, { serviceDescription: description, observations });
  }

  function openReceiptModal(e: React.MouseEvent, item: FormItem) {
    e.stopPropagation();
    setReceiptModalItem(item);
  }

  function closeReceiptModal() {
    setReceiptModalItem(null);
  }

  async function handleConfirmReceiptPdf(payload: ReceiptClientPayload) {
    if (!receiptModalItem || receiptModalItem.price == null) return;
    const os = receiptModalItem;
    const { generateReceiptPDF } = await import("../Receipt/generateReceipt");
    await generateReceiptPDF(os, payload);
    closeReceiptModal();
  }

  // Valida e salva o preço quando o usuário confirma no modal
  function handleSavePrice() {
    if (!priceModalItem) return;
    // Troca vírgula por ponto para aceitar formato brasileiro (ex: "1.500,00")
    const parsed = parseFloat(priceValue.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) return; // Ignora valores inválidos
    onUpdatePrice(priceModalItem, parsed);
    closePriceModal();
  }

  // Abre o modal de edição e pré-preenche todos os campos com os dados atuais da OS
  function openEditModal(e: React.MouseEvent, item: FormItem) {
    e.stopPropagation();
    setEditModalItem(item);
    setEditName(item.name ?? "");
    setEditEmpresa(item.empresa ?? "");
    setEditPhone(item.phone ?? "");
    setEditCep(item.cep ?? "");
    setEditEmail(item.email ?? "");
    setEditAddress(item.address ?? "");
    setEditAparelho(item.aparelho ?? "");
    setEditBrand(item.brand ?? "");
    setEditModel(item.model ?? "");
    setEditSerialNumber(item.serialNumber ?? "");
    setEditDefects(item.defects ?? "");
    setEditDefectsHistory(item.defectsHistory ?? "");
    setEditExistingImages(item.deviceImages?.length ? [...item.deviceImages] : []);
    setEditExistingAudios(item.deviceAudios?.length ? [...item.deviceAudios] : []);
    setEditImageFiles([]);
    setEditAudioFiles([]);
  }

  function closeEditModal() {
    setEditModalItem(null);
    setEditImageFiles([]);
    setEditAudioFiles([]);
    setEditExistingImages([]);
    setEditExistingAudios([]);
  }

  const editMediaState = useMemo(
    () => ({
      imageFiles: editImageFiles,
      audioFiles: editAudioFiles,
      existingImages: editExistingImages,
      existingAudios: editExistingAudios,
    }),
    [editImageFiles, editAudioFiles, editExistingImages, editExistingAudios]
  );

  const editMediaValidation = useMemo(
    () => validateFormMedia(editMediaState),
    [editMediaState]
  );
  const editMediaInvalid = !editMediaValidation.ok;

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModalItem) return;
    if (!validateFormMedia(editMediaState).ok) return;

    setEditSaving(true);
    try {
      const { deviceImages, deviceAudios } =
        await resolveMediaForSubmit(editMediaState);

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
        deviceImages,
        deviceAudios,
        status: editModalItem.status,
      });
      closeEditModal();
    } finally {
      setEditSaving(false);
    }
  }

  // Exibe mensagem quando não há ordens de serviço (lista vazia ou busca sem resultado)
  if (!items || items.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <p className={styles.emptyState}>Nenhum item para exibir.</p>
      </div>
    );
  }

  return (
    <>
    <div className={styles.tableContainer}>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}>Nome</th>
            <th className={styles.th}>Empresa</th>
            <th className={styles.th}>Aparelho</th>
            <th className={styles.th}>Preço</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Data de criação</th>
            <th className={styles.th}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {paginatedItems.map((item) => (
            <tr className={styles.tr} key={item.id}>
              <td className={styles.td}>{item.name?.trim() ? item.name : "—"}</td>
              <td className={styles.td}>{item.empresa || "—"}</td>
              
              <td className={styles.td}>{item.aparelho?.trim() ? item.aparelho : "—"}</td>
              <td className={styles.td}>
                {/* Formata o preço em Real Brasileiro (R$) se existir */}
                {item.price != null
                  ? item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "—"}
              </td>
              <td className={styles.td}>
                <StatusBadge status={item.status} size="sm" />
              </td>
              <td className={styles.td}>
                {/* Formata a data no padrão dd/mm/aaaa */}
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
                  {/* Botão visualizar: abre o modal de status */}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionView}`}
                    title="Visualizar"
                    onClick={(e) => { e.stopPropagation(); onView(item); }}
                  >
                    <Eye size={16} />
                  </button>

                  {/* Botão editar: abre o modal de edição completa */}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionEdit}`}
                    title="Editar"
                    onClick={(e) => openEditModal(e, item)}
                  >
                    <Pencil size={16} />
                  </button>

                  {/* Botão preço: abre o mini modal para definir o valor */}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionPrice}`}
                    title="Adicionar preço"
                    onClick={(e) => openPriceModal(e, item)}
                  >
                    <DollarSign size={16} />
                  </button>

                  {/* Botão recibo PDF: desabilitado enquanto não houver preço definido.
                      Usa import dinâmico para carregar a lib de PDF apenas quando necessário
                      (evita aumentar o bundle principal) */}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionReceipt}`}
                    title={
                      item.price == null
                        ? "Adicione um preço antes de gerar o recibo"
                        : "Preencher dados e gerar recibo em PDF"
                    }
                    disabled={item.price == null}
                    style={item.price == null ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                    onClick={(e) => openReceiptModal(e, item)}
                  >
                    <FileText size={16} />
                  </button>

                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBudget}`}
                    title="Gerar orçamento PDF"
                    onClick={(e) => openBudgetModal(e, item)}
                  >
                    <FileSpreadsheet size={16} />
                  </button>

                  {/* Botão excluir: deleta a OS após confirmação */}
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
    </div>

    {/* Paginação */}
    {totalPages > 1 && (
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, items.length)} de {items.length}
        </span>

        <div className={styles.pageControls}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            title="Página anterior"
          >
            <ChevronLeft size={15} />
          </button>

          {getPageNumbers(currentPage, totalPages).map((page, idx) =>
            page === "…" ? (
              <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>…</span>
            ) : (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                onClick={() => setCurrentPage(page as number)}
              >
                {page}
              </button>
            )
          )}

          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            title="Próxima página"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    )}
    </div>

      {/* Mini modal de preço — exibido sobre a tabela quando priceModalItem != null */}
      {priceModalItem && (
        // Clique no overlay (fundo escuro) fecha o modal
        <div className={styles.overlay} onClick={closePriceModal}>
          {/* stopPropagation impede que clique dentro do modal feche ele */}
          <div className={styles.miniModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.miniModalHeader}>
              <h3>Adicionar Preço</h3>
              <button className={styles.closeBtn} onClick={closePriceModal}>&times;</button>
            </div>
            <p className={styles.miniModalSub}>O.S.: {priceModalItem.name?.trim() || "—"} — {priceModalItem.aparelho?.trim() || "—"}</p>
            <input
              type="number"
              min="0"
              step="0.01"
              className={styles.priceInput}
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              placeholder="0,00"
              autoFocus // Foca no campo ao abrir o modal para agilizar a digitação
            />
            <div className={styles.miniModalActions}>
              <button type="button" className={styles.cancelBtn} onClick={closePriceModal}>Cancelar</button>
              <button type="button" className={styles.saveBtn} onClick={handleSavePrice}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {receiptModalItem && (
        <ReceiptFormModal
          item={receiptModalItem}
          onClose={closeReceiptModal}
          onConfirm={handleConfirmReceiptPdf}
        />
      )}

      {/* Modal opcional: descrição do serviço antes de gerar o orçamento em PDF */}
      {budgetModalItem && (
        <div className={styles.overlay} onClick={closeBudgetModal}>
          <div className={styles.budgetMiniModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.miniModalHeader}>
              <h3>Gerar orçamento</h3>
              <button type="button" className={styles.closeBtn} onClick={closeBudgetModal} aria-label="Fechar">
                &times;
              </button>
            </div>
            <p className={styles.miniModalSub}>
              O.S.: {budgetModalItem.name?.trim() || "—"} — {budgetModalItem.aparelho?.trim() || "—"}
            </p>
            <label className={styles.budgetLabel} htmlFor="budget-service-desc">
              Descrição do serviço <span className={styles.budgetOptional}>(opcional)</span>
            </label>
            <textarea
              id="budget-service-desc"
              className={styles.budgetTextarea}
              value={budgetServiceDescription}
              onChange={(e) => setBudgetServiceDescription(e.target.value)}
              placeholder="Ex.: conserto do circuito de potência e manutenção"
              rows={4}
              autoFocus
            />
            <label className={styles.budgetLabel} htmlFor="budget-observations">
              Observações <span className={styles.budgetOptional}>(opcional)</span>
            </label>
            <textarea
              id="budget-observations"
              className={styles.budgetTextarea}
              value={budgetObservations}
              onChange={(e) => setBudgetObservations(e.target.value)}
              placeholder="Ex.: prazo estimado de 5 dias úteis"
              rows={3}
            />
            <div className={styles.miniModalActions}>
              <button type="button" className={styles.cancelBtn} onClick={closeBudgetModal}>
                Cancelar
              </button>
              <button type="button" className={styles.saveBtn} onClick={() => void handleConfirmBudgetPdf()}>
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição completa — exibido quando editModalItem != null */}
      {editModalItem && (
        <div className={styles.overlay} onClick={closeEditModal}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.miniModalHeader}>
              <h3>Editar Ordem de Serviço</h3>
              <button className={styles.closeBtn} onClick={closeEditModal}>&times;</button>
            </div>
            <form onSubmit={handleSaveEdit} className={styles.editForm}>
              <div className={styles.editImagesSection}>
                <span className={styles.editImagesLabel}>
                  Anexos <span className={styles.editOptional}>(opcional)</span>
                </span>
                <FormMediaUpload
                  variant="light"
                  imageFiles={editImageFiles}
                  onImageFilesChange={setEditImageFiles}
                  existingImages={editExistingImages}
                  onExistingImagesChange={setEditExistingImages}
                  audioFiles={editAudioFiles}
                  onAudioFilesChange={setEditAudioFiles}
                  existingAudios={editExistingAudios}
                  onExistingAudiosChange={setEditExistingAudios}
                />
              </div>
              <div className={styles.editGrid}>
                <div className={styles.editField}>
                  <label>Nome</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome completo" />
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
                  <label>CEP</label>
                  <input value={editCep} onChange={(e) => setEditCep(e.target.value)} placeholder="00000-000" />
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
                  <label>Aparelho</label>
                  <input value={editAparelho} onChange={(e) => setEditAparelho(e.target.value)} placeholder="Ex: Ar condicionado" />
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
                  <label>Defeitos reclamados</label>
                  <textarea rows={3} value={editDefects} onChange={(e) => setEditDefects(e.target.value)} placeholder="Descreva o(s) defeito(s)" />
                </div>
                <div className={`${styles.editField} ${styles.editFieldFull}`}>
                  <label>Defeitos encontrados e observações</label>
                  <textarea rows={3} value={editDefectsHistory} onChange={(e) => setEditDefectsHistory(e.target.value)} placeholder="Defeitos encontrados durante a análise e observações" />
                </div>
              </div>
              {(editMediaValidation.imageMessage || editMediaValidation.audioMessage) && (
                <div className={styles.imagesSubmitError} role="alert">
                  {editMediaValidation.imageMessage && <p>{editMediaValidation.imageMessage}</p>}
                  {editMediaValidation.audioMessage && <p>{editMediaValidation.audioMessage}</p>}
                </div>
              )}
              <div className={styles.miniModalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeEditModal}>Cancelar</button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={editMediaInvalid || editSaving}
                  title={
                    editMediaInvalid
                      ? [editMediaValidation.imageMessage, editMediaValidation.audioMessage]
                          .filter(Boolean)
                          .join(" ")
                      : undefined
                  }
                >
                  {editSaving ? "Salvando…" : "Atualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
