import UpdateProductForm from "./UpdateProductForm";

export default async function Page({ params }) {
  const { id } = await params;

  let categories = [];
  let product = null;

  try {
    const [categoriesRes, productRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`, {
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { Category: [] })),

      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`, {
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { single: null })),
    ]);

    categories = categoriesRes?.Category || [];
    product = productRes?.single || null;
  } catch (err) {
    console.error("Fetch failed:", err);
  }

  return (
    <UpdateProductForm
      product={product}
      categories={categories}
    />
  );
}