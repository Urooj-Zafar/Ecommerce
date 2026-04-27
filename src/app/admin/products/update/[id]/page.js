import UpdateProductForm from "./UpdateProductForm";
export default async function Page({ params }) {
  const id  = await params.id;

  let categories = [];
  let product = null;

  try {
    const [categoriesRes, productRes] = await Promise.all([
      fetch(`/api/category`).then(r => r.ok ? r.json() : { Category: [] }),
      fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : { single: null })
    ]);

    categories = categoriesRes.Category || [];
    product = productRes.single || null;
  } catch (err) {
    console.error("Fetch failed:", err);
  }

  return <UpdateProductForm product={product} categories={categories} />;
}