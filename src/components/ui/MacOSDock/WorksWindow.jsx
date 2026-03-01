import React from 'react';
import { AnimatedFolder } from '../3d-folder';

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
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-x-6 gap-y-10 max-w-4xl mx-auto`}>
          {projects.map((proj, index) => (
            <div
              key={proj.id}
              className={`transform scale-110 origin-center cursor-move transition-all duration-500 ease-in-out ${draggedProjectIndex === index ? 'opacity-50 scale-100 z-50' : 'opacity-100'
                }`}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={onDrop}
            >
              <AnimatedFolder
                title={proj.name}
                projects={[
                  { id: `${proj.id}-1`, title: proj.name, image: proj.icon },
                  { id: `${proj.id}-2`, title: 'Documentation', image: '📄' },
                  { id: `${proj.id}-3`, title: 'Assets', image: '🎨' },
                ]}
                onProjectClick={(project) =>
                  onProjectClick({ ...project, title: proj.name, image: proj.icon, slug: proj.slug })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default WorksWindow;
