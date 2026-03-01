import React from 'react';
import HomeWindow from './HomeWindow';
import WorksWindow from './WorksWindow';
import WorkExperienceWindow from './WorkExperienceWindow';
import AboutWindow from './AboutWindow';
import ContactWindow from './ContactWindow';

/**
 * Routes to the correct window content component based on appId.
 * Derives fullName, workExperiences, and contactInfo from userDetails internally.
 */
const WindowContent = ({
  appId,
  userDetails,
  isMobile,
  projects,
  draggedProjectIndex,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onProjectClick,
  onOpenPdf,
  onViewProjects,
  edit,
  onEditContact,
}) => {
  const fullName = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ') || 'Portfolio';
  const workExperiences = userDetails?.experiences || [];
  const contactInfo = {
    email: userDetails?.socials?.email || 'hello@example.com',
    github: userDetails?.socials?.github || '',
    linkedin: userDetails?.socials?.linkedin || '',
    twitter: userDetails?.socials?.twitter || '',
    dribbble: userDetails?.socials?.dribbble || '',
    behance: userDetails?.socials?.behance || '',
  };
  console.log(contactInfo)
  switch (appId) {
    case 'works':
      return (
        <WorksWindow
          isMobile={isMobile}
          fullName={fullName}
          projects={projects}
          draggedProjectIndex={draggedProjectIndex}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onProjectClick={onProjectClick}
        />
      );
    case 'work_experience':
      return <WorkExperienceWindow workExperiences={workExperiences} />;
    case 'about':
      return <AboutWindow userDetails={userDetails} fullName={fullName} />;
    case 'contact':
      return <ContactWindow contactInfo={contactInfo} fullName={fullName} onOpenPdf={onOpenPdf} edit={edit} onEdit={onEditContact} />;
    default:
      return (
        <HomeWindow
          userDetails={userDetails}
          fullName={fullName}
          onViewProjects={onViewProjects}
        />
      );
  }
};

export default WindowContent;
