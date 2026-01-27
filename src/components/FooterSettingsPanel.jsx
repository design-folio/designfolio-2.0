import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/buttonNew";
import { Label } from "@/components/ui/label";
import { SheetWrapper } from "@/components/ui/SheetWrapper";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { sidebars, modals } from "@/lib/constant";
import { Upload, X } from "lucide-react";
import { _updateUser } from "@/network/post-request";
import { FooterValidationSchema } from "@/lib/validationSchemas";
import Text from "./text";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";

const FooterSettingsPanel = () => {
  const {
    activeSidebar,
    closeSidebar,
    userDetails,
    updateCache,
    setUserDetails,
    openModal,
  } = useGlobalContext();
  const isMobileOrTablet = useIsMobile();
  const show = activeSidebar === sidebars.footer;

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const resumeInputRef = useRef(null);

  const handleClose = () => {
    closeSidebar();
  };

  const handleResumeUpload = () => {
    resumeInputRef.current?.click?.();
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

  const renderContent = (isMobile) => {
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
            <div className="flex-1 overflow-auto p-6 space-y-8">
              {/* Resume Section */}
              <div className="space-y-4">
                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground-landing/40 px-1">
                  Resume
                </Label>
                <div
                  className="p-8 rounded-[2rem] border-2 border-border/40 bg-white dark:bg-df-section-card-bg-color hover-elevate transition-all duration-300 group cursor-pointer"
                  onClick={handleResumeUpload}
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-foreground-landing/30 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground-landing">
                        Update Resume
                      </h4>
                      <p className="text-sm text-foreground-landing/40 mt-1 font-medium">
                        PDF format only • Max 5MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full h-12 border-2 border-border/50 bg-white dark:bg-df-section-card-bg-color hover:bg-muted/50 font-semibold"
                      type="button"
                      disabled={isUploadingResume}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleResumeUpload();
                      }}
                    >
                      {isUploadingResume ? "Uploading..." : "Choose File"}
                    </Button>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      hidden
                      accept="application/pdf"
                      onChange={handleResumeFileChange}
                    />
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
                    <Field
                      name="contact_email"
                      type="email"
                      className={`text-input mt-2 ${errors.contact_email &&
                        touched.contact_email &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      data-testid="input-footer-mail"
                      placeholder="your.email@example.com"
                      autoComplete="off"
                    />
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
                    <Field
                      name="phone"
                      type="tel"
                      className={`text-input mt-2 ${errors.phone &&
                        touched.phone &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      data-testid="input-footer-phone"
                      placeholder="+1 (123) 456-7890"
                      autoComplete="off"
                    />
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
                    <Field
                      name="blogs"
                      type="url"
                      className={`text-input mt-2 ${errors.blogs &&
                        touched.blogs &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      data-testid="input-footer-blogs"
                      placeholder="https://medium.com"
                      autoComplete="off"
                    />
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
                    <Field
                      name="linkedin"
                      type="url"
                      className={`text-input mt-2 ${errors.linkedin &&
                        touched.linkedin &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      data-testid="input-footer-linkedin"
                      placeholder="https://linkedin.com"
                      autoComplete="off"
                    />
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
                    <Field
                      name="x"
                      type="url"
                      className={`text-input mt-2 ${errors.x &&
                        touched.x &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      data-testid="input-footer-x"
                      placeholder="https://x.com"
                      autoComplete="off"
                    />
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
                    <Field
                      name="instagram"
                      type="url"
                      className={`text-input mt-2 ${errors.instagram &&
                        touched.instagram &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      data-testid="input-footer-instagram"
                      placeholder="https://instagram.com"
                      autoComplete="off"
                    />
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
                    <Field
                      name="dribbble"
                      type="url"
                      className={`text-input mt-2 ${errors.dribbble &&
                        touched.dribbble &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      data-testid="input-footer-dribbble"
                      placeholder="https://dribbble.com"
                      autoComplete="off"
                    />
                    <ErrorMessage
                      name="dribbble"
                      component="div"
                      className="error-message"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-white dark:bg-df-section-card-bg-color sticky bottom-0">
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

  if (isMobileOrTablet) {
    return (
      <Sheet open={show} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border pt-[16px] pb-[16px]">
            <h2 className="text-lg font-semibold">Footer Settings</h2>
          </div>
          {renderContent(true)}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <SheetWrapper
      open={show}
      onClose={handleClose}
      title="Footer Settings"
      width="320px"
    >
      {renderContent(false)}
    </SheetWrapper>
  );
};

export default FooterSettingsPanel;
