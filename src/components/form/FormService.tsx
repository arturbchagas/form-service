"use client";
import { useState } from "react";
interface UserFormProps {
  onAddItem: (item: {
    name: string;
    phone: string;
    email: string;
    address: string;
    brand: string;
    model: string;
    serialNumber: string;
    defects: string;
    defectsHistory: string;
    status: 'novo'| 'aprovado'| 'reprovado' | 'pago' |'pronto'|'entregue'|'cancelado';
  }) => void;
}
export default function FormService({ onAddItem }: UserFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [defects, setDefects] = useState("");
  const [defectsHistory, setDefectsHistory] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddItem({
      name,
      phone,
      email,
      address,
      brand,
      model,
      serialNumber,
      defects,
      defectsHistory,
      status: "novo",
    });
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setDefects("");
    setDefectsHistory("");
  };
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="dados_cliente">
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Telefone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            E-mail
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Endereço
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
        </div>
        <div className="dados_aparelho">
          <label>
            Marca
            <input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </label>
          <label>
            Modelo
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
          <label>
            Número de série
            <input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </label>
          <label>
            Defeitos
            <input
              value={defects}
              onChange={(e) => setDefects(e.target.value)}
            />
          </label>
          <label>
            Histórico de defeitos
            <input
              value={defectsHistory}
              onChange={(e) => setDefectsHistory(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
