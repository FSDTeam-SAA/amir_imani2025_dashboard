"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Check, Trash2, X, Star } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import { ActionButtons, DashboardPanel, PaginationFooter, StatusBadge } from "@/components/dashboard/dashboard-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Review {
  player: string;
  email: string;
  game: string;
  rating: number;
  review: string;
  submitted: string;
  status: "Published" | "Pending" | "Rejected";
}

const reviews: Review[] = Array.from({ length: 12 }, (_, index) => ({
  player: "John Doe",
  email: "john.doe@example.com",
  game: "DolDnda Classic",
  rating: 5,
  review:
    "Absolutely mind-blowing experience! The reverse mechanics are unlike anything I have ever played before. My whole family got hooked from the very first session.",
  submitted: "25 Jun 2026",
  status: index % 4 === 1 ? "Pending" : index % 5 === 2 ? "Rejected" : "Published",
}));

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  return (
    <>
      <DashboardHeader
        title="Reviews"
        description="Review, moderate and publish player feedback before it appears on the website."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          <div className="p-4">
            <FilterControl
              searchPlaceholder="Search player name, game name or review..."
              filters={["All Games", "All Ratings", "All Status"]}
            />
          </div>
          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  {['Player', 'Game', 'Rating', 'Review', 'Submitted', 'Status', 'Action'].map((head) => (
                    <TableHead key={head} className="h-10 text-xs font-semibold text-[#F04D2A]">
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review, index) => (
                  <TableRow key={`${review.player}-${index}`} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B]" />
                        <span className="font-semibold text-gray-900">{review.player}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-[linear-gradient(135deg,#0E1D2B,#4296A2,#F04D2A)]" />
                        <span className="font-medium text-gray-700">{review.game}</span>
                      </div>
                    </TableCell>
                    <TableCell><RatingStars rating={review.rating} /></TableCell>
                    <TableCell className="max-w-[360px] whitespace-normal text-xs leading-relaxed text-gray-600">
                      {review.review.slice(0, 118)}... <button className="font-medium text-[#4296A2]" onClick={() => setSelectedReview(review)}>Read More</button>
                    </TableCell>
                    <TableCell className="text-gray-500">{review.submitted}</TableCell>
                    <TableCell><StatusBadge status={review.status} /></TableCell>
                    <TableCell>
                      <ActionButtons
                        onView={() => setSelectedReview(review)}
                        onApprove={() => undefined}
                        onReject={() => undefined}
                        onDelete={() => undefined}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationFooter from={1} to={12} total={284} />
        </DashboardPanel>
      </div>

      <Dialog open={Boolean(selectedReview)} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="max-w-xl border-0 bg-white p-0 shadow-2xl">
          {selectedReview ? (
            <div className="p-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-900">Review Details</DialogTitle>
                <p className="text-xs text-gray-500">Submitted {selectedReview.submitted}</p>
              </DialogHeader>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[#F2E3C6] bg-[#FFF9ED] p-4">
                  <p className="text-xs font-semibold text-gray-800">Player Information</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedReview.player}</p>
                      <p className="text-xs text-gray-500">{selectedReview.email}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-md border border-[#F2E3C6] bg-[#FFF9ED] p-4">
                  <p className="text-xs font-semibold text-gray-800">Game Information</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-[linear-gradient(135deg,#0E1D2B,#4296A2,#F04D2A)]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedReview.game}</p>
                      <p className="text-xs text-gray-500">Play Time: 24h 30m</p>
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
                  <span className="text-xs text-gray-400">{selectedReview.submitted}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{selectedReview.review}</p>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Current status:</span>
                  <StatusBadge status={selectedReview.status} />
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Admin Actions</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check className="h-4 w-4" />Approve</Button>
                  <Button className="bg-amber-50 text-amber-600 hover:bg-amber-100"><X className="h-4 w-4" />Reject</Button>
                  <Button className="bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4" />Delete</Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className="h-3.5 w-3.5 fill-current" />
      ))}
      <span className="sr-only">{rating} stars</span>
    </div>
  );
}
