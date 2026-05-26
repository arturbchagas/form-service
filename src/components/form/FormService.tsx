"use client"; // Precisa rodar no browser para gerenciar o estado dos campos

import { useState, useEffect } from "react";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./FormService.module.css";
import DeviceImagePicker from "./DeviceImagePicker";
import { validateDeviceImages } from "@/lib/readImageDataUrls";

// Tipo para criação: exclui campos gerados automaticamente pelo banco
type CreateServiceOrderInput = Omit<FormItem, "id" | "createdAt" | "updatedAt">;

interface UserFormProps {
  onAddItem: (item: CreateServiceOrderInput) => void;     // Callback para criar nova OS
  itemToEdit?: FormItem | null;                           // Se preenchido, o form entra em modo edição
  onUpdateItem?: (id: string, item: CreateServiceOrderInput) => void; // Callback para salvar edição
  onEditDone?: () => void;                                // Callback para avisar que a edição terminou
}

export default function FormService({
  onAddItem,
  itemToEdit,
  onUpdateItem,
  onEditDone,
}: UserFormProps) {
  // Controla se o painel do formulário está aberto ou fechado (accordion)
  const [isOpen, setIsOpen] = useState(false);

  // Um estado para cada campo do formulário
  const [name, setName] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [aparelho, setAparelho] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [defects, setDefects] = useState("");
  const [defectsHistory, setDefectsHistory] = useState("");
  const [deviceImages, setDeviceImages] = useState<string[]>([]);

  // Quando itemToEdit muda (usuário clicou em editar uma OS),
  // preenche todos os campos com os dados da OS existente e abre o formulário.
  // Quando itemToEdit volta para null (edição cancelada), limpa os campos.
  useEffect(() => {
    if (itemToEdit) {
      setIsOpen(true);
      setName(itemToEdit.name ?? "");
      setEmpresa(itemToEdit.empresa ?? "");
      setPhone(itemToEdit.phone ?? "");
      setCep(itemToEdit.cep ?? "");
      setEmail(itemToEdit.email ?? "");
      setAddress(itemToEdit.address ?? "");
      setAparelho(itemToEdit.aparelho ?? "");
      setBrand(itemToEdit.brand ?? "");
      setModel(itemToEdit.model ?? "");
      setSerialNumber(itemToEdit.serialNumber ?? "");
      setDefects(itemToEdit.defects ?? "");
      setDefectsHistory(itemToEdit.defectsHistory ?? "");
      setDeviceImages(itemToEdit.deviceImages?.length ? [...itemToEdit.deviceImages] : []);
    } else {
      // Limpa o formulário quando não está editando
      setName("");
      setEmpresa("");
      setPhone("");
      setCep("");
      setEmail("");
      setAddress("");
      setAparelho("");
      setBrand("");
      setModel("");
      setSerialNumber("");
      setDefects("");
      setDefectsHistory("");
      setDeviceImages([]);
    }
  }, [itemToEdit]); // Roda sempre que itemToEdit mudar

  const imagesValidation = validateDeviceImages(deviceImages);
  const imagesOverLimit = !imagesValidation.ok;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita recarregar a página

    if (!validateDeviceImages(deviceImages).ok) return;

    // Monta o objeto com os dados do formulário
    const formData: CreateServiceOrderInput = {
      name,
      empresa,
      phone,
      cep,
      email,
      address,
      aparelho,
      brand,
      model,
      serialNumber,
      defects,
      defectsHistory,
      deviceImages,
      status: itemToEdit?.status ?? "novo", // Mantém o status atual ao editar
    };

    if (itemToEdit && onUpdateItem && onEditDone) {
      // Modo edição: chama o callback de atualização com o id da OS existente
      onUpdateItem(itemToEdit.id, formData);
      onEditDone();    // Avisa o pai que a edição terminou
      setIsOpen(false);
    } else {
      // Modo criação: chama o callback de criação
      onAddItem(formData);
      // Limpa todos os campos após criar
      setName("");
      setEmpresa("");
      setPhone("");
      setCep("");
      setEmail("");
      setAddress("");
      setAparelho("");
      setBrand("");
      setModel("");
      setSerialNumber("");
      setDefects("");
      setDefectsHistory("");
      setDeviceImages([]);
      setIsOpen(false); // Fecha o painel após enviar
    }
  };

  return (
    <div className={styles.container}>
      {/* Botão que abre/fecha o formulário (estilo accordion) */}
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}       // Acessibilidade: informa o estado para leitores de tela
        aria-controls="form-panel"
        id="form-trigger"
      >
        <span className={styles.triggerLabel}>
          {/* Título muda conforme o modo: criação ou edição */}
          {itemToEdit ? "Editar ordem de serviço" : "Nova ordem de serviço"}
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden>
          ▼
        </span>
      </button>

      {/* Painel expansível — visível apenas quando isOpen = true */}
      <div
        id="form-panel"
        className={`${styles.dropdownPanel} ${isOpen ? styles.dropdownPanelOpen : ""}`}
        role="region"
        aria-labelledby="form-trigger"
      >
        <div className={styles.dropdownPanelInner}>
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Seção 1: dados do cliente */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dados do cliente</h2>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <label htmlFor="name">Nome <span className={styles.optional}>(opcional)</span></label>
                  <input
                    id="name"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="empresa">Empresa <span className={styles.optional}>(opcional)</span></label>
                  <input
                    id="empresa"
                    className={styles.input}
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Telefone</label>
                  <input
                    id="phone"
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cep">CEP <span className={styles.optional}>(opcional)</span></label>
                  <input
                    id="cep"
                    className={styles.input}
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="address">Endereço</label>
                  <input
                    id="address"
                    className={styles.input}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </div>
            </section>

            {/* Seção 2: dados do aparelho/equipamento */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dados do aparelho</h2>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <label htmlFor="aparelho">Aparelho <span className={styles.optional}>(opcional)</span></label>
                  <input
                    id="aparelho"
                    className={styles.input}
                    value={aparelho}
                    onChange={(e) => setAparelho(e.target.value)}
                    placeholder="Ex: Ar condicionado, Giroflex"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="brand">Marca</label>
                  <input
                    id="brand"
                    className={styles.input}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Marca do equipamento"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="model">Modelo</label>
                  <input
                    id="model"
                    className={styles.input}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Modelo"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="serialNumber">Número de série</label>
                  <input
                    id="serialNumber"
                    className={styles.input}
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Nº de série"
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <span className={styles.fieldLabelStatic}>
                    Fotos do aparelho <span className={styles.optional}>(opcional)</span>
                  </span>
                  <DeviceImagePicker images={deviceImages} onChange={setDeviceImages} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="defects">Defeitos <span className={styles.optional}>(opcional)</span></label>
                  <textarea
                    id="defects"
                    className={styles.textarea}
                    value={defects}
                    onChange={(e) => setDefects(e.target.value)}
                    placeholder="Descreva o(s) defeito(s) relatado(s)"
                    rows={4}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="defectsHistory">Histórico de defeitos</label>
                  <textarea
                    id="defectsHistory"
                    className={styles.textareaLarge}
                    value={defectsHistory}
                    onChange={(e) => setDefectsHistory(e.target.value)}
                    placeholder="Histórico de reparos e defeitos anteriores"
                    rows={5}
                  />
                </div>
              </div>
            </section>

            <div className={styles.submitWrapper}>
              {imagesOverLimit && (
                <p className={styles.submitError} role="alert">
                  {imagesValidation.message}
                </p>
              )}
              {/* Botão muda o texto conforme o modo */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={imagesOverLimit}
                title={imagesOverLimit ? imagesValidation.message ?? undefined : undefined}
              >
                {itemToEdit ? "Atualizar" : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
