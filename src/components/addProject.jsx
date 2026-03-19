import useImageCompression from '@/hooks/useImageCompression';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import EyeIcon from '../../public/assets/svgs/eye.svg';
import EyeCloseIcon from '../../public/assets/svgs/eye-close.svg';
import { Switch } from './ui/switch';
import { useGlobalContext } from '@/context/globalContext';
import { _updateUser } from '@/network/post-request';
import { usePostHogEvent } from '@/hooks/usePostHogEvent';
import { POSTHOG_EVENT_NAMES } from '@/lib/posthogEventNames';
import posthog from 'posthog-js';
import { UnsavedChangesDialog } from './ui/UnsavedChangesDialog';
import { sidebars } from '@/lib/constant';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

const FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export default function AddProject() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isPassword, setPassword] = useState(false);
  const [showEye, setShowEye] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    activeSidebar,
    closeSidebar,
    userDetails,
    updateCache,
    setUserDetails,
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
    showUnsavedWarning,
    handleConfirmDiscardSidebar,
    handleCancelDiscardSidebar,
    isSwitchingSidebar,
    pendingSidebarAction,
  } = useGlobalContext();

  const phEvent = usePostHogEvent();
  const formikRef = useRef(null);

  const isOpen = activeSidebar === sidebars.project;

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setImagePreview(null);
      setPassword(false);
      setShowEye(false);
      setLoading(false);
      if (formikRef.current) {
        formikRef.current.resetForm();
      }
    }
  }, [isOpen]);

  const hasUnsavedChanges = () => {
    if (!formikRef.current) return false;
    const values = formikRef.current.values;
    return !!(values.title || values.description || values.picture);
  };

  useEffect(() => {
    if (isOpen) {
      registerUnsavedChangesChecker(sidebars.project, hasUnsavedChanges);
    }
    return () => unregisterUnsavedChangesChecker(sidebars.project);
  }, [isOpen, registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  const validationSchema = Yup.object().shape({
    description: Yup.string()
      .max(160, 'App name must be 160 characters or less')
      .required('Description is required'),
    title: Yup.string()
      .max(80, 'Project title must be 80 characters or less')
      .required('Project title is required'),
    picture: Yup.mixed()
      .required('A file is required')
      .test(
        'fileSize',
        'File size is too large. Maximum size is 5MB.',
        value => value && value.size <= FILE_SIZE
      )
      .test(
        'fileType',
        'Unsupported file format. Only jpg, jpeg, png and gif files are allowed.',
        value => value && SUPPORTED_FORMATS.includes(value.type)
      ),
    password: isPassword
      ? Yup.string()
        .required('Password is required.')
        .min(6, 'Password is too short - should be 6 chars minimum.')
      : Yup.string().min(6, 'Password is too short - should be 6 chars minimum.'),
  });

  const { compress, compressedImage, compressionProgress } = useImageCompression();

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (!file) return;
    const isGif = file.type === 'image/gif';
    if (isGif) {
      setFieldValue('picture', file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      compress(file);
      setFieldValue('picture', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (compressionProgress === 100 && compressedImage && formikRef.current) {
      formikRef.current.setFieldValue('picture', compressedImage);
      setImagePreview(URL.createObjectURL(compressedImage));
    }
  }, [compressionProgress, compressedImage]);

  const resetStateAndClose = () => {
    setImagePreview(null);
    setPassword(false);
    setShowEye(false);
    closeSidebar(true);
  };

  return (
    <>
      <Formik
          innerRef={formikRef}
          initialValues={{
            description: '',
            title: '',
            picture: null,
            password: '',
          }}
          validateOnChange
          validateOnBlur
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            setLoading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Image = reader.result;
              const payload = {
                projects: [
                  ...userDetails?.projects,
                  {
                    thumbnail: {
                      key: base64Image,
                      originalName: values.picture.name,
                      extension: values.picture.type,
                    },
                    description: values.description,
                    title: values.title,
                    client: values.client,
                    industry: values.industry,
                    role: values.role,
                    platform: values.platform,
                    password: values.password,
                    protected: isPassword,
                    contentVersion: 2,
                    tiptapContent: {
                      type: 'doc',
                      content: [],
                    },
                  },
                ],
              };
              _updateUser(payload)
                .then(res => {
                  setUserDetails(res?.data?.user);
                  updateCache('userDetails', res?.data?.user);
                  phEvent(POSTHOG_EVENT_NAMES.PROJECT_ADDED, {
                    project_title: values.title,
                    industry: values.industry || null,
                    client: values.client || null,
                    role: values.role || null,
                    has_password: isPassword,
                  });
                  posthog.people.set({
                    project_count: res.data.user.projects.length,
                  });
                  resetStateAndClose();
                })
                .finally(() => setLoading(false));
            };
            reader.readAsDataURL(values.picture);
            actions.setSubmitting(false);
          }}
        >
          {({ setFieldValue, values, validateField, errors, touched }) => (
            <Form id="projectForm" autoComplete="off" className="flex flex-col h-full">
              <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
                {/* Project title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-[13px] font-medium text-foreground ml-1">
                      Project title <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs text-foreground/40">{values.title.length}/80</span>
                  </div>
                  <Field name="title">
                    {({ field }) => (
                      <Input
                        {...field}
                        id="title"
                        type="text"
                        autoComplete="off"
                        placeholder="Eg: Designing an onboarding for 1M users"
                        className={errors.title && touched.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="title" component="div" className="error-message" />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-[13px] font-medium text-foreground ml-1">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs text-foreground/40">{values.description.length}/160</span>
                  </div>
                  <Field name="description">
                    {({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        rows={3}
                        autoComplete="off"
                        placeholder="Short description of the project"
                        className={`resize-none ${errors.description && touched.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="description" component="div" className="error-message" />
                </div>

                {/* Cover image */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-foreground ml-1">
                    Cover image <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <label htmlFor="picture" className="cursor-pointer shrink-0">
                      <div className="w-24 h-16 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-border flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            className="w-full h-full object-cover"
                            alt="project cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-foreground/30" />
                        )}
                      </div>
                    </label>
                    <label htmlFor="picture">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="rounded-full"
                      >
                        {imagePreview ? 'Change image' : 'Upload image'}
                      </Button>
                    </label>
                  </div>
                  <input
                    id="picture"
                    name="picture"
                    type="file"
                    hidden
                    onChange={event => handleImageChange(event, setFieldValue)}
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                  />
                  <ErrorMessage name="picture" component="div" className="error-message" />
                </div>

                {/* Password protection */}
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-medium text-foreground ml-1">Protect Project</p>
                      <p className="text-[12px] text-muted-foreground ml-1">
                        Require a password to view this project (e.g., for NDAs).
                      </p>
                    </div>
                    <Switch
                      checked={isPassword}
                      onCheckedChange={checked => setPassword(checked)}
                      className="data-[state=unchecked]:bg-input"
                    />
                  </div>
                  <AnimatePresence>
                    {isPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="relative px-1">
                          <Field name="password">
                            {({ field }) => (
                              <Input
                                {...field}
                                id="password"
                                type={showEye ? 'text' : 'password'}
                                placeholder="Password"
                                autoComplete="new-password"
                                className={errors.password && touched.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                              />
                            )}
                          </Field>
                          <div
                            className="absolute top-[10px] right-4 cursor-pointer"
                            onClick={() => {
                              setShowEye(prev => !prev);
                              validateField('password');
                            }}
                          >
                            {showEye ? (
                              <EyeIcon className="text-df-icon-color" />
                            ) : (
                              <EyeCloseIcon className="text-df-icon-color" />
                            )}
                          </div>
                        </div>
                        <ErrorMessage name="password" component="div" className="error-message" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex gap-2 py-3 px-6 border-t border-border justify-end flex-shrink-0 bg-sidebar">
                <Button variant="outline" type="button" onClick={() => closeSidebar()}>
                  Cancel
                </Button>
                <Button type="submit" form="projectForm" disabled={loading}>
                  {loading ? 'Saving…' : 'Save case study'}
                </Button>
              </div>
            </Form>
          )}
      </Formik>

      <UnsavedChangesDialog
        open={
          showUnsavedWarning &&
          isOpen &&
          !isSwitchingSidebar &&
          pendingSidebarAction?.type === 'close'
        }
        onOpenChange={open => {
          if (!open) handleCancelDiscardSidebar();
        }}
        onConfirmDiscard={() => {
          handleConfirmDiscardSidebar();
          resetStateAndClose();
        }}
        title="Unsaved Changes"
        description="You have unsaved changes to your project. Are you sure you want to discard them?"
      />
    </>
  );
}
