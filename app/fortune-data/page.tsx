"use client";

import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Database, Search } from "lucide-react";
import { toast } from "sonner";
import { ActionButtons, DashboardPanel, PaginationFooter, StatusBadge } from "@/components/dashboard/dashboard-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fortuneDefinitionService } from "@/lib/api/fortune-definition-service";
import { queryKeys } from "@/lib/query-keys";
import type {
  FortuneDefinition,
  UpdateFortuneDefinitionPayload,
} from "@/lib/types/fortune";

type FortuneDraft = {
  symbols: string[];
  fortune: string;
};

const emptyDraft = (): FortuneDraft => ({
  symbols: ["", "", ""],
  fortune: "",
});

export default function FortuneDataPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedDefinition, setSelectedDefinition] =
    useState<FortuneDefinition | null>(null);
  const [draft, setDraft] = useState<FortuneDraft>(emptyDraft);

  const {
    data: definitions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.fortunes.definitions(),
    queryFn: () => fortuneDefinitionService.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFortuneDefinitionPayload;
    }) => fortuneDefinitionService.update(id, payload),
    onSuccess: () => {
      toast.success("Fortune data updated successfully.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.fortunes.all });
      setSelectedDefinition(null);
      setDraft(emptyDraft());
    },
    onError: (error: unknown) => {
      const message =
        getErrorMessage(error) || "Failed to update fortune data.";
      toast.error(message);
    },
  });

  const filteredDefinitions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return definitions;
    }

    return definitions.filter((definition) =>
      [
        definition.sequence.toString(),
        definition.combinationKey,
        definition.symbols.join(" "),
        definition.fortune,
      ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [definitions, search]);

  const lastUpdatedLabel = useMemo(() => {
    if (definitions.length === 0) {
      return "No updates yet";
    }

    const latestTimestamp = Math.max(
      ...definitions.map((definition) =>
        new Date(definition.updatedAt).getTime(),
      ),
    );

    return formatDate(new Date(latestTimestamp).toISOString());
  }, [definitions]);

  return (
    <>
      <DashboardHeader
        title="Fortune Data"
        description="Review the fortune definitions seeded from JSON into the database and update any entry without leaving the dashboard."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          {/* <div className="border-b border-gray-100 bg-[linear-gradient(180deg,#FFFDF9_0%,#FFF8EE_100%)] px-4 py-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#F4D6A6] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#C46210]">
                  <Database className="h-3.5 w-3.5" />
                  Fortune Definition Store
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">
                  {definitions.length} fortune definitions currently stored in the
                  database
                </p>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">
                  This page edits the admin definitions used by the fortune
                  telling feature after the JSON seed has been loaded.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricTile
                    label="Stored records"
                    value={definitions.length.toString()}
                    tone="orange"
                  />
                  <MetricTile
                    label="Visible now"
                    value={filteredDefinitions.length.toString()}
                    tone="teal"
                  />
                  <MetricTile
                    label="Last updated"
                    value={lastUpdatedLabel}
                    tone="slate"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#F4D6A6] bg-white p-3 shadow-sm">
                <label
                  htmlFor="fortune-search"
                  className="text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                >
                  Find a fortune record
                </label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                  <Input
                    id="fortune-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search sequence, symbol, combination, or fortune..."
                    className="h-10 border-gray-200 bg-white pl-9 text-sm placeholder:text-gray-300"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>
                    {filteredDefinitions.length} of {definitions.length} entries
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {lastUpdatedLabel}
                  </span>
                </div>
              </div>
            </div>
          </div> */}

          <div className="px-4 py-4">
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <Table className="min-w-[1120px] table-fixed">
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-auto w-[84px] px-4 py-3 text-xs font-semibold whitespace-normal leading-4 text-[#F04D2A]">
                    No.
                  </TableHead>
                  <TableHead className="h-auto w-[220px] px-4 py-3 text-xs font-semibold whitespace-normal leading-4 text-[#F04D2A]">
                    Symbols
                  </TableHead>
                  <TableHead className="h-auto w-[200px] px-4 py-3 text-xs font-semibold whitespace-normal leading-4 text-[#F04D2A]">
                    Combination Key
                  </TableHead>
                  <TableHead className="h-auto w-[360px] px-4 py-3 text-xs font-semibold whitespace-normal leading-4 text-[#F04D2A]">
                    Fortune Preview
                  </TableHead>
                  <TableHead className="h-auto w-[120px] px-4 py-3 text-xs font-semibold whitespace-normal leading-4 text-[#F04D2A]">
                    Updated
                  </TableHead>
                  <TableHead className="h-auto w-[120px] px-4 py-3 text-xs font-semibold whitespace-normal leading-4 text-[#F04D2A]">
                    State
                  </TableHead>
                  <TableHead className="h-auto w-[96px] px-4 py-3 text-center text-xs font-semibold whitespace-normal leading-4 text-[#F04D2A]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm whitespace-normal text-gray-500"
                    >
                      Loading fortune data...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm whitespace-normal text-rose-500"
                    >
                      Failed to load fortune data.
                    </TableCell>
                  </TableRow>
                ) : filteredDefinitions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm whitespace-normal text-gray-500"
                    >
                      No fortune entries matched the current search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDefinitions.map((definition) => (
                    <TableRow
                      key={definition._id}
                      className="border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF4E8] text-sm font-semibold text-[#C46210]">
                          {definition.sequence}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <div className="flex flex-wrap gap-2">
                          {definition.symbols.map((symbol) => (
                            <span
                              key={`${definition._id}-${symbol}`}
                              className="inline-flex items-center rounded-full bg-[#FFF4E8] px-2.5 py-1 text-[11px] font-semibold text-[#C46210]"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top text-xs font-medium whitespace-normal break-all text-gray-500">
                        {definition.combinationKey}
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <p className="text-xs leading-5 break-words text-gray-600">
                          {truncateFortune(definition.fortune)}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <div className="text-xs text-gray-500">
                          {formatDate(definition.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <StatusBadge status="In Database" />
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top">
                        <div className="flex justify-center">
                          <ActionButtons
                            onEdit={() => {
                              setSelectedDefinition(definition);
                              setDraft({
                                symbols: [...definition.symbols],
                                fortune: definition.fortune,
                              });
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>

          <PaginationFooter
            from={filteredDefinitions.length === 0 ? 0 : 1}
            to={filteredDefinitions.length}
            total={filteredDefinitions.length}
            pages={[1]}
          />
        </DashboardPanel>
      </div>

      <Dialog
        open={Boolean(selectedDefinition)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDefinition(null);
            setDraft(emptyDraft());
          }
        }}
      >
        <DialogContent className="max-w-3xl border-0 bg-white p-0 shadow-2xl">
          {selectedDefinition ? (
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Update Fortune Entry #{selectedDefinition.sequence}
                </DialogTitle>
                <DialogDescription>
                  Adjust the three-symbol combination or the stored fortune
                  text. Saving here updates the database record used by the
                  admin APIs.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-5">
                <section className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {draft.symbols.map((symbol, index) => (
                      <div key={`symbol-${index}`} className="grid gap-2">
                        <label
                          htmlFor={`fortune-symbol-${index}`}
                          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          Symbol {index + 1}
                        </label>
                        <Input
                          id={`fortune-symbol-${index}`}
                          value={symbol}
                          onChange={(event) =>
                            updateDraftSymbol(index, event.target.value)
                          }
                          placeholder="SHAMAN"
                          className="border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Current stored key: {buildCombinationKey(draft.symbols) || "-"}
                  </p>
                </section>

                <section className="grid gap-2">
                  <label
                    htmlFor="fortune-text"
                    className="text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Fortune Text
                  </label>
                  <Textarea
                    id="fortune-text"
                    rows={14}
                    value={draft.fortune}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        fortune: event.target.value,
                      }))
                    }
                    className="min-h-[320px] border-gray-200 text-sm leading-relaxed"
                  />
                </section>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDefinition(null);
                    setDraft(emptyDraft());
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#F04D2A] text-white hover:bg-[#F04D2A]/90"
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    const payload = buildPayload(draft);

                    if (!payload) {
                      toast.error(
                        "Please provide exactly three symbols and a fortune text.",
                      );
                      return;
                    }

                    updateMutation.mutate({
                      id: selectedDefinition._id,
                      payload,
                    });
                  }}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );

  function updateDraftSymbol(index: number, value: string) {
    setDraft((current) => {
      const nextSymbols = [...current.symbols];
      nextSymbols[index] = value.toUpperCase();

      return {
        ...current,
        symbols: nextSymbols,
      };
    });
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncateFortune(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
}

function buildPayload(draft: FortuneDraft): UpdateFortuneDefinitionPayload | null {
  const normalizedSymbols = draft.symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  const fortune = draft.fortune.trim();

  if (normalizedSymbols.length !== 3 || !fortune) {
    return null;
  }

  return {
    symbols: normalizedSymbols,
    fortune,
  };
}

function buildCombinationKey(symbols: string[]) {
  const normalizedSymbols = symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .sort();

  return normalizedSymbols.join(",");
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as {
      response?: { data?: { message?: unknown } };
    }).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return null;
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "orange" | "teal" | "slate";
}) {
  const toneClassName = {
    orange: "border-[#F4D6A6] bg-white text-[#C46210]",
    teal: "border-[#BFE3DD] bg-white text-[#227C70]",
    slate: "border-gray-200 bg-white text-gray-700",
  }[tone];

  return (
    <div className={`rounded-lg border px-4 py-3 shadow-sm ${toneClassName}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold leading-none">{value}</p>
    </div>
  );
}
