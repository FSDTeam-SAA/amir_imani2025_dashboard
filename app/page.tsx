"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/qr-code/sidebar";
import { MobileSidebar } from "@/components/qr-code/mobile-sidebar";
import { QRCodeTable } from "@/components/qr-code/qr-code-table";
import { QRCodeGrid } from "@/components/qr-code/qr-code-grid";
import { SearchBar } from "@/components/qr-code/search-bar";
import { QRCodeForm } from "@/components/qr-code/qr-code-form";
import { ViewQRModal } from "@/components/qr-code/view-qr-modal";
import { DeleteConfirmModal } from "@/components/qr-code/delete-confirm-modal";
import { SuccessModal } from "@/components/qr-code/success-modal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Layout, LayoutGrid, List } from "lucide-react";
import { useQRCodes } from "@/lib/hooks/use-qr-codes";
import { useCreateQRCode } from "@/lib/hooks/use-create-qr-code";
import { useUpdateQRCode } from "@/lib/hooks/use-update-qr-code";
import { useDeleteQRCode } from "@/lib/hooks/use-delete-qr-code";
import { useQRCodeState } from "@/lib/hooks/use-qr-code-state";
import type {
  QRCode,
  CreateQRCodeInput,
  UpdateQRCodeInput,
} from "@/lib/types/qr-code";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function Page() {
  const state = useQRCodeState();
  const { qrCodes, pagination, isLoading } = useQRCodes({
    page: state.page,
    pageSize: state.pageSize,
    search: state.search,
    status: state.status,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  });

  // console.log(qrCodes);

  const { create, isLoading: isCreating } = useCreateQRCode();
  const { update, isLoading: isUpdating } = useUpdateQRCode();
  const { delete: deleteQR, isLoading: isDeleting } = useDeleteQRCode();

  const [viewedQRCode, setViewedQRCode] = useState<QRCode | null>(null);
  const [editingQRCode, setEditingQRCode] = useState<QRCode | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Handle create form submission
  const handleCreateSubmit = async (data: CreateQRCodeInput) => {
    const result = await create(data);
    if (result) {
      setIsCreateModalOpen(false);
      setIsSuccessModalOpen(true);
    }
  };

  // Handle update form submission
  const handleUpdateSubmit = async (data: UpdateQRCodeInput) => {
    if (!editingQRCode) return;
    const result = await update(editingQRCode._id, data);
    if (result) {
      setEditingQRCode(null);
      setIsCreateModalOpen(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    // console.log("🗑️ handleDelete called");
    // console.log("Selected QR ID:", state.selectedQRId);

    if (!state.selectedQRId) {
      toast.error("No QR ID selected, aborting delete");
      return;
    }

    try {
      console.log("🚀 Calling deleteQR with ID:", state.selectedQRId);
      const result = await deleteQR(state.selectedQRId);
      toast.success(`✅ Delete successful, result: ${result}`);

      // Success - mutation already shows toast and updates cache
      state.setIsDeleteModalOpen(false);
      state.setSelectedQRId(null);
    } catch (error) {
      // Error - mutation already shows error toast and rolls back
      // Keep modal open so user can try again or cancel
      toast.error(`❌ Delete failed: ${error}`);
    }
  };

  // Handle view QR
  const handleView = (_id: string) => {
    const qr = qrCodes.find((q) => q._id === _id);
    if (qr) {
      setViewedQRCode(qr);
      setIsViewModalOpen(true);
    }
  };

  // Handle edit QR
  const handleEdit = (id: string) => {
    const qr = qrCodes.find((q) => q._id === id);
    if (qr) {
      setEditingQRCode(qr);
      setIsCreateModalOpen(true);
    }
  };

  // Handle delete trigger
  const handleDeleteTrigger = (id: string) => {
    state.setSelectedQRId(id);
    state.setIsDeleteModalOpen(true);
  };

  // Handle download QR code - High resolution for printing
  const handleDownload = (id: string) => {
    const qr = qrCodes.find((q) => q._id === id);
    if (qr?.qrCode) {
      // Create an image element to load the QR code
      const img = document.createElement("img");
      img.crossOrigin = "anonymous"; // Handle CORS if needed

      img.onload = () => {
        // Create a canvas with high resolution (2048x2048 for printing)
        const canvas = document.createElement("canvas");
        const size = 2048; // High resolution for printing
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill with white background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);

          // Draw the QR code scaled up
          ctx.imageSmoothingEnabled = false; // Keep sharp edges for QR code
          ctx.drawImage(img, 0, 0, size, size);

          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${qr.gameName}-qr-code-print.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, "image/png");
        }
      };

      img.onerror = () => {
        // Fallback to direct download if image loading fails
        const link = document.createElement("a");
        link.href = qr.qrCode;
        link.download = `${qr.gameName}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      img.src = qr.qrCode;
    }
  };

  // Handle modal close
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingQRCode(null);
  };

  // Handle view modal close
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewedQRCode(null);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-[#eeeeee] p-4 md:p-6">
          {/* Top Row: Menu + Title + Add Button */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              {/* Mobile Menu Trigger */}
              <MobileSidebar
                onLogout={() => {
                  localStorage.removeItem("authToken");
                  signOut({ callbackUrl: "/login" });
                }}
              />

              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-3xl font-bold bg-[#F04D2A] bg-clip-text text-transparent font-heading truncate">
                  QR Code Dashboard
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">
                  Manage your game QR codes and links
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingQRCode(null);
                setIsCreateModalOpen(true);
              }}
              className="bg-foreground text-[#eeeeee] hover:bg-foreground/80 hover:text-white border-none cursor-pointer duration-300 font-heading whitespace-nowrap text-sm md:text-base px-3 md:px-4"
            >
              <span className="hidden sm:inline">Add New QR</span>
              <span className="sm:hidden">Add QR</span>
            </Button>
          </div>

          {/* Bottom Row: Search + View Toggle */}
          <div className="flex gap-2 md:gap-4 items-center">
            <div className="flex-1">
              <SearchBar value={state.search} onChange={state.setSearch} />
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-white p-1 rounded-lg shrink-0">
              <Button
                variant={"default"}
                size="sm"
                onClick={() => state.setViewMode("list")}
                className={
                  state.viewMode === "list"
                    ? "bg-foreground text-[#eeeeee] hover:bg-gray-600 h-8 w-8 md:h-9 md:w-9 p-0"
                    : "bg-gray-500 hover:bg-gray-600 h-8 w-8 md:h-9 md:w-9 p-0"
                }
              >
                <List className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => state.setViewMode("grid")}
                className={
                  state.viewMode === "grid"
                    ? "bg-foreground text-[#eeeeee] hover:bg-gray-600 h-8 w-8 md:h-9 md:w-9 p-0"
                    : "bg-gray-500 hover:bg-gray-600 h-8 w-8 md:h-9 md:w-9 p-0"
                }
              >
                <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto md:p-6 pt-2">
          {state.viewMode === "list" ? (
            <QRCodeTable
              qrCodes={qrCodes}
              isLoading={isLoading}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              onSort={state.toggleSort}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteTrigger}
              onDownload={handleDownload}
            />
          ) : (
            <QRCodeGrid
              qrCodes={qrCodes}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteTrigger}
              onDownload={handleDownload}
            />
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => state.setPage(Math.max(1, state.page - 1))}
                      className={
                        state.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => state.setPage(pageNum)}
                        isActive={state.page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        state.setPage(
                          Math.min(pagination.totalPages, state.page + 1)
                        )
                      }
                      className={
                        state.page === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>

      {/* Create/Update Modal */}
      <Dialog
        key={editingQRCode?._id || "create"}
        open={isCreateModalOpen}
        onOpenChange={handleCreateModalClose}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-primary text-4xl font-heading pb-10">
              {editingQRCode ? "Update QR Code" : "Create New QR Code"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="">
              <div className="pb-10">
                <h3 className="font-semibold font-heading text-[28px] ">
                  Game Details
                </h3>
                <p className="text-muted-foreground text-sm">
                  Enter the game name and link to generate a QR code
                </p>
              </div>
              <QRCodeForm
                qrCode={editingQRCode}
                onSubmit={
                  editingQRCode ? handleUpdateSubmit : handleCreateSubmit
                }
                isLoading={isCreating || isUpdating}
                onCancel={handleCreateModalClose}
              />
            </div>
            {editingQRCode ? (
              <Image
                src={editingQRCode.qrCode}
                alt="QR Code"
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            ) : (
              <div>
                <h3 className="font-semibold mb-4 font-heading text-[28px]">
                  QR Code Preview
                </h3>
                <div className="bg-muted p-6 rounded-lg flex items-center justify-center h-64">
                  <p className="text-muted-foreground text-center text-sm">
                    Your generated QR code will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View QR Modal */}
      <ViewQRModal
        key={viewedQRCode?._id}
        qrCode={viewedQRCode}
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={state.isDeleteModalOpen}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          state.setIsDeleteModalOpen(false);
          state.setSelectedQRId(null);
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
        }}
        onAddAnother={() => {
          setIsSuccessModalOpen(false);
          setIsCreateModalOpen(true);
        }}
      />
    </div>
  );
}
