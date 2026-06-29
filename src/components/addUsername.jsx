import { useGlobalContext } from "@/context/globalContext";
import { _updateUsername } from "@/network/post-request";
import { toast } from "react-toastify";
import Text from "./text";
import ClaimDomain from "./claimDomain-old";

export default function AddUsername() {
  const { closeModal, setUserDetails } = useGlobalContext();
  const onClaimWebsite = (values) => {
    _updateUsername({ username: values.domain }).then(() => {
      closeModal();
      setUserDetails((prev) => ({ ...prev, username: values.domain }));
      toast.success("Website claimed successfully.");
    });
  };
  return (
    <div className="custom-width rounded-2xl bg-white lg:min-w-[500px]">
      <div className="p-5">
        <p className="text-[18px] font-[500] text-[#202937] md:text-[25px]">
          Claim your unique website
        </p>
        <Text size="p-xxsmall" className="mt-2">
          Username currently unavailable. Please choose a different username.
        </Text>
      </div>
      <div className="pb-10">
        <ClaimDomain className="!p-5 xl:!w-[100%]" onClaimWebsite={onClaimWebsite} />
      </div>
    </div>
  );
}
