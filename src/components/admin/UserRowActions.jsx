import { useState } from "react";
import { MoreHorizontal, Copy, ExternalLink, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { _grantPlan } from "@/network/admin";

const PLAN_OPTIONS = [
  { value: "lifetime", label: "Lifetime" },
];

export default function UserRowActions({ user }) {
  const [grantOpen, setGrantOpen] = useState(false);
  const [planType, setPlanType] = useState("lifetime");
  const [granting, setGranting] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      toast.success("Email copied");
    } catch {
      toast.error("Failed to copy email");
    }
  };

  const viewProfile = () => {
    window.open(
      `https://${user.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleGrant = async () => {
    setGranting(true);
    try {
      await _grantPlan({ emails: [user.email], planType });
      toast.success(`Granted ${planType} to ${user.email}`);
      setGrantOpen(false);
    } catch {
      toast.error("Failed to grant plan");
    } finally {
      setGranting(false);
    }
  };

  const isFree = !user.activePlan || user.activePlan === "free";
  const isDeleted = user.status === 1;

  return (
    <>
      {!isDeleted && isFree ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setGrantOpen(true)}
          aria-label={`Grant plan to ${user.email}`}
        >
          <Gift size={15} aria-hidden="true" />
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Actions for ${user.email}`}
            >
              <MoreHorizontal size={16} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={copyEmail} className="cursor-pointer">
              <Copy size={14} className="mr-2" aria-hidden="true" />
              Copy email
            </DropdownMenuItem>
            {!isDeleted && user.username && (
              <DropdownMenuItem onClick={viewProfile} className="cursor-pointer">
                <ExternalLink size={14} className="mr-2" aria-hidden="true" />
                View profile
              </DropdownMenuItem>
            )}
            {!isDeleted && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setGrantOpen(true)}
                  className="cursor-pointer"
                >
                  <Gift size={14} className="mr-2" aria-hidden="true" />
                  Grant plan
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Grant Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-sm text-[#7A736C] dark:text-[#B5AFA5] break-all">{user.email}</p>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleGrant} disabled={granting}>
              {granting ? "Granting..." : "Grant access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
