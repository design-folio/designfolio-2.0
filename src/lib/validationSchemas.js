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




export const ReviewValidationSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, "Person name must be 100 characters or less")
    .required("Person name is required"),
  company: Yup.string()
    .max(100, "Company name must be 100 characters or less")
    .required("Company Name is required"),
  description: Yup.mixed()
    .test('is-valid-content', 'Description is required', (value) => {
      // Accept JSON objects or non-empty strings
      if (!value) return false;
      if (typeof value === 'object' && value !== null && value.type === 'doc') return true;
      if (typeof value === 'string' && value.trim() !== '') return true;
      return false;
    }),
  linkedinLink: Yup.string()
    .url("Please enter a valid URL")
    .matches(/(linkedin.com)/, "Invalid LinkedIn Link"),
});



export const WorkValidationSchema = Yup.object().shape({
  role: Yup.string()
    .max(50, "Role must be 50 characters or less")
    .required("Role is required"),
  company: Yup.string()
    .max(150, "Company name must be 150 characters or less")
    .required("Company Name is required"),
  description: Yup.mixed()
    .test('is-valid-content', 'Description is required', (value) => {
      // Accept JSON objects or non-empty strings
      if (!value) return false;
      if (typeof value === 'object' && value !== null && value.type === 'doc') return true;
      if (typeof value === 'string' && value.trim() !== '') return true;
      return false;
    }),
  startMonth: Yup.string().required("Month is required"),
  startYear: Yup.string().required("Year is required"),
  currentlyWorking: Yup.boolean(),
  // Initially, do not make endMonth and endYear required
  endMonth: Yup.string(),
  endYear: Yup.string().test(
    "endDate-test",
    "End year must be greater than or equal to start year",
    function (endYear) {
      const { startYear, currentlyWorking } = this.parent;
      if (currentlyWorking) {
        return true; // Skip validation if currently working or endMonth/endYear is not provided
      }

      return +startYear <= +endYear;
    }
  ),
});




export const FooterValidationSchema = Yup.object().shape({
  contact_email: Yup.string()
    .nullable()
    .notRequired()
    .test("email-or-empty", "Invalid contact email", (value) => {
      if (!value || value.trim() === "") return true;
      return Yup.string().email().isValidSync(value);
    }),
  phone: Yup.string()
    .nullable()
    .notRequired()
    .matches(
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
      "Invalid phone number format"
    ),
  linkedin: Yup.string()
    .nullable()
    .notRequired()
    .test("url-or-empty", "Invalid LinkedIn URL", (value) => {
      if (!value || value.trim() === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .test("linkedin-domain", "Invalid LinkedIn link", (value) => {
      if (!value || value.trim() === "") return true;
      return value.includes("linkedin.com");
    }),
  x: Yup.string()
    .nullable()
    .notRequired()
    .test("url-or-empty", "Invalid X/Twitter URL", (value) => {
      if (!value || value.trim() === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .test("x-domain", "Invalid X/Twitter link", (value) => {
      if (!value || value.trim() === "") return true;
      return value.includes("x.com") || value.includes("twitter.com");
    }),
  instagram: Yup.string()
    .nullable()
    .notRequired()
    .test("url-or-empty", "Invalid Instagram URL", (value) => {
      if (!value || value.trim() === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .test("instagram-domain", "Invalid Instagram link", (value) => {
      if (!value || value.trim() === "") return true;
      return value.includes("instagram.com");
    }),
  blogs: Yup.string()
    .nullable()
    .notRequired()
    .test("url-or-empty", "Invalid Medium URL", (value) => {
      if (!value || value.trim() === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .test("medium-domain", "Invalid Medium link", (value) => {
      if (!value || value.trim() === "") return true;
      return value.includes("medium.com");
    }),
  dribbble: Yup.string()
    .nullable()
    .notRequired()
    .test("url-or-empty", "Invalid Dribbble URL", (value) => {
      if (!value || value.trim() === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .test("dribbble-domain", "Invalid Dribbble link", (value) => {
      if (!value || value.trim() === "") return true;
      return value.includes("dribbble.com");
    }),
});