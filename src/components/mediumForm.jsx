import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "./button";
import AnalyzeCaseStudyTruncated from "./analyzeCaseStudyTruncated";
import React, { useEffect, useState } from "react";
import { _analyzeCaseStudyMedium } from "@/network/post-request";


// Validation schema to ensure only Medium links are accepted
const validationSchema = Yup.object({
  medium: Yup.string()
    .matches(
      /^https:\/\/medium\.com\/.+/,
      "Please enter a valid Medium link (e.g., https://medium.com/@username/post)"
    )
    .required("Medium link is required"),
});


const MediumForm = ({ initialMedium = "", isMediumFetched,setIsMediumFetched, setSuggestions,setRating,isAnalyzing}) => (

    
    <div>

  <Formik
    initialValues={{ medium: initialMedium }}
    validationSchema={validationSchema}
    onSubmit={(values, actions) => {
      const payload = {mediumPostURL: values.medium };
      console.log(payload)
      _analyzeCaseStudyMedium(payload)
        .then((res) => {
            let suggestion = res.data.singlePost.analysisReport.response
            let rating = res.data.singlePost.analysisReport.rating
            setSuggestions(suggestion)
            setRating(rating)
            setIsMediumFetched(true)
            actions.setSubmitting(false)
        })
        .catch(() => actions.setSubmitting(false));
    }}
  >
    {({ isSubmitting, errors, touched }) => (
      <Form id="mediumForm">
        <div className="px-5 pb-10">
          <div>
            <label htmlFor="medium" className="font-medium">
              Medium Link
            </label>
            <Field
              id="medium"
              name="medium"
              type="text"
              className={`text-input mt-2 ${
                errors.medium && touched.medium
                  ? "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  : ""
              }`}
              autoComplete="off"
            />
            <ErrorMessage name="medium" component="div" className="error-message" />
          </div>
        </div>
                <Button
                  btnType="submit"
                  isLoading={isSubmitting}
                  form="mediumForm"
                  text={"Save"}
                  type="modal"
                  customClass="ml-4"
                />
      </Form>
    )}
  </Formik>
  </div>

);

export default MediumForm;
