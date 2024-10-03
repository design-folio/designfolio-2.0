import React, { useState } from "react";
import { useRouter } from "next/router";
import { _deleteUser } from "@/network/post-request";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/globalContext";
import Button from "./button";
import Modal from "./modal";
import CloseIcon from "../../public/assets/svgs/close.svg";

export default function DeleteAccount() {
  const router = useRouter();
  const { setUserDetails } = useGlobalContext();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleDeleteAccount = () => {
    console.log("asdasd");
    setLoading(true);
    setText("");
    _deleteUser().then(() => {
      toast.success("Account deleted successfully");
      Cookies.remove("df-token");
      setUserDetails(null);
      setLoading(false);
      router.push("/");
    });
  };
  return (
    <div>
      <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
        Danger zone
      </p>
      <p className="text-[#4d545f] dark:text-[#B4B8C6] text-[12.8px] font-[400] leading-[22.4px] font-inter mt-2">
        Delete your account and account data. This can&apos;t be undone.
      </p>

      <Button
        type="tertiary"
        text="Delete account"
        customClass="mt-[24px]"
        onClick={() => setShowModal(true)}
      />
      <Modal show={showModal}>
        <div className="rounded-2xl bg-modal-bg-color m-auto max-w-[375px] md:max-w-[500px]">
          <div className="flex justify-between items-center p-5">
            <p className="text-[18px] md:text-[25px] text-df-section-card-heading-color font-[500]">
              Delete Account
            </p>
            <Button
              // customClass="lg:hidden"
              type="secondary"
              customClass="!p-2 rounded-[8px]"
              icon={<CloseIcon className="text-icon-color" />}
              onClick={() => setShowModal(false)}
            />
          </div>
          <div>
            <div className="px-5">
              <p className="text-df-secondary-text-color !font-inter">
                This action <b>CANNOT</b> be undone. This will permanently
                delete everything associated with this account, from your
                published website to the content in draft<b>—EVERYTHING</b>.
              </p>
              <p className="mt-3 text-df-secondary-text-color !font-inter font-[500]">
                Please type DELETE to confirm
              </p>
              <input
                name="name"
                type="text"
                className="text-input mt-2"
                autoComplete="off"
                onChange={(e) => setText(e?.target?.value)}
              />
            </div>
            <div className="flex gap-2 py-3 bg-modal-footer-bg-color justify-end px-3 rounded-bl-2xl rounded-br-2xl mt-5">
              <Button
                text="Cancel"
                type="secondary"
                onClick={() => setShowModal(false)}
              />
              <Button
                btnType="submit"
                text={"Delete account"}
                form="tools"
                isLoading={loading}
                isDisabled={text != "DELETE"}
                type="tertiary"
                onClick={handleDeleteAccount}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
