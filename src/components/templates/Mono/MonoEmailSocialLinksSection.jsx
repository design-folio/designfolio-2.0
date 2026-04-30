import { Button } from '@/components/ui/button'
import { useGlobalContext } from '@/context/globalContext'
import { itemVariants } from '@/lib/animationVariants'
import { sidebars } from '@/lib/constant'
import { motion } from 'framer-motion'
import { AtSignIcon, DribbbleIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from 'lucide-animated'
import BehanceIcon from '../../../../public/assets/svgs/behance.svg'
import MediumIcon from '../../../../public/assets/svgs/medium.svg'

import { Pencil } from 'lucide-react'
import { useRef } from 'react'

const localSocialLinks = [
    { key: 'instagram', Icon: InstagramIcon, label: 'Instagram', from: 'socials', size: 18 },
    { key: 'linkedin', Icon: LinkedinIcon, label: 'LinkedIn', from: 'socials', size: 18 },
    { key: 'twitter', Icon: TwitterIcon, label: 'X / Twitter', from: 'socials', size: 18 },
    { key: 'behance', Icon: BehanceIcon, label: 'Behance', from: 'portfolios', size: 18 },
    { key: 'dribbble', Icon: DribbbleIcon, label: 'Dribbble', from: 'portfolios', size: 18 },
    { key: 'medium', Icon: MediumIcon, label: 'Medium', from: 'portfolios', size: 18 },
]

export const MonoEmailSocialLinksSection = ({ email, socials, portfolios, isEditing }) => {
    const atSignRef = useRef(null);
    const {
        openSidebar,
    } = useGlobalContext();

    const activeSocials = localSocialLinks.filter(({ key, from }) =>
        from === 'socials' ? socials?.[key] : portfolios?.[key]
    );

    return (
        <>
            <motion.div
                variants={itemVariants}
                className="custom-dashed-t"
            ></motion.div>

            <motion.div
                variants={itemVariants}
                className="px-5 md:px-8 py-4 flex justify-between items-center relative group/section gap-4"
            >
                {isEditing && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSidebar?.(sidebars.footer)}
                            className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                    </div>
                )}
                <a
                    href={email ? `mailto:${email}` : "#"}
                    className="flex items-center gap-2 text-base text-[#666666] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group min-w-0"
                    onMouseEnter={() => atSignRef.current?.startAnimation()}
                    onMouseLeave={() => atSignRef.current?.stopAnimation()}
                    onClick={(e) => {
                        if (!email) e.preventDefault();
                    }}
                >
                    <AtSignIcon
                        ref={atSignRef}
                        size={18}
                        className="transition-colors shrink-0"
                    />
                    <span className="truncate">{email || "No email set"}</span>
                </a>
                {activeSocials.length > 0 && (
                    <div className="flex items-center gap-5 text-[#1A1A1A] dark:text-[#F0EDE7] shrink-0">
                        {activeSocials.map(({ key, from, Icon, label, size }) => {
                            const href =
                                from === 'socials' ? socials?.[key] : portfolios?.[key];
                            return (
                                <a
                                    key={key}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-70 transition-opacity inline-flex shrink-0 items-center justify-center"
                                    aria-label={label}
                                >
                                    <span
                                        className="inline-flex shrink-0 overflow-visible [&>svg]:!h-full [&>svg]:!w-full"
                                        style={{ width: `${size}px`, height: `${size}px` }}
                                    >
                                        <Icon
                                            size={size}
                                            height={size}
                                            width={size}
                                            className="block overflow-visible"
                                        />
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            <motion.div variants={itemVariants} className="custom-dashed-t"></motion.div>
        </>
    )
}
