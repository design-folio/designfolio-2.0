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
    <div className=" rounded-2xl bg-white custom-width lg:min-w-[500px]">
      <div className=" p-5">
        <p className="text-[18px] md:text-[25px] text-[#202937] font-[500]">
          Claim your unique website
        </p>
        <Text size="p-xxsmall" className="mt-2">
          Username currently unavailable. Please choose a different username.
        </Text>
      </div>
      <div className="pb-10">
        <ClaimDomain
          className="xl:!w-[100%] !p-5"
          onClaimWebsite={onClaimWebsite}
        />
      </div>
    </div>
  );
}
