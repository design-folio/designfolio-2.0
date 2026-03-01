import React from 'react';
import { Info } from 'lucide-react';
import { AnimatedFolder } from '../ui/3d-folder';
import { Alert } from '../ui/alert';

const FAVORITES = [
  { name: 'AirDrop', icon: '📡' },
  { name: 'Recents', icon: '🕒' },
  { name: 'Applications', icon: '🚀' },
  { name: 'Desktop', icon: '🖥️' },
  { name: 'Documents', icon: '📄' },
  { name: 'Downloads', icon: '⬇️' },
];

const WorksWindow = ({
  isMobile,
  fullName,
  projects,
  draggedProjectIndex,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onProjectClick,
  edit,
}) => (
  <div className="flex h-full bg-[#faf9f6]">
    {/* Finder Sidebar */}
    <div className={`w-44 bg-[#ebe9e4]/50 backdrop-blur-md border-r border-[#d1d1d1] p-3 flex flex-col gap-6 ${isMobile ? 'hidden' : 'flex'}`}>
      <div>
        <div className="text-[10px] font-bold text-[#8e8c87] uppercase tracking-wider mb-2 px-2">Favorites</div>
        <div className="flex flex-col gap-0.5">
          {FAVORITES.map((item) => (
            <div
              key={item.name}
              className={`px-2 py-1.5 rounded-md text-[11px] flex items-center gap-2 cursor-pointer transition-colors ${item.name === 'Desktop'
                ? 'bg-[#d1cfca] text-[#222] font-semibold'
                : 'text-[#555] hover:bg-[#e1dfda]'
                }`}
            >
              <span className="text-sm opacity-80">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold text-[#8e8c87] uppercase tracking-wider mb-2 px-2">Tags</div>
        <div className="flex flex-col gap-1.5 px-2">
          <div className="flex items-center gap-2 text-[10px] text-[#555] cursor-pointer hover:text-[#222]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-sm" /> Work
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#555] cursor-pointer hover:text-[#222]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shadow-sm" /> Personal
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#555] cursor-pointer hover:text-[#222]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c841] shadow-sm" /> Important
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-8 border-b border-[#e0ddd8] flex items-center px-4 gap-2 text-[10px] text-[#888] bg-[#fdfdfb]">
        <span>Macintosh HD</span>
        <span className="opacity-40">›</span>
        <span>Users</span>
        <span className="opacity-40">›</span>
        <span>{fullName}</span>
        <span className="opacity-40">›</span>
        <span className="text-[#444] font-medium">Projects</span>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {edit && (
          <Alert className="max-w-4xl mx-auto mb-6 bg-blue-50/50 border-blue-200/50 text-blue-700 py-2 shadow-sm">
            <Info size={16} className="text-blue-500" />
            <span className="text-xs font-medium">Tip: You can re-arrange projects by dragging them into your preferred order.</span>
          </Alert>
        )}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-x-6 gap-y-10 max-w-4xl mx-auto`}>
          {projects.map((proj, index) => {
            const id = proj._id || proj.id;
            const title = proj.title || proj.name || `Project ${index + 1}`;
            const thumbnail = proj.thumbnail?.url || proj.icon;
            const slug = proj.slug || proj._id || proj.id;
            return (
              <div
                key={id}
                className={`transform scale-110 origin-center transition-all duration-500 ease-in-out ${edit ? 'cursor-move' : 'cursor-pointer'} ${draggedProjectIndex === index ? 'opacity-50 scale-100 z-50' : 'opacity-100'}`}
                draggable={edit}
                onDragStart={edit ? (e) => onDragStart(e, index) : undefined}
                onDragEnd={edit ? onDragEnd : undefined}
                onDragOver={edit ? (e) => onDragOver(e, index) : undefined}
                onDrop={edit ? onDrop : undefined}
              >
                <AnimatedFolder
                  title={title}
                  projects={[{ id, title, image: thumbnail }]}
                  onProjectClick={() =>
                    onProjectClick({ id, title, image: thumbnail, slug })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

export default WorksWindow;
