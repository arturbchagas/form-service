"use client";

import { useState, useEffect, useMemo } from "react";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./FormService.module.css";
import FormMediaUpload, { validateFormMedia } from "./FormMediaUpload";
import {
  buildServiceOrderFormData,
  resolveMediaForSubmit,
} from "@/lib/formMedia";

type CreateServiceOrderInput = Omit<FormItem, "id" | "createdAt" | "updatedAt">;

interface UserFormProps {
  onAddItem: (item: CreateServiceOrderInput) => void;
  itemToEdit?: FormItem | null;
  onUpdateItem?: (id: string, item: CreateServiceOrderInput) => void;
  onEditDone?: () => void;
}

export default function FormService({
  onAddItem,
  itemToEdit,
  onUpdateItem,
  onEditDone,
}: UserFormProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingAudios, setExistingAudios] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setExistingImages(
        itemToEdit.deviceImages?.length ? [...itemToEdit.deviceImages] : []
      );
      setExistingAudios(
        itemToEdit.deviceAudios?.length ? [...itemToEdit.deviceAudios] : []
      );
      setImageFiles([]);
      setAudioFiles([]);
    } else {
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
      setImageFiles([]);
      setAudioFiles([]);
      setExistingImages([]);
      setExistingAudios([]);
    }
  }, [itemToEdit]);

  const mediaState = useMemo(
    () => ({
      imageFiles,
      audioFiles,
      existingImages,
      existingAudios,
    }),
    [imageFiles, audioFiles, existingImages, existingAudios]
  );

  const mediaValidation = useMemo(
    () => validateFormMedia(mediaState),
    [mediaState]
  );
  const mediaInvalid = !mediaValidation.ok;

  const resetMedia = () => {
    setImageFiles([]);
    setAudioFiles([]);
    setExistingImages([]);
    setExistingAudios([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFormMedia(mediaState).ok) return;

    setIsSubmitting(true);
    try {
      const { deviceImages, deviceAudios } = await resolveMediaForSubmit(mediaState);

      const submissionFormData = buildServiceOrderFormData(
        {
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
        },
        imageFiles,
        audioFiles
      );
      void submissionFormData;

      const payload: CreateServiceOrderInput = {
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
        deviceAudios,
        status: itemToEdit?.status ?? "novo",
      };

      if (itemToEdit && onUpdateItem && onEditDone) {
        onUpdateItem(itemToEdit.id, payload);
        onEditDone();
        setIsOpen(false);
      } else {
        onAddItem(payload);
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
        resetMedia();
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitErrors = [
    mediaValidation.imageMessage,
    mediaValidation.audioMessage,
  ].filter(Boolean) as string[];

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="form-panel"
        id="form-trigger"
      >
        <span className={styles.triggerLabel}>
          {itemToEdit ? "Editar ordem de serviço" : "Nova ordem de serviço"}
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden>
          ▼
        </span>
      </button>

      <div
        id="form-panel"
        className={`${styles.dropdownPanel} ${isOpen ? styles.dropdownPanelOpen : ""}`}
        role="region"
        aria-labelledby="form-trigger"
      >
        <div className={styles.dropdownPanelInner}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dados do cliente</h2>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <label htmlFor="name">
                    Nome <span className={styles.optional}>(opcional)</span>
                  </label>
                  <input
                    id="name"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="empresa">
                    Empresa <span className={styles.optional}>(opcional)</span>
                  </label>
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
                  <label htmlFor="cep">
                    CEP <span className={styles.optional}>(opcional)</span>
                  </label>
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

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dados do aparelho</h2>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <label htmlFor="aparelho">
                    Aparelho <span className={styles.optional}>(opcional)</span>
                  </label>
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
                    Anexos <span className={styles.optional}>(opcional)</span>
                  </span>
                  <FormMediaUpload
                    imageFiles={imageFiles}
                    onImageFilesChange={setImageFiles}
                    existingImages={existingImages}
                    onExistingImagesChange={setExistingImages}
                    audioFiles={audioFiles}
                    onAudioFilesChange={setAudioFiles}
                    existingAudios={existingAudios}
                    onExistingAudiosChange={setExistingAudios}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="defects">
                    Defeitos reclamados <span className={styles.optional}>(opcional)</span>
                  </label>
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
                  <label htmlFor="defectsHistory">Defeitos encontrados e observações</label>
                  <textarea
                    id="defectsHistory"
                    className={styles.textareaLarge}
                    value={defectsHistory}
                    onChange={(e) => setDefectsHistory(e.target.value)}
                    placeholder="Defeitos encontrados durante a análise e observações"
                    rows={5}
                  />
                </div>
              </div>
            </section>

            <div className={styles.submitWrapper}>
              {submitErrors.map((msg) => (
                <p key={msg} className={styles.submitError} role="alert">
                  {msg}
                </p>
              ))}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={mediaInvalid || isSubmitting}
                title={
                  mediaInvalid
                    ? submitErrors.join(" ")
                    : undefined
                }
              >
                {isSubmitting
                  ? "Enviando…"
                  : itemToEdit
                    ? "Atualizar"
                    : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
