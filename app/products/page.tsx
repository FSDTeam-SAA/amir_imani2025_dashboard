"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useProducts } from "@/lib/hooks/use-products";
import { useDeleteProduct } from "@/lib/hooks/use-delete-product";
import { DeleteConfirmModal } from "@/components/qr-code/delete-confirm-modal";
import { ProductGridSkeleton } from "@/components/skeletons";
import { ProductCard } from "@/components/product/product-card";
import { ProductHeader } from "@/components/product/product-header";

const Tabs = TabsPrimitive.Root;

export default function ProductsPage() {
  const router = useRouter();
  const { data: products, isLoading, isError } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const [activeTab, setActiveTab] = useState("card");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        },
      });
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const type = product.productType?.toLowerCase() || "card";
      if (activeTab === "card") return type === "card";
      if (activeTab === "merchandise")
        return type === "marchandice" || type === "merchandise";
      return true;
    });
  }, [products, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    signOut({ callbackUrl: "/login" });
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto md:p-6 pt-4 p-4">
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] text-red-500">
        Failed to load products.
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="card"
      onValueChange={setActiveTab}
      className="flex flex-col h-full"
    >
      <ProductHeader
        onAddProduct={() => router.push("/products/new")}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-auto md:p-6 pt-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">
                Try switching tabs or adding a new product.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={(id) => router.push(`/products/${id}`)}
                onDelete={handleDeleteClick}
              />
            ))
          )}
        </div>

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
        />
      </div>
    </Tabs>
  );
}
