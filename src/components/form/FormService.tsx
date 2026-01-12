"use client";
import { useState } from "react";
interface UserFormProps {
  onAddItem: (item: {
    name: string;
    phone: string;
    address: string;
    brand: string;
    model: string;
  }) => void;
}
export default function FormService({ onAddItem }: UserFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddItem({ name, phone, address, brand, model });
    setName("");
    setPhone("");
    setAddress("");
    setBrand("");
    setModel("");
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
        </div>
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
