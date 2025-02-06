import { useGlobalContext } from "@/context/globalContext";
import { _getTools } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import Button from "./button";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import SelectField from "./SelectField";
import ToolCheckbox from "./ToolCheckbox";
import { useTheme } from "next-themes";

const StepOneValidationSchema = Yup.object().shape({
  selectedTools: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required(),
        value: Yup.string().required(),
      })
    )
    .min(3, "Please select at least three tools"),
});

export default function AddTools() {
  const { closeModal, userDetails, updateCache } = useGlobalContext();
  const [tools, setTools] = useState([]);
  const [toolsOptions, setToolsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [initialValues, setInitialValues] = useState({
    selectedTools: userDetails?.tools ?? [],
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await _getTools();
        setToolsOptions(response.data.tools);
        setTools(response.data.tools);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTools();
  }, []);

  const handleSubmit = (values, actions) => {
    setLoading(true);
    const payload = {
      tools: values.selectedTools,
    };
    _updateUser(payload)
      .then((res) => {
        updateCache("userDetails", res?.data?.user);
        closeModal();
        actions.setSubmitting(false);
      })
      .catch((err) => actions.setSubmitting(false))
      .finally(() => setLoading(false));
  };

  if (tools?.length == 0) {
    return true;
  }

  return (
    <div className="bg-modal-bg-color rounded-2xl w-[95%] m-auto lg:w-[600px] overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text className="text-modal-heading-color">Add your tools</Text>
        <Button
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-df-icon-color cursor-pointer" />}
          onClick={closeModal}
        />
      </div>
      <div>
        <Formik
          initialValues={{
            selectedTools: userDetails?.tools ?? [],
          }}
          validationSchema={StepOneValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <Form id="tools" onSubmit={handleSubmit}>
              <div className="px-5 h-[370px] overflow-auto pb-10">
                <Text size={"p-xxsmall"} className="mb-2" required>
                  Choose the tools you work with
                </Text>
                <SelectField
                  name="selectedTools"
                  options={toolsOptions}
                  theme={theme}
                />
                <ErrorMessage
                  name="selectedTools"
                  component="div"
                  className="error-message text-[14px]"
                />
                <div className="flex flex-wrap gap-4 mt-4">
                  {toolsOptions.map((tool) => (
                    <Field
                      key={tool.value}
                      name="selectedTools"
                      render={({ field, form }) => (
                        <ToolCheckbox
                          tool={tool}
                          field={field}
                          form={form}
                          theme={theme}
                        />
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2  justify-end p-3 bg-modal-footer-bg-color rounded-br-[24px] rounded-bl-[24px]">
                <Button text="Cancel" type="secondary" onClick={closeModal} />
                <Button
                  btnType="submit"
                  onClick={handleSubmit}
                  text={"Save"}
                  form="tools"
                  isLoading={loading}
                  type="modal"
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
