"use client";

import type { ClientFormValues } from "@/types/client/ClientItem";
import styles from "../shared/FormFields.module.css";

type ClientFormFieldsProps = {
  values: ClientFormValues;
  onChange: (patch: Partial<ClientFormValues>) => void;
  idPrefix?: string;
};

export default function ClientFormFields({
  values,
  onChange,
  idPrefix = "client",
}: ClientFormFieldsProps) {
  return (
    <div className={styles.fieldsGrid}>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-name`}>
          Nome <span className={styles.optional}>(opcional)</span>
        </label>
        <input
          id={`${idPrefix}-name`}
          className={styles.input}
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Nome completo"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-empresa`}>
          Empresa <span className={styles.optional}>(opcional)</span>
        </label>
        <input
          id={`${idPrefix}-empresa`}
          className={styles.input}
          value={values.empresa}
          onChange={(e) => onChange({ empresa: e.target.value })}
          placeholder="Nome da empresa"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-phone`}>Telefone</label>
        <input
          id={`${idPrefix}-phone`}
          className={styles.input}
          value={values.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="(00) 00000-0000"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-cep`}>
          CEP <span className={styles.optional}>(opcional)</span>
        </label>
        <input
          id={`${idPrefix}-cep`}
          className={styles.input}
          value={values.cep}
          onChange={(e) => onChange({ cep: e.target.value })}
          placeholder="00000-000"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-email`}>E-mail</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          className={styles.input}
          value={values.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="email@exemplo.com"
        />
      </div>
      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label htmlFor={`${idPrefix}-address`}>Endereço</label>
        <input
          id={`${idPrefix}-address`}
          className={styles.input}
          value={values.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Rua, número, bairro, cidade"
        />
      </div>
    </div>
  );
}

export const EMPTY_CLIENT_FORM: ClientFormValues = {
  name: "",
  empresa: "",
  phone: "",
  cep: "",
  email: "",
  address: "",
};
