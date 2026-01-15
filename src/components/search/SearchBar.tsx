"use client";
interface UserFormProps {
  value: string;
  onChange: (value: string) => void;
}
export default function SearchBar({ value, onChange }: UserFormProps) {
  return (
    <div className="container">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquise aqui"
      ></input>
    </div>
  );
}
