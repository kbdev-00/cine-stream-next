import Link from "next/link";

export default function MovieIndexPage() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Movies Directory</h2>
      <p>Search for popular movies on the <Link href="/" style={{ color: "red", textDecoration: "underline" }}>home page</Link>.</p>
    </div>
  );
}
