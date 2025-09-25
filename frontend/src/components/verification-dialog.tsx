"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isVerified: boolean;
  onConfirm: () => Promise<void>;
  userName?: string;
}

export function VerificationDialog({
  open,
  onOpenChange,
  isVerified,
  onConfirm,
  userName = "this user"
}: VerificationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  const actionText = isVerified ? "Unverify" : "Verify";
  const actionDescription = isVerified 
    ? `Are you sure you want to unverify ${userName}? They will lose event management access.`
    : `Are you sure you want to verify ${userName}? They will gain event management access.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              {isVerified ? (
                <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {actionText} User
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                This action requires admin confirmation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-foreground">
            {actionDescription}
          </p>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant={isVerified ? "outline" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            className="relative"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>{actionText} User</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
