import React from "react";
import { motion } from "framer-motion";

export default function ForgotPasswordPlaceHolder({ email }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="text-center"
        >
            <div className="mb-8">
                <img
                    src="/assets/svgs/email-sent.svg"
                    className="w-32 h-32 mx-auto mb-6"
                    alt="Email sent"
                />
                <h1 className="font-semibold text-2xl mb-2 text-foreground">
                    Check your inbox!
                </h1>
                <p className="text-sm text-foreground/60 leading-6">
                    We have sent an email to{" "}
                    <span style={{ color: "#FF553E" }}>{email}</span>{" "}
                    please follow the instructions to reset your password
                </p>
            </div>
        </motion.div>
    );
}