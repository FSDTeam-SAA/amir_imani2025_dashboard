import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnother?: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  onAddAnother,
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            QR Code Created Successfully
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          The QR code has been generated and saved to your dashboard. You can
          view or download it anytime with ease.
        </p>

        <div className="flex gap-3 pt-4">
          {onAddAnother && (
            <Button variant="outline" onClick={onAddAnother} className="flex-1">
              Add Another
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1 bg-foreground hover:bg-muted hover:text-foreground text-white hover:shadow-lg hover:shadow-[#F04D2A]/30 transition-shadow font-heading"
          >
            Go to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
