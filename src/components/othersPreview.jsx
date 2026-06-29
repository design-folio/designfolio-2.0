import React from "react";

import Button from "./button";
import InstagramIcon from "../../public/assets/svgs/instagram.svg";
import TwitterIcon from "../../public/assets/svgs/twitter.svg";
import LinkedInIcon from "../../public/assets/svgs/linkedin.svg";
import DribbbleIcon from "../../public/assets/svgs/dribbble.svg";
import NotionIcon from "../../public/assets/svgs/noteIcon.svg";
import MediumIcon from "../../public/assets/svgs/medium.svg";
import Text from "./text";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OthersPreview({ userDetails }) {
  return (
    <>
      <div
        className={cn(
          "bg-df-section-card-bg-color shadow-df-section-card-shadow flex flex-col gap-8 rounded-[24px] p-4 break-words lg:p-[32px]"
        )}
      >
        {(!!userDetails?.socials?.instagram ||
          !!userDetails?.socials?.twitter ||
          !!userDetails?.socials?.linkedin) && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Text size="p-small" className="text-modal-heading-color font-semibold">
                Connect with me
              </Text>
            </div>
            <div className="flex flex-col gap-[24px] lg:flex-row">
              {userDetails?.socials?.instagram && (
                <Link
                  href={userDetails?.socials?.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    text={"Instagram"}
                    type="secondary"
                    icon={<InstagramIcon className="text-df-icon-color cursor-pointer" />}
                  />
                </Link>
              )}

              {userDetails?.socials?.twitter && (
                <Link
                  href={userDetails?.socials?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    text={"Twitter"}
                    type="secondary"
                    icon={<TwitterIcon className="text-df-icon-color cursor-pointer" />}
                  />
                </Link>
              )}
              {userDetails?.socials?.linkedin && (
                <Link
                  href={userDetails?.socials?.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    text={"LinkedIn"}
                    type="secondary"
                    icon={<LinkedInIcon className="text-df-icon-color cursor-pointer" />}
                  />
                </Link>
              )}
            </div>
          </div>
        )}

        {(!!userDetails?.portfolios?.dribbble ||
          !!userDetails?.portfolios?.notion ||
          !!userDetails?.portfolios?.medium) && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Text size="p-small" className="text-modal-heading-color font-semibold">
                Other portfolio
              </Text>
            </div>
            <div>
              <div className="flex flex-col gap-[24px] lg:flex-row">
                {userDetails?.portfolios?.dribbble && (
                  <Link
                    href={userDetails?.portfolios?.dribbble}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      text={"Dribbble"}
                      type="secondary"
                      icon={<DribbbleIcon className="text-df-icon-color cursor-pointer" />}
                    />
                  </Link>
                )}
                {userDetails?.portfolios?.notion && (
                  <Link
                    href={userDetails?.portfolios?.notion}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      text={"Notion"}
                      type="secondary"
                      icon={<NotionIcon className="text-df-icon-color cursor-pointer" />}
                    />
                  </Link>
                )}
                {userDetails?.portfolios?.medium && (
                  <Link
                    href={userDetails?.portfolios?.medium}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      text={"Medium"}
                      type="secondary"
                      icon={<MediumIcon className="text-df-icon-color cursor-pointer" />}
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
