import { useGlobalContext } from "@/context/globalContext";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Button from "./button";
import styles from "@/styles/domain.module.css";
import { Badge } from "./ui/badge";
import DotIcon from "../../public/assets/svgs/dots.svg";
import RefreshIcon from "../../public/assets/svgs/refresh.svg";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import { _verifyDomain, addDomain } from "@/network/post-request";
import Modal from "./modal";
import Text from "./text";
import { _removeDomain } from "@/network/get-request";
const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(
      /^(?=.{1,253}$)((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/,
      "Invalid domain"
    )
    .required("Domain is required"),
});

export default function CustomDomain({ domainDetails, fetchDomainDetails }) {
  const { userDetails, setShowUpgradeModal } = useGlobalContext();
  const [isDomainLoading, setIsDomainLoading] = useState(false);

  const [isDelete, setIsDelete] = useState(false);
  // Formik handleChange function with API call
  const handleChange = (e, setFieldValue) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };
  const handleRemoveDomain = () => {
    _removeDomain().then((res) => {
      fetchDomainDetails();
      setIsDelete(false);
    });
  };
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
          Custom domain
        </p>
        <span className={styles.proBadge}>PRO</span>

        {domainDetails?.customDomain?.domain &&
          (domainDetails?.customDomain?.isCustomVerified &&
            domainDetails?.customDomain?.isCustomVerified ? (
            <Badge
              variant=""
              className={"text-[#15803D] bg-[#DCFCE7] gap-1 items-center"}
            >
              <svg
                width="9"
                height="8"
                viewBox="0 0 9 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4.5" cy="4" r="4" fill="#22C55E" />
              </svg>
              Connected
            </Badge>
          ) : (
            <Badge
              variant=""
              className={"text-[#CA8A04] bg-[#FEFCE8] gap-1 items-center"}
            >
              <svg
                width="9"
                height="8"
                viewBox="0 0 9 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4.5" cy="4" r="4" fill="#FACC15" />
              </svg>
              Verification pending
            </Badge>
          ))}
      </div>
      <p className="text-[#4d545f] dark:text-[#B4B8C6] text-[12.8px] font-[400] leading-[22.4px] font-inter mt-2">
        Use your own domain — make your portfolio truly yours
      </p>

      {userDetails?.pro ? (
        <>
          {domainDetails?.customDomain?.domain ? (
            <div className="grid grid-cols-[120px_1fr_120px] mt-6 items-center">
              <div>
                <p className="font-medium text-[14px] text-[#4d545f] dark:text-[#B4B8C6]">
                  URL
                </p>
              </div>
              <div>
                <p className="font-medium text-[14px] text-[#FF553E]">
                  {domainDetails?.customDomain?.domain}
                </p>
              </div>
              <div className="relative flex justify-end">
                <Button
                  type="normal"
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6 cursor-pointer" />
                  }
                  onClick={() => setIsDelete(!isDelete)}
                />
              </div>
              <div>
                <p className="font-medium text-[14px] text-[#4d545f] dark:text-[#B4B8C6]">
                  Status
                </p>
              </div>
              <div className="mt-2">
                {domainDetails?.customDomain?.isCustomVerified &&
                  domainDetails?.customDomain?.isCustomVerified ? (
                  <p className="font-medium text-[14px] text-df-section-card-heading-color">
                    Website is published and optimized
                  </p>
                ) : (
                  <p className="font-medium text-[14px] text-df-section-card-heading-color">
                    Your <span className="text-[#FF553E]">DNS records</span>{" "}
                    must be set up with the following values. Once done, click
                    the <span className="text-[#FF553E]">'Verify Domain'</span>{" "}
                    button to complete the verification process
                  </p>
                )}
              </div>
              <div className="flex justify-end"></div>
              {(!domainDetails?.customDomain?.isCustomVerified ||
                !domainDetails?.customDomain?.isCustomVerified) && (
                  <>
                    <div></div>
                    <div className="col-span-2 mt-6">
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="min-w-full text-sm text-left">
                          <thead className="bg-[#F4F6FA] dark:bg-[#4d545f] text-[#202937] dark:text-[#E9EAEB] font-medium">
                            <tr>
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Value</th>
                            </tr>
                          </thead>
                          <tbody className="text-df-section-card-heading-color">
                            {domainDetails?.customDomain?.verificationData?.map(
                              (record, index) => (
                                <tr
                                  className="border-t border-gray-200"
                                  key={index}
                                >
                                  <td className="px-4 py-3">{record?.domain}</td>
                                  <td className="px-4 py-3">{record?.type}</td>
                                  <td className="px-4 py-3">{record?.value}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div></div>
                    <div className="col-span-2 mt-6">
                      <Button
                        onClick={() => {
                          setIsDomainLoading(true);
                          _verifyDomain()
                            .then((res) => {
                              fetchDomainDetails();
                            })
                            .catch((err) => {
                              toast.error(err.response.data.error);
                            })
                            .finally(() => setIsDomainLoading(false));
                        }}
                        customClass="w-full"
                        text={"Verify domain"}
                        isLoading={isDomainLoading}
                      />
                    </div>
                  </>
                )}
            </div>
          ) : (
            <div>
              <Formik
                initialValues={{
                  domain: domainDetails?.customDomain?.domain ?? "",
                }}
                validationSchema={DomainValidationSchema}
                onSubmit={(values, actions) => {
                  // Handle form submission
                  if (values.domain != 0) {
                    actions.setSubmitting(false);
                    addDomain({ customDomain: values.domain }).then((res) =>
                      fetchDomainDetails()
                    );
                  }
                }}
              >
                {({ isSubmitting, isValid, setFieldValue, values, errors }) => (
                  <Form
                    id={"domainForm"}
                    className=" w-full mt-[24px] flex items-center gap-6"
                  >
                    <div className="w-full flex-1">
                      <div className="relative">
                        <Field
                          type="text"
                          name="domain"
                          placeholder="www.site.com"
                          autoComplete="off"
                          className={`text-input`}
                          onChange={(e) => handleChange(e, setFieldValue)}
                        />
                      </div>
                      <ErrorMessage
                        name="domain"
                        component="div"
                        className="error-message text-[14px] absolute"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        text={"Add domain"}
                        form={"domainForm"}
                        isLoading={isSubmitting}
                        isDisabled={
                          isSubmitting ||
                          !isValid ||
                          values?.domain == userDetails?.username
                        }
                        btnType="submit"
                      />
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </>
      ) : (
        <div className={`mt-4 ${styles.proFeatureBox}`}>
          <div className={styles.proFeatureContent}>
            <h3 className={styles.proFeatureTitle}>
              Available on Designfolio Pro
            </h3>
            <p className={styles.proFeatureDescription}>
              Want to connect your own domain? Upgrade to Designfolio Pro and
              make your portfolio look like a real website.
            </p>
            <button
              className={styles.upgradeButton}
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade to Pro
            </button>
          </div>
          <div className={styles.proFeaturePreview}>
            <div className={styles.disabledDomainRow}>
              <input
                type="text"
                className={styles.disabledDomainInput}
                placeholder="yourdomain.com"
                disabled
              />
              <button className={styles.disabledButton} disabled>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal show={isDelete}>
        <div className="p-[24px] rounded-2xl bg-modal-bg-color  w-[400px]">
          <Text className="text-modal-heading-color">Remove domain</Text>
          <Text size="p-xsmall" className="text-df-secondary-text-color mt-2">
            Are you sure you want to remove this domain? Your visitors will no
            longer be able to find through the link.
          </Text>

          <div className="flex gap-2 mt-[26px] justify-end">
            <Button
              text={"Cancel"}
              type="secondary"
              onClick={() => setIsDelete(false)}
            />
            <Button
              text={"Delete"}
              type="tertiary"
              onClick={handleRemoveDomain}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
