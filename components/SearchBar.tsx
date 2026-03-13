"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      if (debouncedQuery.trim() === "") {
        router.push("/");
      } else {
        router.push(`/?query=${encodeURIComponent(debouncedQuery)}`);
      }
    }
  }, [debouncedQuery, router, initialQuery]);

  return (
    <input
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      style={{
        padding: "10px",
        width: "300px",
        marginBottom: "15px",
        borderRadius: "5px",
        border: "none",
        marginRight: "20px",
        color: "black"
      }}
    />
  );
}
