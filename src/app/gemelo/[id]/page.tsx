"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <div style={{ color: "white", padding: 40, fontSize: 24 }}>Gemelo: {id} ✅</div>;
}
