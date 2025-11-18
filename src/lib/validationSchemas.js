import * as Yup from "yup";

export const RoleValidationSchema = Yup.object().shape({
    selectedRole: Yup.string().required("Please select a role."),
    customRole: Yup.string().when("selectedRole", {
        is: "Others",
        then: (schema) =>
            schema
                .trim()
                .min(2, "Role name must be at least 2 characters.")
                .max(40, "Role name too long.")
                .required("Please enter your custom role."),
    }),
});

export const GoalValidationSchema = Yup.object().shape({
    selectedGoalId: Yup.number()
        .typeError("Please select your goal.")
        .required("Please select your goal."),
});

export const ExperienceValidationSchema = Yup.object().shape({
    selectedExperienceId: Yup.number()
        .typeError("Please select your experience level.")
        .required("Please select your experience level."),
});

export const SkillsValidationSchema = Yup.object().shape({
    selectedInterests: Yup.array()
        .of(Yup.string().trim())
        .min(3, "Please select at least 3 skills or strengths.")
        .required("Please select at least 3 skills or strengths."),
});


export const DomainValidationSchema = Yup.object().shape({
    domain: Yup.string()
        .matches(
            /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9](?:\.[a-z]{2,})?$/,
            "Invalid subdomain"
        )
        .required("Domain is required"),
});