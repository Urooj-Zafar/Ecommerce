import UpdateProductForm from "./UpdateProductForm";

export default async function Page({ params }) {
  const { id } = await params;

  return <UpdateProductForm id={id} />;
}