import { Suspense } from "react";
import FilteredProducts from "./FilteredProducts";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center mt-10 text-lg">
          Loading products...
        </p>
      }
    >
      <FilteredProducts />
    </Suspense>
  );
}