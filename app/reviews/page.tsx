"use client";

import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { Check, Trash2, X, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import { ActionButtons, DashboardPanel, PaginationFooter, StatusBadge } from "@/components/dashboard/dashboard-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reviewService } from "@/lib/api/review-service";
import { queryKeys } from "@/lib/query-keys";
import { Review, ReviewStatus } from "@/lib/types/review";

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.reviews.list({ search, status: statusFilter }),
    queryFn: () =>
      reviewService.getAll({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ReviewStatus;
    }) => reviewService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Review status updated successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
    onError: () => {
      toast.error("Failed to update review status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      toast.success("Review deleted successfully.");
      setSelectedReview(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
    onError: () => {
      toast.error("Failed to delete review.");
    },
  });

  const counts = useMemo(
    () => ({
      total: reviews.length,
      published: reviews.filter((review) => review.status === "published").length,
      pending: reviews.filter((review) => review.status === "pending").length,
    }),
    [reviews]
  );

  return (
    <>
      <DashboardHeader
        title="Reviews"
        description="Review, moderate and publish product feedback before it appears on the website."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          <div className="p-4">
            <FilterControl
              searchPlaceholder="Search customer, product or review..."
              filters={[statusLabel(statusFilter)]}
              onSearch={setSearch}
              onFilterChange={(_, value) => setStatusFilter(value.toLowerCase())}
              filterOptions={{
                status: ["All", "Pending", "Published", "Rejected"],
              }}
            />
          </div>
          <div className="px-4 pb-4 text-xs text-gray-500">
            {counts.total} reviews total, {counts.published} published, {counts.pending} pending moderation.
          </div>
          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  {['Customer', 'Product', 'Rating', 'Review', 'Submitted', 'Status', 'Action'].map((head) => (
                    <TableHead key={head} className="h-10 text-xs font-semibold text-[#F04D2A]">
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">
                      Loading reviews...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-rose-500">
                      Failed to load reviews.
                    </TableCell>
                  </TableRow>
                ) : reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">
                      No reviews found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                  <TableRow key={review.id} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B]" />
                        <div>
                          <span className="font-semibold text-gray-900">{review.userName}</span>
                          <p className="text-xs text-gray-500">{review.userEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-[linear-gradient(135deg,#0E1D2B,#4296A2,#F04D2A)]" />
                        <span className="font-medium text-gray-700">{review.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell><RatingStars rating={review.rating} /></TableCell>
                    <TableCell className="max-w-[360px] whitespace-normal text-xs leading-relaxed text-gray-600">
                      {truncateReview(review.review)}{" "}
                      {review.review.length > 118 ? (
                        <button className="font-medium text-[#4296A2]" onClick={() => setSelectedReview(review)}>Read More</button>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-gray-500">{formatReviewDate(review.createdAt)}</TableCell>
                    <TableCell><StatusBadge status={statusLabel(review.status)} /></TableCell>
                    <TableCell>
                      <ActionButtons
                        onView={() => setSelectedReview(review)}
                        onApprove={() => handleStatusChange(review.id, "published", statusMutation.isPending)}
                        onReject={() => handleStatusChange(review.id, "rejected", statusMutation.isPending)}
                        onDelete={() => handleDelete(review.id, deleteMutation.isPending)}
                      />
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
          <PaginationFooter
            from={reviews.length === 0 ? 0 : 1}
            to={reviews.length}
            total={reviews.length}
            pages={[1]}
          />
        </DashboardPanel>
      </div>

      <Dialog open={Boolean(selectedReview)} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="max-w-xl border-0 bg-white p-0 shadow-2xl">
          {selectedReview ? (
            <div className="p-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-900">Review Details</DialogTitle>
                <p className="text-xs text-gray-500">Submitted {formatReviewDate(selectedReview.createdAt)}</p>
              </DialogHeader>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[#F2E3C6] bg-[#FFF9ED] p-4">
                  <p className="text-xs font-semibold text-gray-800">Customer Information</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedReview.userName}</p>
                      <p className="text-xs text-gray-500">{selectedReview.userEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-md border border-[#F2E3C6] bg-[#FFF9ED] p-4">
                  <p className="text-xs font-semibold text-gray-800">Product Information</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-[linear-gradient(135deg,#0E1D2B,#4296A2,#F04D2A)]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedReview.productName}</p>
                      <p className="text-xs text-gray-500">Product review</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-md border border-[#F2E3C6] bg-[#FFF9ED] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Review Details</p>
                    <div className="mt-2"><RatingStars rating={selectedReview.rating} /></div>
                  </div>
                  <span className="text-xs text-gray-400">{formatReviewDate(selectedReview.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{selectedReview.review}</p>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Current status:</span>
                  <StatusBadge status={statusLabel(selectedReview.status)} />
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Admin Actions</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    onClick={() => handleStatusChange(selectedReview.id, "published", statusMutation.isPending)}
                  >
                    <Check className="h-4 w-4" />Approve
                  </Button>
                  <Button
                    className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                    onClick={() => handleStatusChange(selectedReview.id, "rejected", statusMutation.isPending)}
                  >
                    <X className="h-4 w-4" />Reject
                  </Button>
                  <Button
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                    onClick={() => handleDelete(selectedReview.id, deleteMutation.isPending)}
                  >
                    <Trash2 className="h-4 w-4" />Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );

  function handleStatusChange(
    reviewId: string,
    nextStatus: ReviewStatus,
    isBusy: boolean
  ) {
    if (isBusy) return;
    statusMutation.mutate({ id: reviewId, status: nextStatus });
    if (selectedReview?.id === reviewId) {
      setSelectedReview({
        ...selectedReview,
        status: nextStatus,
      });
    }
  }

  function handleDelete(reviewId: string, isBusy: boolean) {
    if (isBusy) return;
    deleteMutation.mutate(reviewId);
  }
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${index < rating ? "fill-current" : "text-gray-200"}`}
        />
      ))}
      <span className="sr-only">{rating} stars</span>
    </div>
  );
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  if (status.toLowerCase() === "all") return "All";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function truncateReview(review: string) {
  if (review.length <= 118) return review;
  return `${review.slice(0, 118)}...`;
}
