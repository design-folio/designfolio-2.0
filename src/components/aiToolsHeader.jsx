import React from "react";
import Logo from "../../public/assets/svgs/logo.svg";
import { popovers } from "@/lib/constant";
import { useGlobalContext } from "@/context/globalContext";
import Button from "./button";
import HamburgerIcon from "../../public/assets/svgs/hamburger.svg";
import Popover from "./popover";
import Link from "next/link";
import Wallet from "../../public/assets/svgs/walletTool.svg";
import EmailIcon from "../../public/assets/svgs/email.svg";

export default function AiToolsHeader() {
  const { popoverMenu, setPopoverMenu } = useGlobalContext();

  return (
    <header className=" lg:hidden bg-landing-bg-color p-3">
      <div className="flex justify-between">
        <Logo className="text-df-icon-color" />
        <Button
          customClass="md:hidden"
          type="secondary"
          icon={
            <>
              <HamburgerIcon
                className={`mb-[4.67px] transition-transform easeInOut ${
                  popovers.landingMenu === popoverMenu &&
                  "translate-y-3.2 rotate-45"
                } cursor-pointer`}
              />
              <HamburgerIcon
                className={`transition-transform easeInOut ${
                  popovers.landingMenu === popoverMenu &&
                  "-rotate-45 -translate-y-3.2"
                } cursor-pointer`}
              />
            </>
          }
          onClick={() =>
            setPopoverMenu((prev) =>
              prev == popovers.landingMenu ? null : popovers.landingMenu
            )
          }
        />
        <Popover
          show={popovers.landingMenu === popoverMenu}
          className="right-[4px] mt-2"
        >
          <Link href={"/ai-tools?type=salary-negotiator"}>
            <Button
              customClass="w-full"
              text="Salary negotiator"
              type="secondary"
              icon={<Wallet />}
            />
          </Link>
          <Link href={"/ai-tools?type=email-generator"}>
            <Button
              customClass="w-full mt-4"
              text="Email Generator"
              type="secondary"
              icon={<EmailIcon />}
            />
          </Link>
        </Popover>
      </div>
    </header>
  );
}
