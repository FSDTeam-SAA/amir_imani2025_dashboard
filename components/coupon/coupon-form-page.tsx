"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  ApiResponse,
  Coupon,
  CouponDiscountType,
  CouponEligibility,
  CouponPayload,
} from "@/lib/types/coupon";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

const couponQueryKeys = {
  lists: ["coupons", "list"] as const,
  detail: (id: string) => ["coupons", "detail", id] as const,
};

const validityOptions: {
  title: string;
  description: string;
  eligibility: CouponEligibility;
}[] = [
  {
    title: "All Users",
    description: "Available to everyone",
    eligibility: "all",
  },
  {
    title: "First-Time Users",
    description: "Only new customers",
    eligibility: "first_time",
  },
  {
    title: "Specific Users",
    description: "Target special accounts",
    eligibility: "specific",
  },
];

type CouponFormMode = "create" | "edit";

type CouponFormState = {
  couponName: string;
  couponCode: string;
  description: string;
  status: "active" | "inactive";
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountCap: string;
  totalUsageLimit: string;
  perUserLimit: string;
  expiryDate: string;
  eligibleUsers: string;
};

type CouponFormPageProps = {
  mode: CouponFormMode;
  couponId?: string;
};

async function getAuthToken() {
  const session = await getSession();
  return session?.accessToken;
}

async function parseResponse<T>(res: Response, fallback: string) {
  const result = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(result.message || fallback);
  }

  return result;
}

async function getCoupon(id: string) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await parseResponse<Coupon>(res, "Failed to load coupon");
  return result.data;
}

async function createCoupon(payload: CouponPayload) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Coupon>(res, "Failed to create coupon");
}

async function updateCoupon({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CouponPayload>;
}) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Coupon>(res, "Failed to update coupon");
}

const initialFormData: CouponFormState = {
  couponName: "",
  couponCode: "",
  description: "",
  status: "active",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountCap: "",
  totalUsageLimit: "",
  perUserLimit: "",
  expiryDate: "",
  eligibleUsers: "",
};

const formatDateInput = (value?: string) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const toNumber = (value: string, fallback?: number) => {
  if (value.trim() === "") return fallback;
  return Number(value);
};

const buildCouponPayload = (
  formData: CouponFormState,
  selectedValidity: number,
) => {
  const eligibleUsers = formData.eligibleUsers
    .split(",")
    .map((userId) => userId.trim())
    .filter(Boolean);

  const payload: CouponPayload = {
    code: formData.couponCode.trim().toUpperCase(),
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue),
    usageLimit: Number(formData.totalUsageLimit),
    perUserLimit: toNumber(formData.perUserLimit, 1),
    expiryDate: new Date(formData.expiryDate).toISOString(),
    eligibility: validityOptions[selectedValidity].eligibility,
    eligibleUsers,
    isActive: formData.status === "active",
  };

  const minOrderAmount = toNumber(formData.minOrderAmount);
  const maxDiscountCap = toNumber(formData.maxDiscountCap);

  if (minOrderAmount !== undefined) payload.minOrderAmount = minOrderAmount;
  if (maxDiscountCap !== undefined) payload.maxDiscountCap = maxDiscountCap;

  return payload;
};

export default function CouponFormPage({ mode, couponId }: CouponFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit";
  const [formData, setFormData] =
    React.useState<CouponFormState>(initialFormData);
  const [selectedValidity, setSelectedValidity] = React.useState(0);

  const { data: coupon, isLoading: isCouponLoading } = useQuery({
    queryKey: couponQueryKeys.detail(couponId || ""),
    queryFn: async () => getCoupon(couponId || ""),
    enabled: isEditMode && !!couponId,
  });

  React.useEffect(() => {
    if (!coupon) return;

    const validityIndex = Math.max(
      0,
      validityOptions.findIndex(
        (option) => option.eligibility === coupon.eligibility,
      ),
    );

    setSelectedValidity(validityIndex);
    setFormData({
      couponName: coupon.code,
      couponCode: coupon.code,
      description: "",
      status: coupon.isActive ? "active" : "inactive",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue ?? ""),
      minOrderAmount: String(coupon.minOrderAmount ?? ""),
      maxDiscountCap: String(coupon.maxDiscountCap ?? ""),
      totalUsageLimit: String(coupon.usageLimit ?? ""),
      perUserLimit: String(coupon.perUserLimit ?? ""),
      expiryDate: formatDateInput(coupon.expiryDate),
      eligibleUsers: coupon.eligibleUsers?.join(", ") || "",
    });
  }, [coupon]);

  const mutation = useMutation({
    mutationFn: async (payload: CouponPayload) => {
      if (isEditMode) {
        return updateCoupon({ id: couponId || "", payload });
      }

      return createCoupon(payload);
    },
    onSuccess: (data) => {
      toast.success(
        data.message ||
          (isEditMode
            ? "Coupon updated successfully"
            : "Coupon created successfully"),
      );
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.lists });
      if (couponId) {
        queryClient.invalidateQueries({
          queryKey: couponQueryKeys.detail(couponId),
        });
      }
      router.push("/coupon-management");
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          (isEditMode ? "Failed to update coupon" : "Failed to create coupon"),
      );
    },
  });

  const handleInputChange = (
    field: keyof CouponFormState,
    value: CouponFormState[keyof CouponFormState],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.couponCode.trim() ||
      !formData.discountValue ||
      !formData.totalUsageLimit ||
      !formData.expiryDate
    ) {
      toast.error("Please fill in coupon code, discount, usage limit and expiry date.");
      return;
    }

    if (Number(formData.discountValue) <= 0 || Number(formData.totalUsageLimit) <= 0) {
      toast.error("Discount value and usage limit must be greater than 0.");
      return;
    }

    if (formData.discountType === "percentage" && Number(formData.discountValue) > 100) {
      toast.error("Percentage discount cannot exceed 100.");
      return;
    }

    if (
      validityOptions[selectedValidity].eligibility === "specific" &&
      !formData.eligibleUsers.trim()
    ) {
      toast.error("Please add at least one user ID for specific users.");
      return;
    }

    mutation.mutate(buildCouponPayload(formData, selectedValidity));
  };

  const previewData = {
    code: formData.couponCode || "SUMMER25",
    discount:
      formData.discountValue && formData.discountType === "percentage"
        ? `${formData.discountValue}% OFF`
        : formData.discountValue
          ? `$${formData.discountValue} OFF`
          : "25% OFF",
    validity: validityOptions[selectedValidity].title,
  };

  if (isEditMode && isCouponLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        title={isEditMode ? "Edit Coupon" : "Create Coupon"}
        description={
          isEditMode
            ? "Update this discount code for your customers"
            : "Set up a new discount code for your customers"
        }
        onAction={() => router.push("/coupon-management/new")}
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Section
              title="Coupon Information"
              description="Basic details about this coupon"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Coupon Name"
                  placeholder="e.g. Summer Sale 2026"
                  value={formData.couponName}
                  onChange={(e) =>
                    handleInputChange("couponName", e.target.value)
                  }
                />
                <Field
                  label="Coupon Code"
                  placeholder="e.g. SUMMER25"
                  value={formData.couponCode}
                  onChange={(e) =>
                    handleInputChange(
                      "couponCode",
                      e.target.value.toUpperCase(),
                    )
                  }
                  required
                />
              </div>
              <div className="mt-4">
                <Label className="text-xs text-gray-600">Description</Label>
                <Textarea
                  placeholder="Briefly describe this coupon campaign..."
                  className="mt-1 min-h-20 resize-none border-gray-200 text-xs"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>
              <div className="mt-4">
                <Label className="text-xs text-gray-600">Status</Label>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <ChoiceCard
                    active={formData.status === "active"}
                    title="Active"
                    description="Customers can redeem it"
                    onClick={() => handleInputChange("status", "active")}
                  />
                  <ChoiceCard
                    active={formData.status === "inactive"}
                    title="Inactive"
                    description="Hide it from checkout"
                    onClick={() => handleInputChange("status", "inactive")}
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Discount Settings"
              description="Define how much customers save"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <ChoiceCard
                  active={formData.discountType === "percentage"}
                  title="% Percentage"
                  description="% off the order"
                  onClick={() =>
                    handleInputChange("discountType", "percentage")
                  }
                />
                <ChoiceCard
                  active={formData.discountType === "fixed"}
                  title="$ Fixed Amount"
                  description="$ off the order"
                  onClick={() => handleInputChange("discountType", "fixed")}
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field
                  label="Discount Value"
                  placeholder={
                    formData.discountType === "percentage" ? "25" : "25"
                  }
                  value={formData.discountValue}
                  onChange={(e) =>
                    handleInputChange("discountValue", e.target.value)
                  }
                  type="number"
                  required
                />
                <Field
                  label="Minimum Order"
                  placeholder="e.g. 50"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    handleInputChange("minOrderAmount", e.target.value)
                  }
                  type="number"
                />
                <Field
                  label="Max Discount Cap"
                  placeholder="e.g. 20"
                  value={formData.maxDiscountCap}
                  onChange={(e) =>
                    handleInputChange("maxDiscountCap", e.target.value)
                  }
                  type="number"
                />
              </div>
            </Section>

            <Section
              title="Usage Rules"
              description="Control how often this coupon can be used"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Total Usage Limit"
                  placeholder="e.g. 5000"
                  value={formData.totalUsageLimit}
                  onChange={(e) =>
                    handleInputChange("totalUsageLimit", e.target.value)
                  }
                  type="number"
                  required
                />
                <Field
                  label="Per User Limit"
                  placeholder="e.g. 1"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    handleInputChange("perUserLimit", e.target.value)
                  }
                  type="number"
                />
              </div>
            </Section>

            <Section
              title="Validity Settings"
              description="Set who can use this coupon and when it expires"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Expiry Date"
                  placeholder="Select expiry date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    handleInputChange("expiryDate", e.target.value)
                  }
                  type="date"
                  required
                />
                <Field
                  label="Specific User IDs"
                  placeholder="id1, id2, id3"
                  value={formData.eligibleUsers}
                  onChange={(e) =>
                    handleInputChange("eligibleUsers", e.target.value)
                  }
                />
              </div>
            </Section>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/coupon-management")}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-foreground text-white hover:bg-foreground/90"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Coupon"
                    : "Create Coupon"}
              </Button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Live Preview
              </h3>
              <div className="mt-4 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                <p className="text-[10px] font-bold uppercase text-blue-500">
                  Coupon Code
                </p>
                <p className="mt-1 text-lg font-bold text-gray-950">
                  {previewData.code}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {previewData.discount}
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  Valid for {previewData.validity}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Eligibility
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Select who can redeem this coupon
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {validityOptions.map((option, index) => (
                  <ChoiceCard
                    key={option.title}
                    active={selectedValidity === index}
                    title={option.title}
                    description={option.description}
                    compact
                    onClick={() => setSelectedValidity(index)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label className="text-xs text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <Input
        placeholder={placeholder}
        className="mt-1 h-9 border-gray-200 text-xs placeholder:text-gray-400"
        value={value}
        onChange={onChange}
        type={type}
        required={required}
      />
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  active,
  compact,
  onClick,
}: {
  title: string;
  description: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-start justify-between rounded-md border bg-white text-left transition-colors",
        compact ? "p-3" : "p-4",
        active
          ? "border-[#6F6CFF] bg-[#F3F4FF]"
          : "border-gray-100 hover:border-gray-200",
      )}
      onClick={onClick}
    >
      <span>
        <span className="block text-xs font-semibold text-gray-800">
          {title}
        </span>
        <span className="mt-1 block text-[10px] text-gray-400">
          {description}
        </span>
      </span>
      {active ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6F6CFF]" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-gray-300" />
      )}
    </button>
  );
}
