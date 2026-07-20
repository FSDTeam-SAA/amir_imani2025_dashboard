"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { signOut } from "next-auth/react";
import { Loader2, Mail, Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  ActionButtons,
  DashboardPanel,
  PaginationFooter,
  StatusBadge,
} from "@/components/dashboard/dashboard-table";
import { FilterControl } from "@/components/dashboard/filter-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useNotifySubscribers } from "@/lib/hooks/use-notify-subscribers";
import { useSubscribers } from "@/lib/hooks/use-subscribers";
import type { NotifySubscribersPayload, Subscriber } from "@/lib/types/subscriber";
import z from "zod";

const itemsPerPage = 10;

const notifyFormSchema = z.object({
  messageSubject: z.string().min(3, "Subject must be at least 3 characters."),
  messageDescription: z
    .string()
    .min(10, "Message must be at least 10 characters."),
});

type NotifyFormValues = z.infer<typeof notifyFormSchema>;

export default function SubscribersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const { data: subscribers = [], isLoading, isError } = useSubscribers();
  const notifyMutation = useNotifySubscribers();

  const form = useForm<NotifyFormValues>({
    resolver: zodResolver(notifyFormSchema),
    defaultValues: {
      messageSubject: "",
      messageDescription: "",
    },
  });

  const filteredSubscribers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      const matchesSearch =
        !normalizedSearch ||
        subscriber.email.toLowerCase().includes(normalizedSearch) ||
        (subscriber.subscriberName || "").toLowerCase().includes(normalizedSearch) ||
        (subscriber.game || "").toLowerCase().includes(normalizedSearch) ||
        (subscriber.gameCategory || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || subscriber.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, subscribers]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscribers.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSubscribers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredSubscribers]);

  const subscribedCount = useMemo(
    () => subscribers.filter((subscriber) => subscriber.status === "Subscribed").length,
    [subscribers]
  );

  const unsubscribedCount = subscribers.length - subscribedCount;

  const formatedRange = useMemo(() => {
    if (filteredSubscribers.length === 0) {
      return { from: 0, to: 0 };
    }

    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, filteredSubscribers.length);

    return { from, to };
  }, [currentPage, filteredSubscribers.length]);

  const handleStatusChange = (_: string, value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const openNotifyModal = (subscriber?: Subscriber) => {
    setIsNotifyOpen(true);

    if (subscriber) {
      form.reset({
        messageSubject: subscriber.game
          ? `Update for ${subscriber.game}`
          : "New update from Doundo Games",
        messageDescription: subscriber.game
          ? `We have a fresh update for ${subscriber.game}. This email will go to every active subscriber, including ${subscriber.email}.`
          : "We have a new update to share with all newsletter subscribers.",
      });
      return;
    }

    form.reset({
      messageSubject: "New update from Doundo Games",
      messageDescription:
        "We have a new update to share with all newsletter subscribers.",
    });
  };

  const onSubmit = async (values: NotifyFormValues) => {
    await notifyMutation.mutateAsync(values as NotifySubscribersPayload);
    setIsNotifyOpen(false);
    form.reset();
  };

  return (
    <>
      <DashboardHeader
        title="Subscribers"
        description="Track newsletter signups and publish updates to every active subscriber from one place."
        actionLabel="Publish Update"
        onAction={() => openNotifyModal()}
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Subscribers"
            value={subscribers.length}
            helper="All newsletter signups collected from the website footer."
          />
          <StatsCard
            title="Active Subscribers"
            value={subscribedCount}
            helper="Currently eligible to receive newsletter notifications."
          />
          <StatsCard
            title="Unsubscribed"
            value={unsubscribedCount}
            helper="People who opted out using the email unsubscribe link."
          />
        </div>

        <DashboardPanel>
          <div className="p-4">
            <FilterControl
              searchPlaceholder="Search name, email, game or category..."
              filters={[statusFilter]}
              onSearch={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              onFilterChange={handleStatusChange}
              filterOptions={{
                status: ["All", "Subscribed", "Unsubscribed"],
              }}
            />
          </div>

          <div className="px-4 pb-4 text-xs text-gray-500">
            {filteredSubscribers.length} matching subscribers. Notifications are sent only to records with
            status <span className="font-semibold text-emerald-600">Subscribed</span>.
          </div>

          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  {["Subscriber", "Email", "Game", "Category", "Joined", "Release", "Status", "Action"].map(
                    (head) => (
                      <TableHead key={head} className="h-10 text-xs font-semibold text-[#F04D2A]">
                        {head}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">
                      Loading subscribers...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-rose-500">
                      Failed to load subscribers.
                    </TableCell>
                  </TableRow>
                ) : paginatedSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">
                      No subscribers found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubscribers.map((subscriber) => (
                    <TableRow key={subscriber._id} className="border-gray-50 hover:bg-gray-50/50">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B] text-white">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {subscriber.subscriberName || "Newsletter Subscriber"}
                            </p>
                            <p className="text-xs text-gray-500">{subscriber.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{subscriber.email}</TableCell>
                      <TableCell className="text-sm font-medium text-gray-700">
                        {subscriber.game || "General newsletter"}
                      </TableCell>
                      <TableCell>
                        <Badge className="border-0 bg-[#FFF4E8] text-[#8A5A2B]">
                          {subscriber.gameCategory || "All updates"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(subscriber.subscriptionDate)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {subscriber.releaseDate ? formatDate(subscriber.releaseDate) : "Coming soon"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={subscriber.status} />
                      </TableCell>
                      <TableCell>
                        <ActionButtons
                          onView={() => setSelectedSubscriber(subscriber)}
                          onNotify={() => openNotifyModal(subscriber)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationFooter
            from={formatedRange.from}
            to={formatedRange.to}
            total={filteredSubscribers.length}
            pages={Array.from({ length: totalPages }, (_, index) => index + 1)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </DashboardPanel>
      </div>

      <Dialog open={Boolean(selectedSubscriber)} onOpenChange={(open) => !open && setSelectedSubscriber(null)}>
        <DialogContent className="max-w-xl border-0 bg-white p-0 shadow-2xl">
          {selectedSubscriber ? (
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Subscriber Details</DialogTitle>
                <DialogDescription>
                  Joined on {formatDate(selectedSubscriber.subscriptionDate)} and currently marked as{" "}
                  {selectedSubscriber.status}.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailCard
                  title="Identity"
                  value={selectedSubscriber.subscriberName || "Newsletter Subscriber"}
                  subValue={selectedSubscriber.email}
                />
                <DetailCard
                  title="Status"
                  value={selectedSubscriber.status}
                  subValue={
                    selectedSubscriber.status === "Subscribed"
                      ? "Will receive published updates."
                      : "Opted out via unsubscribe link."
                  }
                />
                <DetailCard
                  title="Game"
                  value={selectedSubscriber.game || "General newsletter"}
                  subValue={selectedSubscriber.gameCategory || "All updates"}
                />
                <DetailCard
                  title="Release"
                  value={
                    selectedSubscriber.releaseDate
                      ? formatDate(selectedSubscriber.releaseDate)
                      : "Coming soon"
                  }
                  subValue="Expected release date"
                />
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  className="bg-[#F04D2A] text-white hover:bg-[#F04D2A]/90"
                  onClick={() => {
                    setSelectedSubscriber(null);
                    openNotifyModal(selectedSubscriber);
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Compose Update
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent className="max-w-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Publish Subscriber Update</DialogTitle>
            <DialogDescription>
              This sends the same email to every subscriber whose status is <strong>Subscribed</strong>.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="messageSubject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="New game update released" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="messageDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={7}
                        placeholder="Share the update you want all active subscribers to receive."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNotifyOpen(false)}
                  disabled={notifyMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#F04D2A] text-white hover:bg-[#F04D2A]/90"
                  disabled={notifyMutation.isPending}
                >
                  {notifyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Update
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatsCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-[#F2E3C6] bg-[#FFF9ED] p-5">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">{helper}</p>
    </div>
  );
}

function DetailCard({
  title,
  value,
  subValue,
}: {
  title: string;
  value: string;
  subValue: string;
}) {
  return (
    <div className="rounded-md border border-[#F2E3C6] bg-[#FFF9ED] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subValue}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
