export const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1, // Children animations start at the same time but staggered
            type: "spring",
        },
    },
};

export const itemVariants = {
    hidden: { y: 50, opacity: 0 }, // Starting position of children below their final position with fade
    visible: {
        y: 0, // Final position of children
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 180, // Smoothness adjusted
            damping: 15, // Controlled bounciness
            duration: 0.4, // Duration of each child's animation
        },
    },
};

