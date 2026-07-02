import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Edit2, Trash2 } from "lucide-react";
import type { QRCode } from "@/lib/types/qr-code";
import Image from "next/image";
import { QRCodeGridSkeleton } from "@/components/skeletons";

interface QRCodeGridProps {
  qrCodes: QRCode[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function QRCodeGrid({
  qrCodes,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onDownload,
}: QRCodeGridProps) {
  if (isLoading) {
    return <QRCodeGridSkeleton count={8} />;
  }

  if (qrCodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No QR codes found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {qrCodes.map((qr) => (
        <Card key={qr._id} className="flex flex-col border-none md:mx-0 mx-4">
          <CardContent className="p-4 flex flex-col gap-3 flex-1">
            {qr.qrCode && (
              <div className="flex justify-center">
                <Image
                  width={600}
                  height={600}
                  src={qr.qrCode || "/placeholder.svg"}
                  alt="QR Code"
                  className="p-1 object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0 items-center justify-center text-center">
              <h3 className="font-semibold truncate">{qr.gameName}</h3>
              <a
                href={qr.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate block text-(--base-color)"
              >
                {qr.finalUrl}
              </a>
            </div>

            <div className="flex gap-2 justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(qr._id)}
                className="text-primary"
                title="View"
              >
                <Eye className="!h-6 !w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(qr._id)}
                title="Download"
              >
                <Download className="!h-6 !w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(qr._id)}
                className="text-green-600"
                title="Edit"
              >
                <Edit2 className="!h-6 !w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(qr._id)}
                className="text-destructive"
                title="Delete"
              >
                <Trash2 className="!h-6 !w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
