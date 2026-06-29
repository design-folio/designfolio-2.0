import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { _grantPlan } from "@/network/admin";

const PLAN_OPTIONS = [{ value: "lifetime", label: "Lifetime" }];

function parseEmails(raw) {
  return raw
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
}

export default function GrantPlanForm() {
  const [raw, setRaw] = useState("");
  const [planType, setPlanType] = useState("lifetime");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const emails = parseEmails(raw);

  const handleSubmit = async () => {
    if (emails.length === 0) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await _grantPlan({ emails, planType });
      setResults(res.data.results);
    } catch {
      setResults([{ email: "Request failed", status: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="rounded-2xl border border-[#E5D7C4] bg-white dark:border-white/10 dark:bg-[#2A2520]">
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">Grant Plan</h3>
        </div>
        <div className="h-px bg-[#E5D7C4] dark:bg-white/10" />
        <div className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="emails" className="text-sm text-[#1A1A1A] dark:text-[#F0EDE7]">
              User emails
            </Label>
            <Textarea
              id="emails"
              placeholder={"user@example.com\nanother@example.com"}
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setResults(null);
              }}
              rows={6}
              className="resize-none border-[#E5D7C4] bg-[#F5F2EE] font-mono text-sm text-[#1A1A1A] placeholder:text-[#7A736C] dark:border-white/10 dark:bg-[#231F1A] dark:text-[#F0EDE7] dark:placeholder:text-[#B5AFA5]"
            />
            {emails.length > 0 && (
              <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5]">
                {emails.length} email{emails.length !== 1 ? "s" : ""} detected
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-type" className="text-sm text-[#1A1A1A] dark:text-[#F0EDE7]">
              Plan type
            </Label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger id="plan-type" className="h-9" aria-label="Select plan type">
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" disabled={emails.length === 0 || loading}>
                {loading ? "Granting..." : "Grant access"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Grant {planType} plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will grant <strong>{planType}</strong> access to{" "}
                  <strong>{emails.length}</strong> user
                  {emails.length !== 1 ? "s" : ""}. This action cannot be undone automatically.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit} disabled={loading}>
                  Confirm grant
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {results && (
            <>
              <div className="h-px bg-[#E5D7C4] dark:bg-white/10" />
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">Results</p>
                <div className="max-h-48 space-y-1.5 overflow-y-auto">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-mono text-xs text-[#7A736C] dark:text-[#B5AFA5]">
                        {r.email}
                      </span>
                      {r.status === "granted" ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-green-200 bg-green-50 text-xs text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                        >
                          Granted
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-red-200 bg-red-50 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                        >
                          Not found
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
