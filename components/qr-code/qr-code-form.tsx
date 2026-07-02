import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { QRCode, CreateQRCodeInput } from "@/lib/types/qr-code";

interface QRCodeFormProps {
  qrCode?: QRCode | null;
  onSubmit: (data: CreateQRCodeInput) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function QRCodeForm({
  qrCode,
  onSubmit,
  isLoading = false,
  onCancel,
}: QRCodeFormProps) {
  const [gameName, setGameName] = useState("");
  const [gameLink, setGameLink] = useState("");

  // console.log(qrCode);

  useEffect(() => {
    if (qrCode) {
      setGameName(qrCode.gameName);
      setGameLink(qrCode.finalUrl);
    } else {
      setGameName("");
      setGameLink("");
    }
  }, [qrCode?._id, qrCode?.gameName, qrCode?.finalUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      gameName,
      finalUrl: gameLink,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="gameName">Game Name</Label>
        <Input
          id="gameName"
          placeholder="Enter Game Name"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2 pb-10">
        <Label htmlFor="gameLink">Game Link</Label>
        <Input
          id="gameLink"
          type="url"
          placeholder="Enter Game Link"
          value={gameLink}
          onChange={(e) => setGameLink(e.target.value)}
          required
        />
      </div>

      {/* <div className="space-y-2">
        <Label className="flex items-center gap-3">
          <span>{linkStatus === 'active' ? 'Link is active and accessible' : 'Link is inactive'}</span>
          <Switch
            checked={linkStatus === 'active'}
            onCheckedChange={(checked) => setLinkStatus(checked ? 'active' : 'inactive')}
          />
        </Label>
      </div> */}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-foreground hover:bg-foreground/80 cursor-pointer duration-300 text-[#eeeeee] hover:shadow-lg hover:shadow-[#F04D2A]/30 transition-shadow font-heading text-base"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {qrCode ? "Update QR Code" : "Generate QR Code"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            className="font-heading text-base  hover:bg-[#f72d00] border-[#F04D2A] "
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
