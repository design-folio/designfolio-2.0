import React from 'react';

const ContactWindow = ({ contactInfo, fullName, onOpenPdf, edit, onEdit }) => {
  const hasSocials = contactInfo.linkedin || contactInfo.twitter || contactInfo.instagram || contactInfo.dribbble;
  const hasBlogs = contactInfo.blogs;

  return (
    <div className="w-full h-full bg-white flex flex-col font-azeretMono text-[#37352f]">
      {/* Header */}
      <div className="px-10 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-2 opacity-50 text-sm">
          <span>📂</span>
          <span>Contacts</span>
          <span>/</span>
          <span>contact.mdx</span>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-[#37352f]">Get in touch</h1>
      </div>

      {/* Content */}
      <div className="px-10 pb-20 space-y-8 overflow-y-auto">
        {/* Contact Details */}
        <section>
          <div className="flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4">
            <span className="text-xl">📧</span>
            <h2 className="text-lg font-semibold">Contact Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactInfo.contact_email && (
              <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer group">
                <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Email</div>
                <div className="font-medium">{contactInfo.contact_email}</div>
              </div>
            )}
            {contactInfo.phone && (
              <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer group">
                <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Phone</div>
                <div className="font-medium">{contactInfo.phone}</div>
              </div>
            )}
            <div
              className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer group"
              onClick={() => onOpenPdf(`${fullName}_Resume.pdf`)}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Resume</div>
              <div className="font-medium text-[#007aff] hover:underline">View Resume</div>
            </div>
          </div>
        </section>

        {/* Social Connect */}
        {hasSocials && (
          <section>
            <div className="flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4">
              <span className="text-xl">🌐</span>
              <h2 className="text-lg font-semibold">Social Connect</h2>
            </div>
            <div className="space-y-3">
              {contactInfo.linkedin && (
                <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#0077b5] text-white rounded text-[10px] font-bold">in</span>
                  <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.linkedin}</span>
                </div>
              )}
              {contactInfo.twitter && (
                <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded text-[10px] font-bold">X</span>
                  <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.twitter}</span>
                </div>
              )}
              {contactInfo.instagram && (
                <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded text-[10px] font-bold">IG</span>
                  <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.instagram}</span>
                </div>
              )}
              {contactInfo.dribbble && (
                <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#ea4c89] text-white rounded text-[10px] font-bold">Dr</span>
                  <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.dribbble}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Blogs */}
        {hasBlogs && (
          <section>
            <div className="flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4">
              <span className="text-xl">✍️</span>
              <h2 className="text-lg font-semibold">Blogs</h2>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
              <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded text-[10px] font-bold">M</span>
              <span className="flex-1 border-b border-[#e9e9e7] pb-1 text-[#37352f]">{contactInfo.blogs}</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ContactWindow;
