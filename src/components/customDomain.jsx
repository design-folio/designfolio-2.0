import { useGlobalContext } from "@/context/globalContext";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { _verifyDomain, addDomain } from "@/network/post-request";
import { _removeDomain } from "@/network/get-request";

const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(/^(?=.{1,253}$)((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/, "Invalid domain")
    .required("Domain is required"),
});

export default function CustomDomain({ domainDetails, fetchDomainDetails }) {
  const { userDetails, setShowUpgradeModal, setUpgradeModalUnhideProject } = useGlobalContext();
  const [isDomainLoading, setIsDomainLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleChange = (e, setFieldValue) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };

  const handleRemoveDomain = () => {
    _removeDomain().then(() => {
      fetchDomainDetails();
      setIsDeleteOpen(false);
    });
  };

  const isVerified =
    domainDetails?.customDomain?.isCustomVerified && domainDetails?.customDomain?.isCustomVerified;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Custom domain
        </p>
        <span className="rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FFB347] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white uppercase">
          PRO
        </span>
        {domainDetails?.customDomain?.domain &&
          (isVerified ? (
            <Badge className="items-center gap-1 border-0 bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D]/30 dark:text-[#4ADE80]">
              <span className="inline-block h-2 w-2 bg-[#22C55E]" />
              Connected
            </Badge>
          ) : (
            <Badge className="items-center gap-1 border-0 bg-[#FEFCE8] text-[#CA8A04] dark:bg-[#713F12]/30 dark:text-[#FDE047]">
              <span className="inline-block h-2 w-2 bg-[#FACC15]" />
              Verification pending
            </Badge>
          ))}
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
        Use your own domain — make your portfolio truly yours
      </p>

      {userDetails?.pro ? (
        <>
          {domainDetails?.customDomain?.domain ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="mb-0.5 text-[12px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                    URL
                  </p>
                  <p className="text-[14px] font-medium text-red-500">
                    {domainDetails.customDomain.domain}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div>
                <p className="mb-0.5 text-[12px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                  Status
                </p>
                {isVerified ? (
                  <p className="text-[14px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                    Website is published and optimized
                  </p>
                ) : (
                  <p className="text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7]">
                    Your <span className="text-red-500">DNS records</span> must be set up with the
                    following values. Once done, click{" "}
                    <span className="text-red-500">&apos;Verify Domain&apos;</span> to complete
                    verification.
                  </p>
                )}
              </div>

              {!isVerified && (
                <>
                  <div className="overflow-hidden rounded-xl border border-[#E5D7C4] dark:border-white/10">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#F5F3EF] font-medium text-[#1A1A1A] dark:bg-[#35302A] dark:text-[#F0EDE7]">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Value</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#1A1A1A] dark:text-[#F0EDE7]">
                        {domainDetails?.customDomain?.verificationData?.map((record, index) => (
                          <tr
                            className="border-t border-[#E5D7C4] dark:border-white/10"
                            key={index}
                          >
                            <td className="px-4 py-3">{record?.domain}</td>
                            <td className="px-4 py-3">{record?.type}</td>
                            <td className="px-4 py-3 break-all">{record?.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    className="w-full"
                    disabled={isDomainLoading}
                    onClick={() => {
                      setIsDomainLoading(true);
                      _verifyDomain()
                        .then(() => fetchDomainDetails())
                        .catch((err) => toast.error(err.response.data.error))
                        .finally(() => setIsDomainLoading(false));
                    }}
                  >
                    {isDomainLoading ? "Verifying…" : "Verify domain"}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Formik
              initialValues={{ domain: domainDetails?.customDomain?.domain ?? "" }}
              validationSchema={DomainValidationSchema}
              onSubmit={(values, actions) => {
                if (values.domain) {
                  actions.setSubmitting(false);
                  addDomain({ customDomain: values.domain }).then(() => fetchDomainDetails());
                }
              }}
            >
              {({ isSubmitting, isValid, setFieldValue }) => (
                <Form id="domainForm" className="mt-6 flex items-start gap-4">
                  <div className="flex-1">
                    <Field name="domain">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="www.site.com"
                          autoComplete="off"
                          onChange={(e) => handleChange(e, setFieldValue)}
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="domain"
                      component="p"
                      className="text-destructive mt-1 text-[13px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    form="domainForm"
                    disabled={isSubmitting || !isValid}
                    className=""
                  >
                    Add domain
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </>
      ) : (
        <div className="mt-4 rounded-xl border-2 border-dashed border-[#D5D0C6] bg-[#F5F3EF] p-6 text-center dark:border-[#3A352E] dark:bg-[#1A1A1A]">
          <h3 className="mb-2 text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
            Available on Designfolio Pro
          </h3>
          <p className="mx-auto mb-4 max-w-xs text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
            Want to connect your own domain? Upgrade to Designfolio Pro and make your portfolio look
            like a real website.
          </p>
          <Button
            className=""
            onClick={() => {
              setUpgradeModalUnhideProject(null);
              setShowUpgradeModal(true);
            }}
          >
            Upgrade to Pro
          </Button>
        </div>
      )}

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-[400px] rounded-2xl border border-[#E5D7C4] bg-white dark:border-white/10 dark:bg-[#2A2520]">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A] dark:text-[#F0EDE7]">Remove domain</DialogTitle>
            <DialogDescription className="text-[#7A736C] dark:text-[#B5AFA5]">
              Are you sure you want to remove this domain? Your visitors will no longer be able to
              find you through this link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="" onClick={handleRemoveDomain}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
