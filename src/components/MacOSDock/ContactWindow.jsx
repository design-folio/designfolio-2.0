import React from 'react';

const ContactWindow = ({ contactInfo, fullName, onOpenPdf, edit, onEdit }) => (
  <div className="w-full h-full bg-white flex flex-col font-sans text-[#37352f]">
    <div className="px-10 pt-12 pb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4 opacity-50 text-sm">
          <span>📂</span><span>Contacts</span><span>/</span><span>contact.mdx</span>
        </div>

      </div>
      <h1 className="text-4xl font-bold mb-8 text-[#37352f]">Get in touch</h1>
    </div>

    <div className="px-10 pb-20 space-y-8 overflow-y-auto">
      {/* Contact Details */}
      <section>
        <div className="flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4">
          <span className="text-xl">📧</span>
          <h2 className="text-lg font-semibold">Contact Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactInfo.email && (
            <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer">
              <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Email</div>
              <div className="font-medium">{contactInfo.email}</div>
            </div>
          )}
          {contactInfo.github && (
            <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer">
              <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">GitHub</div>
              <div className="font-medium">{contactInfo.github}</div>
            </div>
          )}
          {contactInfo.linkedin && (
            <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer">
              <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">LinkedIn</div>
              <div className="font-medium">{contactInfo.linkedin}</div>
            </div>
          )}
          <div
            className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer"
            onClick={() => onOpenPdf(`${fullName}_Resume.pdf`)}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Resume</div>
            <div className="font-medium text-[#007aff] hover:underline">View Resume</div>
          </div>
        </div>
      </section>

      {/* Social links */}
      {(contactInfo.twitter || contactInfo.dribbble || contactInfo.behance || contactInfo.instagram || contactInfo.medium || contactInfo.notion) && (
        <section>
          <div className="flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4">
            <span className="text-xl">🌐</span>
            <h2 className="text-lg font-semibold">Social Connect</h2>
          </div>
          <div className="space-y-3">
            {contactInfo.twitter && (
              <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded text-[10px] font-bold">X</span>
                <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.twitter}</span>
              </div>
            )}
            {contactInfo.instagram && (
              <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                <span className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded text-[10px] font-bold">Ig</span>
                <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.instagram}</span>
              </div>
            )}
            {contactInfo.dribbble && (
              <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                <span className="w-6 h-6 flex items-center justify-center bg-[#ea4c89] text-white rounded text-[10px] font-bold">Dr</span>
                <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.dribbble}</span>
              </div>
            )}
            {contactInfo.behance && (
              <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                <span className="w-6 h-6 flex items-center justify-center bg-[#1769ff] text-white rounded text-[10px] font-bold">Be</span>
                <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.behance}</span>
              </div>
            )}
            {contactInfo.medium && (
              <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded text-[10px] font-bold">M</span>
                <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.medium}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  </div>
);

export default ContactWindow;
