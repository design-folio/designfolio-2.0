import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Square, X, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import MacOSProjectToolbar from './MacOSProjectToolbar';
import { useRouter } from 'next/router';
import { useIsMobile } from '@/hooks/use-mobile';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { popovers } from '@/lib/constant';
import { _updateProject } from '@/network/post-request';
import queryClient from '@/network/queryClient';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/globalContext';
import Toggle from '@/components/toggle';
import Button from '@/components/button';
import Text from '@/components/text';
import { projectPassword as validationSchema } from '@/lib/validationSchemas';

/**
 * MacOSWindowShell
 *
 * Wraps any page content in a draggable, resizable macOS-style floating window.
 * Used by /project/[id]/index, /project/[id]/editor, and /project/[id]/preview
 * when the user's template is 4 (macOS mode).
 *
 * Props:
 *   title       – window title shown in the title bar
 *   projectUrl  – optional; when set, shown in the address bar (e.g. https://username.designfolio.me/project/id)
 *   children    – page content to render inside the window
 *   tabs        – optional array of { label, href } for tab switching (Preview / Editor)
 *   activeTab   – currently active tab label
 */
// logged-in header (62px) + macOS menu bar (28px)
const TOP_OFFSET = 90;

const MacOSWindowShell = ({
  title = 'Project',
  children,
  tabs,
  activeTab,
  canManage = false,
  isHidden = false,
  hasPassword = false,
  projectId,
  /** When set, shown in the address bar instead of the title-based fake URL */
  projectUrl = '',
  initialPassword = '',
  onDelete,
  onToggleVisibility,
}) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    userDetails,
    setUserDetails,
    popoverMenu,
    setPopoverMenu,
  } = useGlobalContext();

  const [pos, setPos] = useState(null); // null = not yet initialised (SSR safe)
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [isPasswordEnabled, setIsPasswordEnabled] = useState(!!hasPassword);
  const [showEye, setShowEye] = useState(false);

  const effectiveProjectId = projectId || router.query.id;

  const validationSchema = Yup.object().shape({
    password: isPasswordEnabled
      ? Yup.string()
        .required('Password is required.')
        .min(6, 'Password is too short - should be 6 chars minimum.')
      : Yup.string().min(
        6,
        'Password is too short - should be 6 chars minimum.'
      ),
  });

  const updateProjectCache = (key, value) => {
    if (!userDetails || !effectiveProjectId) return;

    const updatedProjects = (userDetails.projects || []).map((item) =>
      item._id === effectiveProjectId ? { ...item, [key]: value } : item
    );

    setUserDetails((prev) =>
      prev ? { ...prev, projects: updatedProjects } : prev
    );

    queryClient.setQueriesData({ queryKey: ['userDetails'] }, (oldData) => {
      if (!oldData?.user) return oldData;
      return { user: { ...oldData.user, projects: updatedProjects } };
    });
  };

  const handlePasswordToggleProtected = async () => {
    if (!effectiveProjectId) return;
    try {
      const res = await _updateProject(effectiveProjectId, {
        protected: !isPasswordEnabled,
      });
      const nextProtected = !!res?.data?.project?.protected;
      updateProjectCache('protected', nextProtected);
      setIsPasswordEnabled(nextProtected);
      toast.success(
        nextProtected ? 'Password protection enabled.' : 'Password protection disabled.'
      );
    } catch (e) {
      console.error('Error toggling password protection:', e);
      toast.error('Unable to update password protection. Please try again.');
    }
  };

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);

  // Centre the window on first mount (client only).
  // Top offset = logged-in header (62px) + macOS menu bar (28px) = 90px.
  useEffect(() => {
    setPos({
      x: Math.max(0, window.innerWidth / 2 - 480),
      y: 100,
    });
  }, []);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const handleTitleBarMouseDown = useCallback((e) => {
    if (isMaximized || isMobile) return;
    e.preventDefault();
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }, [isMaximized, isMobile, pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      setPos({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        // Don't allow dragging above the header + menu bar
        y: Math.max(TOP_OFFSET, e.clientY - dragOffset.current.y),
      });
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleClose = () => router.back();
  const handleMinimize = () => setIsMinimized((p) => !p);
  const handleMaximize = () => setIsMaximized((p) => !p);

  if (isMinimized || pos === null) return null;

  // ── Styles ────────────────────────────────────────────────────────────────
  const sizeStyles = isMaximized || isMobile
    ? {
      left: 0,
      top: isMobile ? '50px' : `${TOP_OFFSET}px`,
      width: '100vw',
      height: isMobile ? 'calc(100vh - 160px)' : `calc(100vh - ${TOP_OFFSET + 80}px)`,
      transform: 'none',
      borderRadius: 0,
    }
    : {
      left: pos.x,
      top: pos.y,
      width: '960px',
      maxWidth: '96vw',
      height: '78vh',
      transform: 'none',
      borderRadius: '10px',
    };

  return (
    <div
      ref={windowRef}
      className="fixed z-[300] flex flex-col overflow-hidden bg-[#faf9f6] border border-[#d1d1d1] shadow-2xl pointer-events-auto"
      style={sizeStyles}
    >
      {/* ── Title bar ── */}
      <div
        onMouseDown={handleTitleBarMouseDown}
        className={`h-9 shrink-0 bg-[#f6f6f6] border-b border-[#d1d1d1] flex items-center px-3 justify-between select-none
          ${isMobile || isMaximized ? 'cursor-default' : 'cursor-move active:cursor-grabbing'}`}
      >
        <div className="flex gap-2 items-center">

          <div className="text-[12px] font-medium text-[#444] flex items-center gap-1 ml-2">
            <span className="opacity-70">🌐</span>
            <span className="font-sans truncate max-w-[240px] md:max-w-[360px]">
              {title}
            </span>
          </div>
        </div>

        {/* Right-side controls */}
        <div className="flex items-center gap-1 text-[#666] shrink-0">
          <button type="button" className="p-1 rounded hover:bg-black/10 transition-colors" onClick={handleMinimize} title="Minimize">
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-black/10 transition-colors" onClick={handleMaximize} title="Maximize">
            <Square className="w-3 h-3" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-red-500/20 hover:text-red-600 transition-colors" onClick={handleClose} title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Toolbar (address bar + actions) ── */}
      <MacOSProjectToolbar
        projectUrl={projectUrl ? `${projectUrl}${activeTab ? `/${activeTab.toLowerCase()}` : ''}` : `https://${(title || 'project').toLowerCase().replace(/\s+/g, '-')}.com`}
        onBack={() => router.back()}
        rightSlot={canManage && (
          <div className="flex items-center gap-1 border-l border-[#d1d1d1] ml-1 pl-2">
            {onDelete && (
              <button
                type="button"
                className="p-1.5 hover:bg-red-50 text-red-500/70 hover:text-red-500 rounded transition-colors"
                title="Delete Project"
                onClick={onDelete}
              >
                <Trash2 size={14} />
              </button>
            )}
            {onToggleVisibility && (
              <button
                type="button"
                className="p-1.5 hover:bg-black/5 text-[#666] rounded transition-colors"
                title={isHidden ? 'Unhide Project' : 'Hide Project'}
                onClick={onToggleVisibility}
              >
                {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}

            {/* Password popover (macOS toolbar) */}
            {effectiveProjectId && (
              <div
                className="relative"
                data-popover-id={popovers.password}
              >
                <button
                  type="button"
                  className="p-1.5 hover:bg-black/5 text-[#666] rounded transition-colors"
                  title={isPasswordEnabled ? 'Edit Password' : 'Add Password'}
                  onClick={() =>
                    setPopoverMenu((prev) =>
                      prev === popovers.password ? null : popovers.password
                    )
                  }
                >
                  <Lock size={14} />
                </button>

                <div
                  className={`pt-2 origin-top-right absolute z-20 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.password
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-90 pointer-events-none'
                    }`}
                >
                  <div className="w-[350px] md:w-[386px] bg-popover-bg-color rounded-2xl shadow-lg border-[5px] border-popover-border-color p-2">
                    <Formik
                      initialValues={{
                        password: initialPassword || '',
                      }}
                      enableReinitialize
                      validateOnChange
                      validateOnBlur
                      validationSchema={validationSchema}
                      onSubmit={async (values, actions) => {
                        if (!effectiveProjectId) return;
                        try {
                          const res = await _updateProject(effectiveProjectId, {
                            password: values.password,
                          });
                          const updatedPassword = res?.data?.project?.password;
                          const updatedProtected =
                            !!res?.data?.project?.protected;

                          updateProjectCache('password', updatedPassword);
                          updateProjectCache('protected', updatedProtected);
                          setIsPasswordEnabled(updatedProtected);
                          toast.success('Password has been updated.');
                          setPopoverMenu(null);
                        } catch (e) {
                          console.error('Error updating password:', e);
                          toast.error(
                            'Unable to update password. Please try again.'
                          );
                        } finally {
                          actions.setSubmitting(false);
                        }
                      }}
                    >
                      {({ isSubmitting, errors, touched, validateField }) => (
                        <Form id="macProjectPasswordForm" autoComplete="off">
                          <div className="bg-input-password-bg-color rounded-lg py-4 px-3 transition-all">
                            <div className="flex justify-between gap-[12px] items-center">
                              <div>
                                <Text
                                  size="p-xxsmall"
                                  className="font-medium text-input-password-heading-color"
                                >
                                  Set Password
                                </Text>
                                <Text
                                  size="p-xxsmall"
                                  className="font-medium text-input-password-description-color"
                                >
                                  Protect your project if you&apos;ve an NDA.
                                </Text>
                              </div>
                              <Toggle
                                onClick={handlePasswordToggleProtected}
                                value={isPasswordEnabled}
                              />
                            </div>

                            {isPasswordEnabled && (
                              <>
                                <div className="relative mt-2">
                                  <Field
                                    name="password"
                                    type={showEye ? 'text' : 'password'}
                                    className={`text-input mt-2 ${errors.password &&
                                      touched.password &&
                                      '!text-input-error-color !border-input-error-color !shadow-input-error-shadow'
                                      }`}
                                    placeholder="Password"
                                    autoComplete="new-password"
                                  />
                                  <div
                                    className="absolute top-[24px] right-4 cursor-pointer"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setShowEye((prev) => !prev);
                                      validateField('password');
                                    }}
                                  >
                                    {showEye ? (
                                      <EyeOff className="w-4 h-4 text-df-icon-color" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-df-icon-color" />
                                    )}
                                  </div>
                                </div>
                                <ErrorMessage
                                  name="password"
                                  component="div"
                                  className="error-message"
                                />
                              </>
                            )}
                          </div>

                          {isPasswordEnabled && (
                            <div className="flex gap-2 justify-end mt-4">
                              <Button
                                text="Cancel"
                                onClick={() => setPopoverMenu(null)}
                                type="secondary"
                              />
                              <Button
                                type="modal"
                                text="Change"
                                isLoading={isSubmitting}
                                btnType="submit"
                                form="macProjectPasswordForm"
                              />
                            </div>
                          )}
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      />
      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-white">
        {children}
      </div>
    </div>
  );
};

export default MacOSWindowShell;
