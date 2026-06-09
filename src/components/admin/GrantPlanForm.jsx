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

const PLAN_OPTIONS = [
  { value: "lifetime", label: "Lifetime" },
];

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
      <div className="bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10">
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">Grant Plan</h3>
        </div>
        <div className="h-px bg-[#E5D7C4] dark:bg-white/10" />
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="emails" className="text-sm text-[#1A1A1A] dark:text-[#F0EDE7]">
              User emails
            </Label>
            <Textarea
              id="emails"
              placeholder={"user@example.com\nanother@example.com"}
              value={raw}
              onChange={(e) => { setRaw(e.target.value); setResults(null); }}
              rows={6}
              className="text-sm font-mono resize-none bg-[#F5F2EE] dark:bg-[#231F1A] border-[#E5D7C4] dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] placeholder:text-[#7A736C] dark:placeholder:text-[#B5AFA5]"
            />
            {emails.length > 0 && (
              <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5]">
                {emails.length} email{emails.length !== 1 ? "s" : ""} detected
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-type" className="text-sm text-[#1A1A1A] dark:text-[#F0EDE7]">Plan type</Label>
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
              <Button
                className="w-full"
                disabled={emails.length === 0 || loading}
              >
                {loading ? "Granting..." : "Grant access"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Grant {planType} plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will grant <strong>{planType}</strong> access to{" "}
                  <strong>{emails.length}</strong> user
                  {emails.length !== 1 ? "s" : ""}. This action cannot be undone
                  automatically.
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
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-[#7A736C] dark:text-[#B5AFA5] truncate font-mono text-xs">
                        {r.email}
                      </span>
                      {r.status === "granted" ? (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          Granted
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
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
