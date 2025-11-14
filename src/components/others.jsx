import React from "react";
import { Button as ButtonNew } from "./ui/buttonNew"
import Button from "./button";
import EditIcon from "../../public/assets/svgs/edit.svg";
import NoteIcon from "../../public/assets/svgs/noteIcon.svg";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import ResumeIcon from "../../public/assets/svgs/resume.svg";
import InstagramIcon from "../../public/assets/svgs/instagram.svg";
import TwitterIcon from "../../public/assets/svgs/twitter.svg";
import LinkedInIcon from "../../public/assets/svgs/linkedin.svg";
import PuzzleIcon from "../../public/assets/svgs/puzzle.svg";
import DribbbleIcon from "../../public/assets/svgs/dribbble.svg";
import BehanceIcon from "../../public/assets/svgs/behance.svg";
import NotionIcon from "../../public/assets/svgs/noteIcon.svg";
import MediumIcon from "../../public/assets/svgs/medium.svg";
import OthersIcon from "../../public/assets/svgs/others.svg";
import Text from "./text";
import { modals } from "@/lib/constant";
import AddItem from "./addItem";
import Link from "next/link";
import { PencilIcon } from "lucide-react";

export default function Others({ openModal, userDetails, edit }) {
  const { resume } = userDetails || {};
  return (
    <div
      className={` flex flex-col gap-8 bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words`}
    >
      {(!!resume || edit) && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text
              size="p-small"
              className="text-modal-heading-color font-semibold"
            >
              Resume
            </Text>
            <ButtonNew
              className="h-11 w-11"
              onClick={() => openModal(modals.resume)}
              variant={"secondary"}
            ><PencilIcon className="text-df-icon-color cursor-pointer" /></ButtonNew>
          </div>

          {edit && !!userDetails?.resume ? (
            <a href={userDetails?.resume?.url} download={true} target="_blank">
              <Button
                text={"Download Resume"}
                customClass="w-full justify-start"
                type="secondary"
                icon={
                  <NoteIcon className="text-df-icon-color cursor-pointer" />
                }
              />
            </a>
          ) : (
            edit && (
              <AddItem
                title="Add your resume"
                iconLeft={<ResumeIcon className="text-df-icon-color" />}
                onClick={() => openModal(modals.resume)}
                iconRight={
                  <Button
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                    }
                  />
                }
              />
            )
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          {(!!userDetails?.socials?.instagram ||
            !!userDetails?.socials?.twitter ||
            !!userDetails?.socials?.linkedin ||
            edit) && (
              <Text
                size="p-small"
                className="text-modal-heading-color font-semibold"
              >
                Connect with me
              </Text>
            )}
          {edit &&
            (userDetails?.socials?.instagram ||
              userDetails?.socials?.twitter ||
              userDetails?.socials?.linkedin) && (
              <Button
                onClick={() => openModal(modals.socialMedia)}
                type={"secondary"}
                icon={
                  <EditIcon className="text-df-icon-color cursor-pointer" />
                }
              />
            )}
        </div>
        <div>
          {!!userDetails?.socials?.instagram ||
            !!userDetails?.socials?.twitter ||
            !!userDetails?.socials?.linkedin ? (
            <div className="flex flex-col lg:flex-row gap-[24px]">
              {userDetails?.socials?.instagram && (
                <Link
                  href={userDetails?.socials?.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    text={"Instagram"}
                    type="secondary"
                    icon={
                      <InstagramIcon className="text-df-icon-color cursor-pointer" />
                    }
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
                    icon={
                      <TwitterIcon className="text-df-icon-color cursor-pointer" />
                    }
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
                    icon={
                      <LinkedInIcon className="text-df-icon-color cursor-pointer" />
                    }
                  />
                </Link>
              )}
            </div>
          ) : (
            edit && (
              <AddItem
                title="Add your social media"
                onClick={() => openModal(modals.socialMedia)}
                iconLeft={<PuzzleIcon className="text-df-icon-color" />}
                iconRight={
                  <Button
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                    }
                  />
                }
              />
            )
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          {(!!userDetails?.portfolios?.dribbble ||
            !!userDetails?.portfolios?.notion ||
            !!userDetails?.portfolios?.behance ||
            !!userDetails?.portfolios?.medium ||
            edit) && (
              <Text
                size="p-small"
                className="text-modal-heading-color font-semibold"
              >
                Other portfolio
              </Text>
            )}
          {edit &&
            (userDetails?.portfolios?.dribbble ||
              userDetails?.portfolios?.notion ||
              userDetails?.portfolios?.behance ||
              userDetails?.portfolios?.medium) && (
              <Button
                onClick={() => openModal(modals.portfolioLinks)}
                type={"secondary"}
                icon={
                  <EditIcon className="text-df-icon-color cursor-pointer" />
                }
              />
            )}
        </div>
        <div>
          {!!userDetails?.portfolios?.dribbble ||
            !!userDetails?.portfolios?.notion ||
            !!userDetails?.portfolios?.behance ||
            !!userDetails?.portfolios?.medium ? (
            <div className="flex flex-col lg:flex-row gap-[24px]">
              {userDetails?.portfolios?.dribbble && (
                <Link
                  href={userDetails?.portfolios?.dribbble}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    text={"Dribbble"}
                    type="secondary"
                    icon={
                      <DribbbleIcon className="text-df-icon-color cursor-pointer" />
                    }
                  />
                </Link>
              )}
              {userDetails?.portfolios?.behance && (
                <Link
                  href={userDetails?.portfolios?.behance}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    text={"Behance"}
                    type="secondary"
                    icon={
                      <BehanceIcon className="text-df-icon-color cursor-pointer" />
                    }
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
                    icon={
                      <NotionIcon className="text-df-icon-color cursor-pointer" />
                    }
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
                    icon={
                      <MediumIcon className="text-df-icon-color cursor-pointer" />
                    }
                  />
                </Link>
              )}
            </div>
          ) : (
            edit && (
              <AddItem
                title="Add your portfolio links"
                onClick={() => openModal("portfolio-links")}
                iconLeft={<OthersIcon className="text-df-icon-color" />}
                iconRight={
                  <Button
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                    }
                  />
                }
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
