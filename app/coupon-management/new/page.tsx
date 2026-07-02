"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const validityOptions = [
  ["All Users", "Available to everyone", true],
  ["First-Time Users", "Only new customers", false],
  ["Specific Users", "Target special accounts", false],
  ["User Groups", "Segmented recipients", false],
] as const;

export default function CreateCouponPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    couponName: "",
    couponCode: "",
    description: "",
    status: "",
    discountType: "percentage",
    discountValue: "",
    totalUsageLimit: "",
    perUserLimit: "",
    startDate: "",
    expiryDate: "",
  });
  const [selectedValidity, setSelectedValidity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDiscountTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, discountType: type }));
  };

  const handleValiditySelect = (index: number) => {
    setSelectedValidity(index);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.couponName || !formData.couponCode || !formData.discountValue) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const couponData = {
        ...formData,
        validity: validityOptions[selectedValidity][0],
        createdAt: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9),
      };
      
      console.log("Coupon Data Submitted:", couponData);
      
      // Show success state
      setShowSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push("/coupon-management");
      }, 1500);
      
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Failed to create coupon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update live preview based on form data
  const previewData = {
    code: formData.couponCode || "SUMMER25",
    discount: formData.discountValue || "25% OFF",
    validity: validityOptions[selectedValidity][0],
  };

  return (
    <>
      <DashboardHeader
        title="Create Coupon"
        description="Set up a new discount code for your customers"
        onAction={() => router.push("/coupon-management/new")}
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {showSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
            ✅ Coupon created successfully! Redirecting...
          </div>
        )}
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Section title="Coupon Information" description="Basic details about this coupon">
              <div className="grid gap-4 md:grid-cols-2">
                <Field 
                  label="Coupon Name" 
                  placeholder="e.g. Summer Sale 2026"
                  value={formData.couponName}
                  onChange={(e) => handleInputChange("couponName", e.target.value)}
                  required
                />
                <Field 
                  label="Coupon Code" 
                  placeholder="e.g. SUMMER25"
                  value={formData.couponCode}
                  onChange={(e) => handleInputChange("couponCode", e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="mt-4">
                <Label className="text-xs text-gray-600">Description</Label>
                <Textarea
                  placeholder="Briefly describe this coupon campaign..."
                  className="mt-1 min-h-20 resize-none border-gray-200 text-xs"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Field 
                  label="Status" 
                  placeholder="Active"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                />
              </div>
            </Section>

            <Section title="Discount Settings" description="Define how much customers save">
              <div className="grid gap-3 md:grid-cols-2">
                <ChoiceCard 
                  active={formData.discountType === "percentage"} 
                  title="% Percentage" 
                  description="% off the order"
                  onClick={() => handleDiscountTypeSelect("percentage")}
                />
                <ChoiceCard 
                  active={formData.discountType === "fixed"} 
                  title="$ Fixed Amount" 
                  description="$ off the order"
                  onClick={() => handleDiscountTypeSelect("fixed")}
                />
              </div>
              <div className="mt-4">
                <Field 
                  label="Discount Value" 
                  placeholder={formData.discountType === "percentage" ? "25%" : "$25"}
                  value={formData.discountValue}
                  onChange={(e) => handleInputChange("discountValue", e.target.value)}
                  required
                />
              </div>
            </Section>

            <Section title="Usage Rules" description="Control how often this coupon can be used">
              <div className="grid gap-4 md:grid-cols-2">
                <Field 
                  label="Total Usage Limit" 
                  placeholder="e.g. 5000"
                  value={formData.totalUsageLimit}
                  onChange={(e) => handleInputChange("totalUsageLimit", e.target.value)}
                  type="number"
                />
                <Field 
                  label="Per User Limit" 
                  placeholder="e.g. 1"
                  value={formData.perUserLimit}
                  onChange={(e) => handleInputChange("perUserLimit", e.target.value)}
                  type="number"
                />
              </div>
            </Section>

            <Section title="Validity Settings" description="Set the active window for this coupon">
              <div className="grid gap-4 md:grid-cols-2">
                <Field 
                  label="Start Date" 
                  placeholder="Select start date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  type="date"
                />
                <Field 
                  label="Expiry Date" 
                  placeholder="Select expiry date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  type="date"
                />
              </div>
            </Section>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/coupon-management")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                className="bg-foreground text-white hover:bg-foreground/90"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
              <div className="mt-4 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                <p className="text-[10px] font-bold uppercase text-blue-500">Coupon Code</p>
                <p className="mt-1 text-lg font-bold text-gray-950">{previewData.code}</p>
                <p className="text-sm font-semibold text-gray-800">
                  {previewData.discount}
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  Valid for {previewData.validity}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Validity Settings</h3>
              <p className="mt-1 text-xs text-gray-500">Set the criteria window for this coupon</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {validityOptions.map(([title, description, active], index) => (
                  <ChoiceCard
                    key={title}
                    active={selectedValidity === index}
                    title={title}
                    description={description}
                    compact
                    onClick={() => handleValiditySelect(index)}
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
        {required && <span className="text-red-500 ml-0.5">*</span>}
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
        "flex w-full items-start justify-between rounded-md border bg-white text-left transition-colors cursor-pointer",
        compact ? "p-3" : "p-4",
        active ? "border-[#6F6CFF] bg-[#F3F4FF]" : "border-gray-100 hover:border-gray-200"
      )}
      onClick={onClick}
    >
      <span>
        <span className="block text-xs font-semibold text-gray-800">{title}</span>
        <span className="mt-1 block text-[10px] text-gray-400">{description}</span>
      </span>
      {active ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6F6CFF]" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-gray-300" />
      )}
    </button>
  );
}