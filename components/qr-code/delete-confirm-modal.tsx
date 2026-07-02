import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmModal({
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="w-[700px]! p-10 bg-card">
        <AlertDialogHeader className="pb-10">
          <AlertDialogTitle className="space-y-10">
            <Image
              src="/assets/delete-modal-icon.svg"
              alt="Delete Confirmation"
              width={56}
              height={56}
            />
            <span className="font-heading text-[24px] font-bold ">{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-between items-center">
          <AlertDialogCancel
            onClick={onCancel}
            className="flex-1 font-heading text-base py-3 h-12"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-close
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-foreground hover:bg-destructive flex-1 font-heading text-base py-3 h-12"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
