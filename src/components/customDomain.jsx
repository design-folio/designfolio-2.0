import { useGlobalContext } from "@/context/globalContext";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Button from "./button";

import { Badge } from "./ui/badge";
import DotIcon from "../../public/assets/svgs/dots.svg";
import RefreshIcon from "../../public/assets/svgs/refresh.svg";
import { addDomain } from "@/network/post-request";
import Modal from "./modal";
import Text from "./text";
const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(
      /^(?=.{1,253}$)((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/,
      "Invalid domain"
    )
    .required("Domain is required"),
});

export default function CustomDomain({ domainDetails }) {
  const { userDetails, setUserDetails } = useGlobalContext();
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [domainValue, setDomainValue] = useState(null);
  // Formik handleChange function with API call
  const handleChange = (e, setFieldValue) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
          Custom domain
        </p>
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
      </div>
      <p className="text-[#4d545f] dark:text-[#B4B8C6] text-[12.8px] font-[400] leading-[22.4px] font-inter mt-2">
        Connect a custom domain purchased through web hosting service
      </p>
      {domainDetails?.customDomain?.domain || domainValue ? (
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
              type="secondary"
              icon={
                <DotIcon className="stroke-bg-df-icon-color cursor-pointer" />
              }
              onClick={() => setIsEdit(!isEdit)}
            />
            <div
              className={`pt-2 origin-top-right top-[42px] absolute z-20 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
                isEdit
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div className="w-[240px]  bg-popover-bg-color rounded-2xl shadow-lg border-[2px] border-popover-border-color p-2">
                <button
                  className="p-2 w-full text-left"
                  onClick={() => setIsDelete(!isDelete)}
                >
                  Remove Domain
                </button>
                <button className="p-2 w-full text-left">
                  Refresh Domain Status
                </button>
              </div>
            </div>
          </div>
          <div>
            <p className="font-medium text-[14px] text-[#4d545f] dark:text-[#B4B8C6]">
              Status
            </p>
          </div>
          <div className="mt-2">
            <p className="font-medium text-[14px] text-df-section-card-heading-color">
              Your <span className="text-[#FF553E]">DNS records</span> must be
              set up with the following values. Your domain provider supports
              auto-configuration. Click on Auto Connect below to automatically
              ste the records.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              type="secondary"
              icon={
                <RefreshIcon className="stroke-bg-df-icon-color cursor-pointer" />
              }
            />
          </div>
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
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">@</td>
                    <td className="px-4 py-3">A</td>
                    <td className="px-4 py-3">31.43.160.6</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">@</td>
                    <td className="px-4 py-3">A</td>
                    <td className="px-4 py-3">31.43.160.6</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">@</td>
                    <td className="px-4 py-3">A</td>
                    <td className="px-4 py-3">31.43.160.6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
                console.log(values.domain);
                addDomain({ customDomain: values.domain }).then((res) =>
                  setDomainValue(values.domain)
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
                    text={"Update domain"}
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
            <Button text={"Delete"} type="tertiary" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
