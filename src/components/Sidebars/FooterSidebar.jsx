import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/context/globalContext";
import { Upload, FileText, Trash2 } from "lucide-react";
import { _updateUser, _deleteResume } from "@/network/post-request";
import { FooterValidationSchema } from "@/lib/validationSchemas";
import Text from "../text";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";

const FooterSettingsPanel = () => {
  const {
    closeSidebar,
    userDetails,
    updateCache,
    setUserDetails,
    userDetailsRefecth,
  } = useGlobalContext();

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isRemovingResume, setIsRemovingResume] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null); // { name: string, size: string } | null
  const resumeInputRef = useRef(null);

  // Sync uploadedResume from userDetails when they have an existing resume (no size from API)
  useEffect(() => {
    const name = userDetails?.resume?.originalName;
    if (name) {
      setUploadedResume({ name, size: null });
    } else {
      setUploadedResume(null);
    }
  }, [userDetails?.resume?.originalName]);

  const handleClose = () => {
    closeSidebar();
  };

  const handleResumeUpload = () => {
    resumeInputRef.current?.click?.();
  };

  const handleRemoveResume = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsRemovingResume(true);
    try {
      await _deleteResume();
      await userDetailsRefecth();
      toast.success("Resume removed");
    } catch (error) {
      console.error("Error removing resume:", error);
      toast.error("Failed to remove resume");
    } finally {
      setIsRemovingResume(false);
    }
  };

  const handleResumeFileChange = async (event) => {
    const file = event?.currentTarget?.files?.[0];
    // allow re-selecting same file
    event.currentTarget.value = "";
    if (!file) return;

    // Basic constraints (match old UX copy: PDF only, max 5MB)
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maximum size should be 5MB.");
      return;
    }

    setIsUploadingResume(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const payload = {
        resume: {
          key: base64,
          originalName: file.name,
          extension: file.type,
        },
      };

      const res = await _updateUser(payload);
      if (res?.data?.user) {
        updateCache("userDetails", res.data.user);
        setUserDetails(res.data.user);
        setUploadedResume({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
        });
        toast.success("Resume updated successfully");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const getInitialValues = () => {
    const rawContactEmail = userDetails?.contact_email;
    const contactEmail =
      typeof rawContactEmail === "string" ? rawContactEmail.trim() : "";

    return {
      // If contact_email is empty/missing/null, show account email by default
      contact_email: contactEmail ? rawContactEmail : (userDetails?.email || ""),
      phone: userDetails?.phone || "",
      blogs: userDetails?.portfolios?.medium || "",
      linkedin: userDetails?.socials?.linkedin || "",
      x: userDetails?.socials?.twitter || "",
      instagram: userDetails?.socials?.instagram || "",
      dribbble: userDetails?.portfolios?.dribbble || "",
    };
  };

  const renderContent = () => {
    return (
      <Formik
        key={userDetails?._id || 'footer-form'}
        initialValues={getInitialValues()}
        validationSchema={FooterValidationSchema}
        enableReinitialize
        onSubmit={async (values, actions) => {
          setIsSaving(true);
          try {
            const contactEmail = (values.contact_email || "").trim();
            const updatePayload = {
              // Keep as string ("" allowed) to match backend Joi allow("")
              contact_email: contactEmail,
              phone: values.phone,
              socials: {
                linkedin: values.linkedin,
                twitter: values.x,
                instagram: values.instagram,
              },
              portfolios: {
                medium: values.blogs,
                dribbble: values.dribbble,
              },
            };

            const res = await _updateUser(updatePayload);
            if (res?.data?.user) {
              updateCache("userDetails", res.data.user);
              setUserDetails(res.data.user);
              toast.success("Updated successfully");
              handleClose();
            }
            actions.setSubmitting(false);
          } catch (error) {
            console.error("Error updating footer settings:", error);
            toast.error("Failed to update");
            actions.setSubmitting(false);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched, values }) => (
          <Form id="footerForm" className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-6 flex flex-col gap-8">
              {/* Resume Section */}
              <div className="flex flex-col gap-3">
                <Label className="px-1 text-xs font-semibold uppercase tracking-wider text-foreground-landing/40">
                  Resume
                </Label>
                <input
                  ref={resumeInputRef}
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleResumeFileChange}
                />
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={
                    uploadedResume
                      ? `Resume: ${uploadedResume.name}`
                      : "Upload resume PDF"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleResumeUpload();
                    }
                  }}
                  className={cn(
                    "group/resume relative rounded-2xl border p-8 pt-10 outline-none transition-[border-color,box-shadow,background-color] duration-200",
                    "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    uploadedResume
                      ? [
                          "border-border bg-card shadow-sm",
                          "ring-1 ring-border/80",
                          "hover:border-primary/35 hover:bg-accent/25 hover:shadow-md hover:ring-primary/20",
                        ]
                      : [
                          "border-dashed border-border/90 bg-card/60",
                          "hover:border-muted-foreground/35 hover:bg-accent/20 hover:shadow-sm",
                        ],
                  )}
                  onClick={handleResumeUpload}
                >
                  {uploadedResume ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute right-2 top-2 z-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      disabled={isUploadingResume || isRemovingResume}
                      aria-label={
                        isRemovingResume ? "Removing resume" : "Delete resume"
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveResume(e);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover/resume:opacity-100" />
                  <div className="relative flex flex-col items-center gap-4 text-center">
                    <div
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200",
                        uploadedResume
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground group-hover/resume:bg-accent group-hover/resume:text-foreground",
                      )}
                    >
                      {uploadedResume ? (
                        <FileText className="size-7" aria-hidden />
                      ) : (
                        <Upload className="size-7 transition-colors" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 w-full">
                      <h4 className="truncate px-1 text-base font-semibold text-foreground">
                        {uploadedResume
                          ? uploadedResume.name
                          : "Resume (optional)"}
                      </h4>
                      {uploadedResume?.size ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {uploadedResume.size}
                        </p>
                      ) : null}
                    </div>
                    <div
                      className="w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-12 w-full rounded-full border-border bg-background font-semibold shadow-xs hover:bg-accent"
                        type="button"
                        disabled={isUploadingResume || isRemovingResume}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResumeUpload();
                        }}
                      >
                        <Upload data-icon="inline-start" />
                        {isUploadingResume
                          ? "Uploading..."
                          : uploadedResume
                            ? "Replace"
                            : "Choose file"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-6">
                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground-landing/40 px-1">
                  Contact Info
                </Label>
                <div className="space-y-5">
                  <div>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium"
                    >
                      Contact Email
                    </Text>
                    <Field name="contact_email">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          className={`mt-2 ${errors.contact_email && touched.contact_email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-footer-mail"
                          placeholder="your.email@example.com"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="contact_email"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  <div>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium"
                      required
                    >
                      Phone Number
                    </Text>
                    <Field name="phone">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="tel"
                          className={`mt-2 ${errors.phone && touched.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-footer-phone"
                          placeholder="+1 (123) 456-7890"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="error-message"
                    />
                  </div>
                </div>
              </div>

              {/* Links & Socials Section */}
              <div className="space-y-6">
                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground-landing/40 px-1">
                  Links & Socials
                </Label>
                <div className="space-y-5">
                  <div>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium"
                    >
                      Blogs (Medium)
                    </Text>
                    <Field name="blogs">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="url"
                          className={`mt-2 ${errors.blogs && touched.blogs ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-footer-blogs"
                          placeholder="https://medium.com"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="blogs"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  <div>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium"
                    >
                      LinkedIn
                    </Text>
                    <Field name="linkedin">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="url"
                          className={`mt-2 ${errors.linkedin && touched.linkedin ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-footer-linkedin"
                          placeholder="https://linkedin.com"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="linkedin"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  <div>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium"
                    >
                      X (Twitter)
                    </Text>
                    <Field name="x">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="url"
                          className={`mt-2 ${errors.x && touched.x ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-footer-x"
                          placeholder="https://x.com"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="x"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  <div>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium"
                    >
                      Instagram
                    </Text>
                    <Field name="instagram">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="url"
                          className={`mt-2 ${errors.instagram && touched.instagram ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-footer-instagram"
                          placeholder="https://instagram.com"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="instagram"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  <div>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium"
                    >
                      Dribbble
                    </Text>
                    <Field name="dribbble">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="url"
                          className={`mt-2 ${errors.dribbble && touched.dribbble ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-footer-dribbble"
                          placeholder="https://dribbble.com"
                          autoComplete="off"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="dribbble"
                      component="div"
                      className="error-message"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-sidebar sticky bottom-0">
              <Button
                type="submit"
                form="footerForm"
                className="w-full h-11 rounded-full font-semibold"
                disabled={isSubmitting || isSaving}
              >
                {isSubmitting || isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  return renderContent();
};

export default FooterSettingsPanel;
