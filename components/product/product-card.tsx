"use client";

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HtmlContent } from "@/components/ui/html-content";

interface ProductCardProps {
  product: {
    _id: string;
    productName: string;
    price: number | string;
    productType?: string;
    quantity?: number;
    img?: string;
    imgs?: string[];
    description?: string;
    feature?: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const displayImage =
    product.img ||
    (product.imgs && product.imgs.length > 0 ? product.imgs[0] : null);

  return (
    <Card className="overflow-hidden flex flex-col max-h-[500px] hover:shadow-md transition-shadow p-0 gap-2">
      <div className="aspect-square relative bg-muted/50 overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.productName}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            No Image
          </div>
        )}
        {product.quantity === 0 && (
          <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground px-2 py-1 text-xs font-bold rounded">
            Out of Stock
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg truncate" title={product.productName}>
          {product.productName}
        </CardTitle>
        <div className="flex justify-between items-center mt-1">
          <span className="font-semibold text-lg">${product.price}</span>
          <span className="text-xs text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full">
            {product.productType || "Card"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 grow">
        <HtmlContent
          html={
            product.description || product.feature || "No description available"
          }
          asPlainText
          className="text-sm text-muted-foreground line-clamp-2"
        />
      </CardContent>
      <CardFooter className="p-4 border-t flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(product._id)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="shrink-0"
          onClick={() => onDelete(product._id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
