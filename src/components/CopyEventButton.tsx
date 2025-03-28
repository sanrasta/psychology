"use client";

import { ButtonProps, Button } from "@/components/ui/button";
import { Copy, CopyCheck, CopyX } from "lucide-react";
import { useState } from "react";

type CopyState = "idle" | "copied" | "error";

type CopyEventButtonProps = Omit<ButtonProps, "children" | "onClick"> & {
  eventId: string;
  clerkUserId: string;
};

export function CopyEventButton({
  eventId,
  clerkUserId,
  ...buttonProps
}: CopyEventButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const CopyIcon = getCopyIcon(copyState);

  return (
    <Button
      {...buttonProps}
      onClick={() => {
        navigator.clipboard
          .writeText(`${location.origin}/book/${clerkUserId}/${eventId}`)
          .then(() => {
            setCopyState("copied");
            setTimeout(() => setCopyState("idle"), 2000);
          })
          .catch(() => {
            setCopyState("error");
            setTimeout(() => setCopyState("idle"), 2000);
          });
      }}
    >
      <CopyIcon className="size-4 mr-2" />
      {getChildren(copyState)}
    </Button>
  );
}

function getCopyIcon(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return Copy;
    case "copied":
      return CopyCheck;
    case "error":
      return CopyX;
  }
}

function getChildren(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return "Copy Link";
    case "copied":
      return "Copied!";
    case "error":
      return "Failed to Copy";
  }
}